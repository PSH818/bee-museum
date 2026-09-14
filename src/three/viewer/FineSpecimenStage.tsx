import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// 精致标本鉴赏模式(首版纯观赏,无热点/图层;方案见 2026-09-11 讨论):
// 独立精模 GLB 为米制真实尺寸(工蜂约 1.1cm),×100 换算到站内 1 单位 = 1 cm;
// 包围盒居中、首帧装框吸附;motion 时展台缓转,motion=0 完全静止。

const SCALE = 100;
const FOV = 34;

interface FineSpecimenStageProps {
  url: string;
  motion: boolean;
  zoomRequest: { dir: 1 | -1; seq: number } | null;
}

export function FineSpecimenStage({ url, motion, zoomRequest }: FineSpecimenStageProps) {
  const gltf = useGLTF(url);
  const { camera, size } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const turntableRef = useRef<THREE.Group | null>(null);

  // 包一层组做缩放与居中,不改 drei 缓存里的原始场景变换
  const { radius } = useMemo(() => {
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const center = bounds.getCenter(new THREE.Vector3());
    const sizeV = bounds.getSize(new THREE.Vector3());
    return {
      center,
      radius: (Math.max(sizeV.x, sizeV.y, sizeV.z) / 2) * SCALE,
    };
  }, [gltf]);
  const centerOffset = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(gltf.scene);
    return bounds.getCenter(new THREE.Vector3()).multiplyScalar(-1);
  }, [gltf]);

  const state = useRef({ fitted: false, lastZoom: Number.NaN });

  useFrame((_, delta) => {
    const s = state.current;
    const controls = controlsRef.current;
    if (!s.fitted) {
      // 首帧吸附装框(教训同花朵馆:解析掉帧会吃掉插值窗口)
      const aspect = size.width / Math.max(size.height, 1);
      const half = radius / Math.min(aspect, 1);
      const distance = (half / Math.tan((FOV / 2) * (Math.PI / 180))) * 1.35;
      camera.position.set(distance * 0.5, distance * 0.28, distance * 0.85);
      if (controls) {
        (controls.target as THREE.Vector3).set(0, 0, 0);
        controls.update();
      } else {
        camera.lookAt(0, 0, 0);
      }
      s.fitted = true;
      window.__fineReady = true;
    }
    if (motion && turntableRef.current) {
      turntableRef.current.rotation.y += delta * 0.15;
    }
    if (zoomRequest && s.lastZoom !== zoomRequest.seq && controls) {
      s.lastZoom = zoomRequest.seq;
      const target = controls.target as THREE.Vector3;
      const offset = camera.position.clone().sub(target);
      const len = THREE.MathUtils.clamp(
        offset.length() * (zoomRequest.dir > 0 ? 0.78 : 1.28),
        radius * 0.6,
        radius * 8,
      );
      camera.position.copy(target).add(offset.setLength(len));
      controls.update();
    }
  });

  return (
    <>
      <FineEnvironment />
      <ambientLight intensity={0.5} color="#fff6e4" />
      <directionalLight position={[3.4, 6.2, 4.2]} intensity={1.5} color="#fff3d8" />
      <directionalLight position={[-4.2, 2.4, -3.0]} intensity={0.45} color="#e8f0ff" />
      <group ref={turntableRef}>
        <group scale={SCALE} position={[centerOffset.x * SCALE, centerOffset.y * SCALE, centerOffset.z * SCALE]}>
          <primitive object={gltf.scene} />
        </group>
      </group>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={radius * 0.6}
        maxDistance={radius * 8}
        makeDefault
      />
    </>
  );
}

function FineEnvironment() {
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

declare global {
  interface Window {
    __fineReady?: boolean;
  }
}
