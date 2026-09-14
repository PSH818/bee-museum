import { ContactShadows, Float, Html, OrbitControls } from "@react-three/drei";
import {
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { BeeFocusId } from "../../data/bees/western-honeybee-worker";
import type { OrganEntry } from "../../data/schemas/content";
import { boundsRadius, DEFAULT_BEE_ROTATION } from "../core/coordinates";
import type { BeeAnchorId, BeeCaste } from "../bees/types";
import { applyHoneyBeeIdleMotion } from "../bees/motion/worker-idle";
import type { WesternHoneyBeeSpecimen } from "../bees/species/apis-mellifera-worker";
import { applyHeroIdleMotion } from "../bees/species/apis-mellifera-worker-hero";
import { loadSpecimen, type SpecimenId } from "../registry/specimen-registry";

interface ViewerProps {
  /** 蜂种 id(如 apis-mellifera / apis-cerana) */
  species?: string;
  caste: BeeCaste;
  focus: BeeFocusId;
  motion: boolean;
  onFocus: (focus: BeeFocusId) => void;
  /** 器官条目 → 模型热点(锚点定位,前端方案 §8.1) */
  organs?: OrganEntry[];
  selectedOrganId?: string | null;
  onSelectOrgan?: (organId: string | null) => void;
  /** visual-regression mode: name of a fixed camera view (see VR_VIEWS) */
  fixedView?: string | null;
  /** 隐藏的图层(工作台"图层"工具):fur / wings / pollen */
  hiddenLayers?: readonly string[];
  /** 单独显示(工作台"单独显示"工具):非当前聚焦部位切换为幽灵材质 */
  isolate?: boolean;
  /** 一次性机位请求(工作台"视角"工具):seq 变化时把相机摆到指定基线机位 */
  viewRequest?: { view: string; seq: number } | null;
  /** 一次性推近/拉远请求(工作台"放大"工具) */
  zoomRequest?: { dir: 1 | -1; seq: number } | null;
  /** 变化时让镜头 rig 重新飞向当前聚焦(工作台"重置"工具) */
  rigNudge?: number;
  /** 变化时立刻释放镜头 rig(一次性机位/推近后不再回拉) */
  rigHalt?: number;
  /** 标注点点击模式:popover 两级(浮卡→详情);direct 直接进详情(移动端) */
  hotspotMode?: "popover" | "direct";
  /** 标本加载就绪/卸载时回调(工作台用来淡出首屏海报) */
  onReady?: (ready: boolean) => void;
}

declare global {
  interface Window {
    /** set once the specimen finished loading — polled by Playwright */
    __specimenReady?: boolean;
    /** 每完成一次标本加载 +1,资源释放测试用它等待重载完成 */
    __specimenGeneration?: number;
    /** 聚焦镜头收敛并吸附后置 true — 视觉回归等它而不是掐秒表 */
    __cameraSettled?: boolean;
    /** 测试与调试钩子:读取 GL 资源数量、触发标本重载(§15.2) */
    __beeDebug?: {
      glInfo: () => { geometries: number; textures: number };
      reloadSpecimen: () => void;
    };
  }
}

// fixed camera setups for visual-regression baselines (tech plan §15.3):
// front / side / back / organ macro, all in world coordinates
const VR_VIEWS: Record<
  string,
  { position: THREE.Vector3Tuple; target: THREE.Vector3Tuple }
> = {
  front: { position: [-5.4, 0.6, -0.9], target: [0.05, 0.2, 0] },
  side: { position: [0.1, 0.7, 7.1], target: [0.1, 0.2, 0] },
  back: { position: [5.6, 0.7, 1.0], target: [0.05, 0.2, 0] },
  macro: { position: [-2.3, 0.75, 1.9], target: [-0.3, 0.3, -0.05] },
};

const focusAnchors: Record<BeeFocusId, BeeAnchorId> = {
  whole: "whole",
  head: "head",
  wing: "foreWingR",
  abdomen: "abdomen",
  leg: "leg",
};

export function WesternHoneyBeeViewer({
  species = "apis-mellifera",
  caste,
  focus,
  motion,
  onFocus,
  organs = [],
  selectedOrganId = null,
  onSelectOrgan,
  fixedView = null,
  hiddenLayers,
  isolate = false,
  viewRequest = null,
  zoomRequest = null,
  rigNudge = 0,
  rigHalt = 0,
  hotspotMode = "popover",
  onReady,
}: ViewerProps) {
  const [reloadToken, setReloadToken] = useState(0);
  const specimen = useHoneyBeeSpecimen(species, caste, fixedView, reloadToken);
  useEffect(() => {
    onReady?.(Boolean(specimen));
  }, [specimen, onReady]);

  // 图层可见性:绒毛(fuzz*)/ 翅(fore|hindWing*)/ 花粉团(pollen*)
  useEffect(() => {
    if (!specimen) return;
    const hidden = new Set(hiddenLayers ?? []);
    specimen.root.traverse((object) => {
      if (/^fuzz/.test(object.name)) object.visible = !hidden.has("fur");
      else if (/^(foreWing|hindWing)/.test(object.name)) object.visible = !hidden.has("wings");
      else if (/^pollen/.test(object.name)) object.visible = !hidden.has("pollen");
    });
  }, [specimen, hiddenLayers]);

  // 单独显示:非目标部位换成幽灵材质(同色、透明、不投影、不写深度)
  const ghostMaterials = useRef(new Map<THREE.Material, THREE.Material>());
  const isolating = isolate && focus !== "whole";
  useEffect(() => {
    if (!specimen) return;
    const cache = ghostMaterials.current;
    const focusOf = (object: THREE.Object3D): string | undefined => {
      let current: THREE.Object3D | null = object;
      while (current && current !== specimen.root) {
        if (current.userData.focusId) return current.userData.focusId as string;
        current = current.parent;
      }
      return undefined;
    };
    const toGhost = (material: THREE.Material) => {
      let ghost = cache.get(material);
      if (!ghost) {
        ghost = material.clone();
        ghost.transparent = true;
        ghost.opacity = 0.12;
        ghost.depthWrite = false;
        cache.set(material, ghost);
      }
      return ghost;
    };
    specimen.root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      if (!object.userData.__origMaterial) {
        object.userData.__origMaterial = object.material;
        object.userData.__origCastShadow = object.castShadow;
      }
      const ghosted = isolating && focusOf(object) !== focus;
      const original = object.userData.__origMaterial as THREE.Material | THREE.Material[];
      object.material = ghosted
        ? Array.isArray(original)
          ? original.map(toGhost)
          : toGhost(original)
        : original;
      object.castShadow = ghosted ? false : (object.userData.__origCastShadow as boolean);
    });
  }, [specimen, isolating, focus]);
  useEffect(() => {
    const cache = ghostMaterials.current;
    return () => {
      cache.forEach((ghost) => ghost.dispose());
      cache.clear();
    };
  }, [specimen]);
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  // 标注点两级点击:第一次点弹小浮卡,再点(或浮卡里点"详情")才进入器官模式
  const [previewOrganId, setPreviewOrganId] = useState<string | null>(null);
  useEffect(() => {
    setPreviewOrganId(null);
  }, [specimen, isolate]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewOrganId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const vrView = fixedView ? VR_VIEWS[fixedView] : undefined;
  const { gl } = useThree();

  useEffect(() => {
    window.__beeDebug = {
      glInfo: () => ({
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
      }),
      reloadSpecimen: () => setReloadToken((token) => token + 1),
    };
    return () => {
      delete window.__beeDebug;
    };
  }, [gl]);

  return (
    <>
      <StageSetting />

      {specimen && (
        <>
          {fixedView === "focus-head" ? (
            <FocusViewCamera specimen={specimen} anchorId="head" />
          ) : vrView ? (
            <FixedViewCamera view={vrView} />
          ) : (
            <SpecimenCameraRig
              specimen={specimen}
              focus={focus}
              controlsRef={controlsRef}
              nudge={rigNudge}
              halt={rigHalt}
            />
          )}
          {!fixedView && <OneShotView request={viewRequest} controlsRef={controlsRef} />}
          {!fixedView && <ZoomPulse request={zoomRequest} controlsRef={controlsRef} />}
          <Float
            speed={motion ? 1.2 : 0}
            rotationIntensity={motion ? 0.08 : 0}
            floatIntensity={motion ? 0.18 : 0}
          >
            <group
              position={[0.15, -0.05, 0]}
              rotation={DEFAULT_BEE_ROTATION}
              scale={0.5}
            >
              {/* 热点与标签作为模型子节点渲染:锚点存的是根节点局部坐标,
                  只有挂在模型内部才能正确继承缩放 */}
              <AnimatedSpecimen
                specimen={specimen}
                motion={motion}
                onFocus={(next) => {
                  // 点模型部位:收浮卡、退出器官模式,再切聚焦
                  setPreviewOrganId(null);
                  onSelectOrgan?.(null);
                  onFocus(next);
                }}
                onMiss={() => setPreviewOrganId(null)}
              >
                {!fixedView && onSelectOrgan && (
                  <OrganHotspots
                    specimen={specimen}
                    organs={isolating ? organs.filter((organ) => organ.focusId === focus) : organs}
                    selectedOrganId={selectedOrganId}
                    onSelectOrgan={onSelectOrgan}
                    onFocus={onFocus}
                    previewOrganId={previewOrganId}
                    onPreview={setPreviewOrganId}
                    mode={hotspotMode}
                  />
                )}
                {focus !== "whole" && (
                  <AnchorLabel specimen={specimen} focus={focus} />
                )}
              </AnimatedSpecimen>
            </group>
          </Float>
        </>
      )}

      {!fixedView && (
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          minDistance={4.2}
          maxDistance={12.5}
          minPolarAngle={Math.PI * 0.08}
          maxPolarAngle={Math.PI * 0.72}
          autoRotate={motion && focus === "whole"}
          autoRotateSpeed={0.28}
        />
      )}
    </>
  );
}

/** 聚焦态基线相机:按锚点世界坐标 + 观察器同款距离公式直接定位,
    无插值,可在 demand 渲染循环下工作;锚点缩放类回归依然会被它捕获 */
function FocusViewCamera({
  specimen,
  anchorId,
}: {
  specimen: WesternHoneyBeeSpecimen;
  anchorId: BeeAnchorId;
}) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    specimen.anchors[anchorId].getWorldPosition(target);
    const distance = boundsRadius(specimen.bounds) * 1.5;
    camera.position.set(target.x, target.y + 0.16, target.z + distance);
    camera.lookAt(target);
  });
  return null;
}

function FixedViewCamera({
  view,
}: {
  view: { position: THREE.Vector3Tuple; target: THREE.Vector3Tuple };
}) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.fromArray(view.position);
    camera.lookAt(...view.target);
  });
  return null;
}

/** 共享舞台环境:浅色"标本台"灯光、雾、地面与接触阴影。
    单体观察器与比较台使用同一套,保证观感一致。 */
export function StageSetting({
  fogRange = [10, 17] as [number, number],
}: {
  /** 比较台机位更远,雾要相应外推,否则标本被雾洗白 */
  fogRange?: [number, number];
}) {
  return (
    <>
      <fog attach="fog" args={["#f2e9d5", fogRange[0], fogRange[1]]} />
      <StudioEnvironment />
      <ambientLight intensity={0.5} color="#fff6e4" />
      <directionalLight
        castShadow
        position={[-4, 6, 5]}
        intensity={2.4}
        color="#fff1d6"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <rectAreaLight
        position={[-2.5, 3.5, 4.5]}
        rotation={[-0.45, -0.35, 0]}
        width={5}
        height={4}
        intensity={2.0}
        color="#ffedc2"
      />
      <rectAreaLight
        position={[3.6, 1.8, -3.8]}
        rotation={[0.2, 2.35, 0]}
        width={3}
        height={4}
        intensity={3.2}
        color="#ffb054"
      />
      <directionalLight
        position={[4.5, 2.6, -4.6]}
        intensity={1.0}
        color="#ffa838"
      />
      <directionalLight
        position={[-2, -1, 4]}
        intensity={0.55}
        color="#dfe9ff"
      />
      <pointLight position={[3.5, -0.5, 3]} intensity={2} distance={8} color="#e8a24a" />
      <mesh
        position={[0, -0.79, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[5.2, 96]} />
        <meshStandardMaterial
          color="#e8dcbd"
          roughness={1}
          transparent
          opacity={0.85}
        />
      </mesh>
      <ContactShadows
        position={[0, -0.775, 0]}
        scale={8.5}
        opacity={0.3}
        blur={2.6}
        far={4.5}
        color="#3a2c12"
        frames={1}
      />
    </>
  );
}

function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const previousEnvironment = scene.environment;
    const previousExposure = gl.toneMappingExposure;
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    gl.toneMappingExposure = 1.0;

    return () => {
      scene.environment = previousEnvironment;
      gl.toneMappingExposure = previousExposure;
      target.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

function useHoneyBeeSpecimen(
  species: string,
  caste: BeeCaste,
  fixedView: string | null = null,
  reloadToken = 0,
): WesternHoneyBeeSpecimen | null {
  const [specimen, setSpecimen] = useState<WesternHoneyBeeSpecimen | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    let owned: WesternHoneyBeeSpecimen | null = null;
    setSpecimen(null);
    window.__specimenReady = false;

    const options = {
      caste,
      // baselines must not depend on the runner's devicePixelRatio
      quality: fixedView
        ? ("high" as const)
        : window.devicePixelRatio > 1.5
          ? ("high" as const)
          : ("medium" as const),
      seed: 1,
      pollenLoad: caste === "worker" ? 0.55 : 0,
    };
    // every species/caste leads with its baked hero asset (hybrid pipeline);
    // fall back to the procedural build if the GLB is unavailable
    const heroId = `${species}-${caste}-hero` as SpecimenId;
    const proceduralId = `${species}-${caste}` as SpecimenId;
    const load = loadSpecimen(heroId, options).catch(() =>
      loadSpecimen(proceduralId, options),
    );

    void load.then((next) => {
      if (cancelled) {
        next.dispose();
        return;
      }
      owned = next;
      setSpecimen(next);
      window.__specimenReady = true;
      window.__specimenGeneration = (window.__specimenGeneration ?? 0) + 1;
    });

    return () => {
      cancelled = true;
      owned?.dispose();
    };
  }, [species, caste, fixedView, reloadToken]);

  return specimen;
}

function AnimatedSpecimen({
  specimen,
  motion,
  onFocus,
  onMiss,
  children,
}: {
  specimen: WesternHoneyBeeSpecimen;
  motion: boolean;
  onFocus: (focus: BeeFocusId) => void;
  /** 点击落空(空白处)时回调:用于收起标注点浮卡 */
  onMiss?: () => void;
  children?: ReactNode;
}) {
  const isHero = specimen.metadata.id.endsWith("-hero");
  useFrame((state) => {
    if (isHero) {
      applyHeroIdleMotion(specimen, state.clock.elapsedTime, motion);
    } else {
      applyHoneyBeeIdleMotion(specimen, state.clock.elapsedTime, motion);
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    let current: THREE.Object3D | null = event.object;
    while (current && current !== specimen.root) {
      const focusId = current.userData.focusId as BeeFocusId | undefined;
      if (focusId) {
        onFocus(focusId);
        return;
      }
      current = current.parent;
    }
    onFocus("whole");
  };

  return (
    <primitive object={specimen.root} onClick={handleClick} onPointerMissed={onMiss}>
      {children}
    </primitive>
  );
}

/** 一次性机位:seq 变化时把相机摆到指定基线机位,随后交还轨道控制 */
function OneShotView({
  request,
  controlsRef,
}: {
  request: { view: string; seq: number } | null;
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>;
}) {
  const { camera } = useThree();
  useEffect(() => {
    if (!request) return;
    const pose = VR_VIEWS[request.view];
    if (!pose) return;
    camera.position.fromArray(pose.position);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.fromArray(pose.target);
      controls.update();
    } else {
      camera.lookAt(...pose.target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.seq]);
  return null;
}

/** 一次性推近/拉远:绕当前观察目标按比例缩放相机距离(限位与轨道控制一致) */
function ZoomPulse({
  request,
  controlsRef,
}: {
  request: { dir: 1 | -1; seq: number } | null;
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>;
}) {
  const { camera } = useThree();
  useEffect(() => {
    if (!request) return;
    const controls = controlsRef.current;
    if (!controls) return;
    const target = controls.target as THREE.Vector3;
    const offset = camera.position.clone().sub(target);
    const factor = request.dir > 0 ? 0.62 : 1 / 0.62;
    const length = THREE.MathUtils.clamp(offset.length() * factor, 4.2, 12.5);
    camera.position.copy(target).add(offset.setLength(length));
    controls.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.seq]);
  return null;
}

function SpecimenCameraRig({
  specimen,
  focus,
  controlsRef,
  nudge = 0,
  halt = 0,
}: {
  specimen: WesternHoneyBeeSpecimen;
  focus: BeeFocusId;
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>;
  nudge?: number;
  halt?: number;
}) {
  const { camera } = useThree();
  const moving = useRef(true);
  const startedAt = useRef(0);
  const worldTarget = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const distance = boundsRadius(specimen.bounds);

  useEffect(() => {
    moving.current = true;
    startedAt.current = performance.now();
    window.__cameraSettled = false;
  }, [focus, specimen, nudge]);

  // 一次性机位/推近生效时,rig 立即交出镜头,不再往聚焦目标回拉
  useEffect(() => {
    if (halt === 0) return;
    moving.current = false;
    window.__cameraSettled = true;
  }, [halt]);

  // 用户一开始拖动就交出镜头:否则过渡中的插值会把视角"弹回"目标
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const release = () => {
      moving.current = false;
    };
    controls.addEventListener("start", release);
    return () => controls.removeEventListener("start", release);
  }, [controlsRef]);

  useFrame((_, delta) => {
    if (!moving.current) return;
    // 生命动作开着时标本在轻微浮动,锚点永不静止;过渡最长 1.5s 后释放镜头
    if (performance.now() - startedAt.current > 1500) {
      moving.current = false;
      window.__cameraSettled = true;
      return;
    }
    specimen.anchors[focusAnchors[focus]].getWorldPosition(worldTarget);
    const cameraDistance = focus === "whole" ? distance * 2.65 : distance * 1.5;
    desiredPosition.copy(worldTarget).add(
      new THREE.Vector3(0, focus === "whole" ? 0.1 : 0.16, cameraDistance),
    );

    const alpha = 1 - Math.exp(-delta * 2.4);
    camera.position.lerp(desiredPosition, alpha);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(worldTarget, alpha);
      controlsRef.current.update();
    } else {
      camera.lookAt(worldTarget);
    }

    if (
      camera.position.distanceTo(desiredPosition) < 0.018 &&
      (!controlsRef.current || controlsRef.current.target.distanceTo(worldTarget) < 0.01)
    ) {
      // 收敛后吸附到精确位置:终点唯一,聚焦态的视觉基线才可复现
      camera.position.copy(desiredPosition);
      if (controlsRef.current) {
        controlsRef.current.target.copy(worldTarget);
        controlsRef.current.update();
      } else {
        camera.lookAt(worldTarget);
      }
      moving.current = false;
      window.__cameraSettled = true;
    }
  });

  return null;
}

/** 器官热点:每条器官条目在其锚点处渲染一个可点击圆点。
    成对器官优先取左侧锚点(默认机位面向标本左侧)。 */
function OrganHotspots({
  specimen,
  organs,
  selectedOrganId,
  onSelectOrgan,
  onFocus,
  previewOrganId,
  onPreview,
  mode,
}: {
  specimen: WesternHoneyBeeSpecimen;
  organs: OrganEntry[];
  selectedOrganId: string | null;
  onSelectOrgan: (organId: string | null) => void;
  onFocus: (focus: BeeFocusId) => void;
  previewOrganId: string | null;
  onPreview: (organId: string | null) => void;
  mode: "popover" | "direct";
}) {
  return (
    <>
      {organs.map((organ) => {
        const anchorId =
          organ.anchorIds.find((id) => id.endsWith("L")) ?? organ.anchorIds[0];
        const anchor = specimen.anchors[anchorId as BeeAnchorId];
        if (!anchor) return null;
        return (
          <HotspotDot
            key={organ.id}
            organ={organ}
            anchor={anchor}
            active={selectedOrganId === organ.id}
            preview={previewOrganId === organ.id}
            onSelectOrgan={onSelectOrgan}
            onFocus={onFocus}
            onPreview={onPreview}
            mode={mode}
          />
        );
      })}
    </>
  );
}

/** 单个热点:被模型遮挡时淡出而不是硬消失(前端方案 §8.1"背面标签淡出")。
    锚点已由各标本置于部件表面,这里直接使用。 */
function HotspotDot({
  organ,
  anchor,
  active,
  preview,
  onSelectOrgan,
  onFocus,
  onPreview,
  mode,
}: {
  organ: OrganEntry;
  anchor: THREE.Object3D;
  active: boolean;
  preview: boolean;
  onSelectOrgan: (organId: string | null) => void;
  onFocus: (focus: BeeFocusId) => void;
  onPreview: (organId: string | null) => void;
  mode: "popover" | "direct";
}) {
  const [occluded, setOccluded] = useState(false);
  const openDetail = () => {
    onPreview(null);
    onSelectOrgan(organ.id);
    onFocus(organ.focusId as BeeFocusId);
  };
  const summaryLead = organ.summary.split(/[;;。]/)[0] + "。";
  return (
    <Html
      position={anchor.position}
      center
      occlude
      onOcclude={(hidden) => {
        setOccluded(hidden);
        return null; // 接管默认的 display:none 行为
      }}
      zIndexRange={preview ? [70, 0] : [40, 0]}
    >
      <div className="hotspot-wrap">
        <button
          type="button"
          className={
            `hotspot hotspot-${organ.focusId}` +
            (active ? " active" : "") +
            (preview ? " previewing" : "") +
            (occluded ? " occluded" : "")
          }
          aria-label={`查看器官:${organ.name}`}
          aria-pressed={active}
          aria-expanded={preview}
          tabIndex={occluded ? -1 : 0}
          onClick={(event) => {
            event.stopPropagation();
            // 键盘触发(event.detail === 0)与移动端:直接进详情
            if (mode === "direct" || event.detail === 0) {
              openDetail();
              return;
            }
            if (active) {
              onSelectOrgan(null);
              return;
            }
            if (preview) openDetail();
            else onPreview(organ.id);
          }}
        >
          <i />
        </button>
        {!preview && !active && !occluded && (
          <span className="hotspot-tip" aria-hidden="true">
            {organ.name}
          </span>
        )}
        {preview && !occluded && (
          <div className="hotspot-pop" role="dialog" aria-label={organ.name}>
            {organ.latinName && <p className="latin">{organ.latinName}</p>}
            <b>{organ.name}</b>
            <p>{summaryLead}</p>
            <div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onFocus(organ.focusId as BeeFocusId);
                }}
              >
                定位
              </button>
              <button
                type="button"
                className="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  openDetail();
                }}
              >
                详情 →
              </button>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

function AnchorLabel({
  specimen,
  focus,
}: {
  specimen: WesternHoneyBeeSpecimen;
  focus: Exclude<BeeFocusId, "whole">;
}) {
  const anchor = specimen.anchors[focusAnchors[focus]];
  const labels: Record<Exclude<BeeFocusId, "whole">, [string, string]> = {
    head: ["01", "头部"],
    wing: ["02", "翅"],
    abdomen: ["03", "腹部"],
    leg: ["04", "后足"],
  };

  return (
    <Html position={anchor.position} center distanceFactor={7.5}>
      <div className="model-label">
        <i />
        <span>{labels[focus][0]}</span>
        <b>{labels[focus][1]}</b>
      </div>
    </Html>
  );
}
