import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// 浓缩站气流飘带(P3 氛围件):扇风蜂前方三条半透明虚线弧,dashOffset 流动示气流。
// 刻意收着:1px 细线、低透明度、慢速——纸面标本审美下的"一点点风"。
// motion=0 整体隐藏,基线不变。

const FLOW_COLOR = new THREE.Color("#b9832d"); // 琥珀金:浅色巢脾上白线会隐形

interface AirFlowProps {
  hiveScene: THREE.Object3D;
  motion: boolean;
}

export function AirFlow({ hiveScene, motion }: AirFlowProps) {
  const lines = useMemo(() => {
    // 扇风蜂位置(与 HiveBees condense 配置一致):anchor_cellOpen + (0.62, -0.72),头朝上偏左
    const anchor = hiveScene.getObjectByName("anchor_cellOpen");
    const base = anchor ? anchor.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3();
    base.x += 0.62;
    base.y -= 0.72;
    const start = new THREE.Vector3(base.x - 0.12, base.y + 0.55, 0.42);
    const defs: Array<[THREE.Vector3, THREE.Vector3]> = [
      // [中间控制点偏移, 终点偏移] —— 三条向上散开、贴着巢面掠过
      [new THREE.Vector3(-0.5, 1.1, 0.15), new THREE.Vector3(-1.1, 2.3, 0.1)],
      [new THREE.Vector3(0.05, 1.25, 0.3), new THREE.Vector3(-0.1, 2.6, 0.25)],
      [new THREE.Vector3(0.55, 1.05, 0.1), new THREE.Vector3(0.9, 2.2, 0)],
    ];
    return defs.map(([mid, end], i) => {
      const s = start.clone();
      s.x += (i - 1) * 0.16;
      const curve = new THREE.QuadraticBezierCurve3(s, s.clone().add(mid), s.clone().add(end));
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36));
      const material = new THREE.LineDashedMaterial({
        color: FLOW_COLOR,
        transparent: true,
        opacity: 0.52,
        dashSize: 0.16,
        gapSize: 0.3,
      });
      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      return line;
    });
  }, [hiveScene]);

  useFrame((_, delta) => {
    for (const line of lines) {
      line.visible = motion;
      if (motion) {
        (line.material as THREE.LineDashedMaterial).dashOffset -= delta * 1.15;
      }
    }
  });

  return (
    <>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  );
}
