import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type RefObject,
} from "react";
import * as THREE from "three";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BeeVisit, type FlightStyle, type VisitPhase } from "./BeeVisit";

/** 花朵热点:锚点由 GLB 里的 anchor_* 空节点提供(flowermodel/flower_gen.py) */
export interface FlowerHotspot {
  id: string;
  /** GLB 内的锚点节点名 */
  anchor: string;
  /** 热点配色的 CSS 后缀(hotspot-<css>) */
  css: string;
  name: string;
  latin?: string;
  lead: string;
}

export interface FlowerViewRequest {
  view: string;
  seq: number;
}
export interface FlowerZoomRequest {
  dir: 1 | -1;
  seq: number;
}

interface StageProps {
  modelUrl: string;
  motion: boolean;
  hotspots: FlowerHotspot[];
  focus: string; // "whole" 或热点 id
  focusSeq: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  viewRequest: FlowerViewRequest | null;
  zoomRequest: FlowerZoomRequest | null;
  hotspotMode: "popover" | "direct";
  onReady?: () => void;
  /** 访花演示:beeUrl + seq(变化即重播);pollen 为花粉筐彩蛋配置;null 表示未开启 */
  visit?: { beeUrl: string; seq: number; flight?: FlightStyle; pollen?: { color: string } | null } | null;
  onVisitPhase?: (phase: VisitPhase) => void;
  /** 各热点的聚焦距离覆盖(cm)——大花(如向日葵花盘)需要更远的机位 */
  nearDistances?: Record<string, number>;
}

function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const previous = scene.environment;
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    scene.environment = pmrem.fromScene(room, 0.04).texture;
    return () => {
      scene.environment = previous;
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** 轻风:整株低频摇摆,幅度随高度看起来自然(绕基部旋转) */
function WindSway({ group, motion }: { group: RefObject<THREE.Group | null>; motion: boolean }) {
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    if (!motion) {
      g.rotation.set(0, 0, 0);
      return;
    }
    const t = state.clock.elapsedTime;
    g.rotation.z = Math.sin(t * 0.9) * 0.016 + Math.sin(t * 0.53 + 1.3) * 0.01;
    g.rotation.x = Math.sin(t * 0.71 + 0.6) * 0.011;
  });
  return null;
}

interface FocusPose {
  target: THREE.Vector3;
  distance: number;
}

function useFocusPoses(
  scene: THREE.Object3D,
  hotspots: FlowerHotspot[],
  nearOverride?: Record<string, number>,
) {
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z) / 2;
    const poses = new Map<string, FocusPose>();
    // 整株:按 34° 视场角把全高装进画面,留 15% 边距
    // 窄屏:花名条悬浮在舞台顶部,把看点略上移、距离放宽,让模型让出上沿
    const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
    const fitDistance =
      ((size.y / 2) / Math.tan((34 / 2) * (Math.PI / 180))) * (narrow ? 1.24 : 1.15);
    poses.set("whole", {
      target: new THREE.Vector3(center.x, center.y + (narrow ? size.y * 0.09 : 0), center.z),
      distance: fitDistance,
    });
    // 距离单位与模型一致:1 单位 = 1 cm
    const near: Record<string, number> = {
      center: 5.7,
      petal: 4.5,
      stamen: 3.4,
      nectar: 3.4,
      stem: 8.0,
    };
    for (const h of hotspots) {
      const node = scene.getObjectByName(h.anchor);
      if (!node) continue;
      poses.set(h.id, {
        target: node.getWorldPosition(new THREE.Vector3()),
        distance: nearOverride?.[h.id] ?? near[h.id] ?? 4.5,
      });
    }
    return { poses, radius };
  }, [scene, hotspots, nearOverride]);
}

/** 聚焦镜头:focus / focusSeq 变化时缓动到目标,用户拖动或超时即交出镜头 */
function FlowerCameraRig({
  poses,
  focus,
  focusSeq,
  controlsRef,
  halt,
}: {
  poses: Map<string, FocusPose>;
  focus: string;
  focusSeq: number;
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>;
  halt: number;
}) {
  const { camera } = useThree();
  const moving = useRef(true);
  const startedAt = useRef(0);
  const snapped = useRef(false);
  const desired = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    moving.current = true;
    startedAt.current = performance.now();
    window.__cameraSettled = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, focusSeq]);

  useEffect(() => {
    if (halt === 0) return;
    moving.current = false;
    window.__cameraSettled = true;
  }, [halt]);

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
    const pose = poses.get(focus) ?? poses.get("whole");
    if (!pose) return;
    desired
      .set(0.42, 0.14, 1)
      .normalize()
      .multiplyScalar(pose.distance)
      .add(pose.target);
    // 首帧直接吸附:首屏加载/GLB 解析会掉帧,插值窗口不可靠;之后的切换才播缓动
    if (!snapped.current) {
      snapped.current = true;
      camera.position.copy(desired);
      const c = controlsRef.current;
      if (c) {
        c.target.copy(pose.target);
        c.update();
      } else {
        camera.lookAt(pose.target);
      }
      moving.current = false;
      window.__cameraSettled = true;
      return;
    }
    if (performance.now() - startedAt.current > 2500) {
      moving.current = false;
      window.__cameraSettled = true;
      return;
    }
    const alpha = 1 - Math.exp(-delta * 2.6);
    camera.position.lerp(desired, alpha);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.lerp(pose.target, alpha);
      controls.update();
    } else {
      camera.lookAt(pose.target);
    }
    if (camera.position.distanceTo(desired) < 0.015) {
      camera.position.copy(desired);
      if (controls) {
        controls.target.copy(pose.target);
        controls.update();
      }
      moving.current = false;
      window.__cameraSettled = true;
    }
    (window as unknown as Record<string, unknown>).__flowerDebug = {
      focus,
      target: pose.target.toArray(),
      distance: pose.distance,
      cam: camera.position.toArray(),
    };
  });
  return null;
}

/** 一次性推近/拉远(与蜂查看器同款,限位按花朵尺度) */
function FlowerZoomPulse({
  request,
  controlsRef,
  radius,
}: {
  request: FlowerZoomRequest | null;
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>;
  radius: number;
}) {
  const { camera } = useThree();
  useEffect(() => {
    if (!request) return;
    const controls = controlsRef.current;
    if (!controls) return;
    const target = controls.target as THREE.Vector3;
    const offset = camera.position.clone().sub(target);
    const factor = request.dir > 0 ? 0.62 : 1 / 0.62;
    const length = THREE.MathUtils.clamp(offset.length() * factor, 1.8, radius * 4.5);
    camera.position.copy(target).add(offset.setLength(length));
    controls.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.seq]);
  return null;
}

function FlowerHotspotDot({
  hotspot,
  anchor,
  active,
  preview,
  occludeRefs,
  onPreview,
  onOpen,
  onLocate,
  mode,
}: {
  hotspot: FlowerHotspot;
  anchor: THREE.Object3D;
  active: boolean;
  preview: boolean;
  occludeRefs: RefObject<THREE.Object3D>[];
  onPreview: (id: string | null) => void;
  onOpen: (id: string) => void;
  onLocate: (id: string) => void;
  mode: "popover" | "direct";
}) {
  const [occluded, setOccluded] = useState(false);
  return createPortal(
    <Html
      position={[0, 0, 0]}
      center
      occlude={occludeRefs}
      onOcclude={(hidden) => {
        setOccluded(hidden);
        return null;
      }}
      zIndexRange={preview ? [70, 0] : [40, 0]}
    >
      <div className="hotspot-wrap">
        <button
          type="button"
          className={
            `hotspot hotspot-${hotspot.css}` +
            (active ? " active" : "") +
            (preview ? " previewing" : "") +
            (occluded ? " occluded" : "")
          }
          aria-label={`查看:${hotspot.name}`}
          aria-pressed={active}
          aria-expanded={preview}
          tabIndex={occluded ? -1 : 0}
          onClick={(event) => {
            event.stopPropagation();
            if (mode === "direct" || event.detail === 0) {
              onOpen(hotspot.id);
              return;
            }
            if (preview) onOpen(hotspot.id);
            else onPreview(hotspot.id);
          }}
        >
          <i />
        </button>
        {!preview && !active && !occluded && (
          <span className="hotspot-tip" aria-hidden="true">
            {hotspot.name}
          </span>
        )}
        {preview && !occluded && (
          <div className="hotspot-pop" role="dialog" aria-label={hotspot.name}>
            {hotspot.latin && <p className="latin">{hotspot.latin}</p>}
            <b>{hotspot.name}</b>
            <p>{hotspot.lead}</p>
            <div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onLocate(hotspot.id);
                }}
              >
                定位
              </button>
              <button
                type="button"
                className="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(hotspot.id);
                }}
              >
                详情 →
              </button>
            </div>
          </div>
        )}
      </div>
    </Html>,
    anchor,
  );
}

function FlowerStage(props: StageProps) {
  const {
    modelUrl,
    motion,
    hotspots,
    focus,
    focusSeq,
    selected,
    onSelect,
    viewRequest,
    zoomRequest,
    hotspotMode,
    onReady,
    visit,
    onVisitPhase,
  } = props;
  const gltf = useGLTF(modelUrl);
  const scene = gltf.scene;
  const swayRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<ComponentRef<typeof OrbitControls> | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [halt, setHalt] = useState(0);
  const readyRef = useRef(false);

  const { poses, radius } = useFocusPoses(scene, hotspots, props.nearDistances);

  // 网格引用供热点遮挡检测
  const meshRefs = useMemo(() => {
    const refs: RefObject<THREE.Object3D>[] = [];
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) refs.push({ current: node });
    });
    return refs;
  }, [scene]);

  useEffect(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    onReady?.();
  }, [onReady]);

  // 一次性机位 = 聚焦请求 + 立即交出镜头由 rig 缓动
  const [rigFocus, setRigFocus] = useState({ id: focus, seq: focusSeq });
  useEffect(() => {
    setRigFocus({ id: focus, seq: focusSeq });
  }, [focus, focusSeq]);
  useEffect(() => {
    if (!viewRequest) return;
    setRigFocus({ id: viewRequest.view, seq: viewRequest.seq + 10000 });
  }, [viewRequest]);
  useEffect(() => {
    if (!zoomRequest) return;
    setHalt((value) => value + 1);
  }, [zoomRequest]);

  const anchorsById = useMemo(() => {
    const map = new Map<string, THREE.Object3D>();
    for (const h of hotspots) {
      const node = scene.getObjectByName(h.anchor);
      if (node) map.set(h.id, node);
    }
    return map;
  }, [scene, hotspots]);

  return (
    <>
      <StudioEnvironment />
      <ambientLight intensity={0.5} color="#fff8ea" />
      <hemisphereLight intensity={0.35} color="#fdf6e3" groundColor="#c8d3b0" />
      <directionalLight position={[3.4, 6.2, 4.2]} intensity={1.5} color="#fff3d8" />
      <directionalLight position={[-4.2, 2.4, -3.0]} intensity={0.45} color="#e8f0ff" />
      <group ref={swayRef} onPointerMissed={() => setPreview(null)}>
        <primitive object={scene} />
        {hotspots.map((h) => {
          const anchor = anchorsById.get(h.id);
          if (!anchor) return null;
          return (
            <FlowerHotspotDot
              // 必须按锚点对象(而非热点 id)作 key:R3F 的 createPortal 不会把已挂载的
              // Html 迁移到新容器,切换花种时旧 key 复用会让标注点拴在上一种花的锚点上
              key={anchor.uuid}
              hotspot={h}
              anchor={anchor}
              active={selected === h.id}
              preview={preview === h.id}
              occludeRefs={meshRefs}
              onPreview={setPreview}
              onOpen={(id) => {
                setPreview(null);
                onSelect(id);
              }}
              onLocate={(id) => setRigFocus({ id, seq: Date.now() })}
              mode={hotspotMode}
            />
          );
        })}
      </group>
      {visit && (
        <Suspense fallback={null}>
          <BeeVisit
            beeUrl={visit.beeUrl}
            flowerScene={scene}
            landingAnchor="anchor_nectarEntrance"
            seq={visit.seq}
            motion={motion}
            flight={visit.flight}
            pollen={visit.pollen}
            onPhase={onVisitPhase}
          />
        </Suspense>
      )}
      <WindSway group={swayRef} motion={motion} />
      <FlowerCameraRig
        poses={poses}
        focus={rigFocus.id}
        focusSeq={rigFocus.seq}
        controlsRef={controlsRef}
        halt={halt}
      />
      <FlowerZoomPulse request={zoomRequest} controlsRef={controlsRef} radius={radius} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={1.8}
        maxDistance={radius * 4.5}
        makeDefault
      />
    </>
  );
}

export function FlowerViewer(props: StageProps) {
  return (
    <Suspense fallback={<div className="loading-mark">正在展开花朵…</div>}>
      <Canvas
        frameloop="always"
        dpr={[1, 1.7]}
        camera={{ position: [11, 8.7, 21], fov: 34, near: 0.1, far: 300 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <FlowerStage {...props} />
      </Canvas>
    </Suspense>
  );
}

export function preloadFlowerModel(url: string) {
  useGLTF.preload(url);
}
