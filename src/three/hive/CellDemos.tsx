import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// 巢房叙事动画(P2,2026-09-11 用户选定):运行时在锚点格里程序化生成演示面片,不改 GLB。
// 转化站:蜜液面随内勤蜂吐蜜缓缓上涨(涨满淡出重来);
// 浓缩站:薄蜜格液面缓缓下降(水分蒸发);
// 封盖站:蜡盖从边缘向中心渐渐合拢(收口环,留中心孔最后封)。
// motion=0 呈现确定的"完成态"(液面高位/低位、蜡盖全合)——三站基线随之重建一次。
// 几何参数对齐 hivemodel/hive_gen.py:格内切半径 0.27、六角尖角朝上(顶点角 60i+30°)、
// 格口在 three z=0、格深向 -z(Blender +y 经 glTF 转换)。

const HEX_R = 0.27 / Math.cos(Math.PI / 6) - 0.008; // 液面/蜡盖外接半径,略收进格壁
const CAP_COLOR = new THREE.Color().setRGB(0.5, 0.35, 0.14, THREE.LinearSRGBColorSpace);
const HONEY_COLOR = new THREE.Color().setRGB(0.43, 0.115, 0.008, THREE.LinearSRGBColorSpace);

function hexPoints(radius: number): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < 6; i++) {
    const a = THREE.MathUtils.degToRad(60 * i + 30);
    pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius));
  }
  return pts;
}

function hexGeometry(radius: number, holeRadius = 0): THREE.ShapeGeometry {
  const shape = new THREE.Shape(hexPoints(radius));
  if (holeRadius > 0.004) {
    const hole = new THREE.Path(hexPoints(holeRadius));
    shape.holes.push(hole);
  }
  return new THREE.ShapeGeometry(shape);
}

interface DemoConf {
  anchor: string;
  kind: "honey-drip" | "honey-fall" | "cap-close";
}

const STAGE_DEMOS: Record<string, DemoConf> = {
  // 空格里浮现蜜色才有对比(满蜜格上叠蜜面是隐形的)
  transform: { anchor: "anchor_cellOpen", kind: "honey-drip" },
  condense: { anchor: "anchor_cellOpen", kind: "honey-fall" },
  // 渐合盖放确定"满蜜无盖"的蜜区中心格(anchor_landing=cellHoney 格):
  // cellCapped 格在 GLB 里已有凸盖,叠放会穿帮
  cap: { anchor: "anchor_landing", kind: "cap-close" },
};

export function CellDemo({
  stage,
  hiveScene,
  motion,
}: {
  stage: string;
  hiveScene: THREE.Object3D;
  motion: boolean;
}) {
  const conf = STAGE_DEMOS[stage];
  if (typeof window !== "undefined") window.__cellDemo = conf ? stage : null;
  if (!conf) return null;
  return <CellDemoMesh key={stage} conf={conf} hiveScene={hiveScene} motion={motion} />;
}

function CellDemoMesh({
  conf,
  hiveScene,
  motion,
}: {
  conf: DemoConf;
  hiveScene: THREE.Object3D;
  motion: boolean;
}) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const capHole = useRef(-1);

  const center = useMemo(() => {
    const anchor = hiveScene.getObjectByName(conf.anchor);
    return anchor ? anchor.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3();
  }, [hiveScene, conf]);

  const isCap = conf.kind === "cap-close";
  const geometry = useMemo(() => hexGeometry(HEX_R * (isCap ? 1 : 0.94)), [isCap]);
  const honeyPadGeometry = useMemo(() => hexGeometry(HEX_R * 0.96), []);
  const honeyPadMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: HONEY_COLOR,
        roughness: 0.07,
        emissive: HONEY_COLOR,
        emissiveIntensity: 0.5,
      }),
    [],
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isCap ? CAP_COLOR : HONEY_COLOR,
        roughness: isCap ? 0.72 : 0.07,
        // 深格内液面处在阴影里,给一点自发光呈现蜜的透光感,保证可辨
        emissive: isCap ? new THREE.Color(0x000000) : HONEY_COLOR,
        emissiveIntensity: isCap ? 0 : 0.5,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    [isCap],
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const now = clock.elapsedTime;
    let opacity = 1;
    if (conf.kind === "honey-drip") {
      // 与内勤蜂 3.6s 探入节律同步:探到最深时,格口泛起一层蜜色(蜜正注入;
      // 蜂头贴格吐蜜本身必然被蜂身挡住,蜜面从头两侧露出才可靠可见)。
      // motion=0 不出现,该站基线不变
      if (!motion) {
        mesh.visible = false;
        return;
      }
      const ph = (now % 3.6) / 3.6;
      const inWindow = ph > 0.42 && ph < 0.88;
      mesh.visible = inWindow;
      if (inWindow) {
        const t = (ph - 0.42) / 0.46;
        mesh.position.z = -0.06;
        opacity = Math.sin(t * Math.PI) * 0.9;
      }
    } else if (conf.kind === "honey-fall") {
      // 11s 一轮:薄蜜液面缓缓下降(蒸发),末段淡出重来
      const t = motion ? (now % 11) / 11 : 0.45; // 静格取中段液位,保证可辨
      mesh.position.z = THREE.MathUtils.lerp(-0.35, -0.88, t);
      if (motion && t > 0.94) opacity = 1 - (t - 0.94) / 0.06;
    } else {
      // 9s 一轮:蜡盖收口——孔半径从满口收到 0(边缘向中心合拢),停留后淡出重来
      const cycle = motion ? (now % 9) / 9 : 1;
      const closeT = Math.min(cycle / 0.75, 1); // 前 75% 收口,其余停留
      const hole = HEX_R * 0.94 * (1 - closeT);
      mesh.position.z = 0.03;
      if (Math.abs(hole - capHole.current) > 0.003) {
        capHole.current = hole;
        mesh.geometry.dispose();
        mesh.geometry = hexGeometry(HEX_R, hole);
      }
      if (motion && cycle > 0.95) opacity = 1 - (cycle - 0.95) / 0.05;
    }
    (mesh.material as THREE.MeshStandardMaterial).opacity = opacity;
  });

  return (
    <>
      {isCap && (
        <mesh geometry={honeyPadGeometry} material={honeyPadMaterial} position={[center.x, center.y, -0.045]} />
      )}
      <mesh ref={meshRef} geometry={geometry} material={material} position={center} />
    </>
  );
}

declare global {
  interface Window {
    __cellDemo?: string | null;
  }
}
