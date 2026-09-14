import { Suspense, useEffect, useMemo, useRef } from "react";
import { asset } from "../../lib/asset";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { HiveBees } from "./HiveBees";
import { CellDemo } from "./CellDemos";
import { AirFlow } from "./AirFlow";

// 蜂蜜工坊 · 巢脾舞台(M5 第 3 步):加载竖立巢脾 GLB,按站点聚焦锚点。
// 镜头约定沿用花朵馆的教训:首帧直接吸附目标机位(GLB 解析掉帧会耗尽插值窗口)。

const MODEL_URL = asset("/models/hive-comb.glb");
const FOV = 34;

export interface HiveFocus {
  /** GLB 内锚点名;"fit" 距离表示整脾装框 */
  anchor: string;
  /** 相对锚点的看点偏移(对准蜂摆位用) */
  offset?: [number, number, number];
  distance: number | "fit";
  seq: number;
}

interface HiveStageProps {
  focus: HiveFocus;
  /** 站点短名:决定舞台上摆哪几只蜂 */
  stage: string;
  motion: boolean;
  zoomRequest: { dir: 1 | -1; seq: number } | null;
}

/** 观察方向:正面(+Z)略偏右上,让格深与蜡盖有立体感 */
const VIEW_DIR = new THREE.Vector3(0.22, 0.16, 1).normalize();

function HiveScene({ focus, stage, motion, zoomRequest }: HiveStageProps) {
  const gltf = useGLTF(MODEL_URL);
  const { camera, size } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const model = useMemo(() => {
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    return scene;
  }, [gltf]);

  const fit = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(model);
    const sizeV = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    return { sizeV, center, radius: Math.max(sizeV.x, sizeV.y, sizeV.z) / 2 };
  }, [model]);

  const state = useRef({ lastSeq: Number.NaN, lastZoom: Number.NaN, t: 1 });
  const tmp = useMemo(
    () => ({ target: new THREE.Vector3(), pos: new THREE.Vector3(), from: new THREE.Vector3(), fromT: new THREE.Vector3() }),
    [],
  );

  const poseFor = (f: HiveFocus) => {
    const target = new THREE.Vector3();
    if (f.anchor !== "fit") {
      const node = model.getObjectByName(f.anchor);
      if (node) node.getWorldPosition(target);
      else target.copy(fit.center);
      if (f.offset) target.add(new THREE.Vector3(...f.offset));
    } else {
      target.copy(fit.center);
    }
    let distance: number;
    if (f.distance === "fit") {
      // 巢脾是横幅:按高度与(宽度/画幅比)中较大者装框
      const aspect = size.width / Math.max(size.height, 1);
      const half = Math.max(fit.sizeV.y, fit.sizeV.x / aspect) / 2;
      distance = (half / Math.tan((FOV / 2) * (Math.PI / 180))) * 1.18;
      target.copy(fit.center);
    } else {
      distance = f.distance;
    }
    return { target, pos: target.clone().addScaledVector(VIEW_DIR, distance) };
  };

  useFrame((_, delta) => {
    const s = state.current;
    const controls = controlsRef.current;
    const pose = poseFor(focus);
    if (s.lastSeq !== focus.seq) {
      const first = Number.isNaN(s.lastSeq);
      s.lastSeq = focus.seq;
      s.t = first || !motion ? 1 : 0;
      tmp.from.copy(camera.position);
      if (controls) tmp.fromT.copy(controls.target as THREE.Vector3);
      if (s.t >= 1) {
        camera.position.copy(pose.pos);
        if (controls) {
          (controls.target as THREE.Vector3).copy(pose.target);
          controls.update();
        } else {
          camera.lookAt(pose.target);
        }
        window.__hiveReady = true;
      }
    }
    if (s.t < 1) {
      s.t = Math.min(s.t + delta / 1.1, 1);
      const e = s.t * s.t * (3 - 2 * s.t);
      camera.position.lerpVectors(tmp.from, pose.pos, e);
      if (controls) {
        (controls.target as THREE.Vector3).lerpVectors(tmp.fromT, pose.target, e);
        controls.update();
      }
      if (s.t >= 1) window.__hiveReady = true;
    }
    if (zoomRequest && s.lastZoom !== zoomRequest.seq && controls) {
      s.lastZoom = zoomRequest.seq;
      const target = controls.target as THREE.Vector3;
      const offset = camera.position.clone().sub(target);
      const len = THREE.MathUtils.clamp(offset.length() * (zoomRequest.dir > 0 ? 0.78 : 1.28), 1.6, fit.radius * 5);
      camera.position.copy(target).add(offset.setLength(len));
      controls.update();
    }
  });

  return (
    <>
      <StudioEnvironment />
      <ambientLight intensity={0.5} color="#fff8ea" />
      <directionalLight position={[3.2, 4.8, 6.0]} intensity={1.4} color="#fff3d8" />
      <directionalLight position={[-4.0, 1.6, 2.5]} intensity={0.4} color="#e8f0ff" />
      <primitive object={model} />
      <HiveBees stage={stage} hiveScene={model} motion={motion} />
      <CellDemo stage={stage} hiveScene={model} motion={motion} />
      {stage === "condense" && <AirFlow hiveScene={model} motion={motion} />}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={1.6}
        maxDistance={fit.radius * 5}
        makeDefault
      />
    </>
  );
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

export function HiveStage(props: HiveStageProps) {
  return (
    <Suspense fallback={<div className="loading-mark">正在打开蜂巢…</div>}>
      <Canvas
        frameloop="always"
        dpr={[1, 1.7]}
        camera={{ position: [3, 2, 16], fov: FOV, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <HiveScene {...props} />
      </Canvas>
    </Suspense>
  );
}

useGLTF.preload(MODEL_URL);

declare global {
  interface Window {
    __hiveReady?: boolean;
  }
}
