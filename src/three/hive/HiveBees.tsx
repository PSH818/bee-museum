import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";

// 蜂蜜工坊 · 分站蜂摆位(M5 第 4 步,已定决策:巢房静态 + 蜂摆位):
// 交哺两只对头、扇风蜂用扇翅、悬停蜂轻浮动;motion=0 全部静格。
// 蜂 GLB 约定:头朝 +X、背朝 +Y,工蜂体长 1.17(1 单位 = 1 cm)。
// 巢脾格口平面在 three z≈0、面法线 +Z(蜂"贴面站立"= 背对 +Z)。

const BEE_URL = "/models/bee-hero.glb";
const PERCH_LIFT = 0.34; // 落姿身体中心离巢脾面
const FLAP_HZ = 21;

interface BeePose {
  /** 巢脾 GLB 锚点名 */
  anchor: string;
  /** 相对锚点的偏移(three 世界系,z 为离面高度;perch 会自动加 PERCH_LIFT) */
  offset: [number, number, number];
  /** 面内朝向角(度):0 = +X(右),90 = +Y(上);hover 时为水平朝向 */
  heading: number;
  mode: "perch" | "hover";
  /** 落姿持续扇翅(扇风通风) */
  fan?: boolean;
  /** 站点专属行为动画(P1,motion 门控):互凑交哺 / 探入格口 / 抹蜡画圈 */
  act?: "handoff" | "probe" | "capping";
  /** 常显指认小签 */
  tag?: { text: string; offset: [number, number, number] };
}

/** 每站的蜂摆位(键 = 站点短名;没有键的站不摆蜂) */
const STAGE_BEES: Record<string, BeePose[]> = {
  gather: [
    // 从花田回来的外勤蜂,悬停在巢脾前
    { anchor: "anchor_combFace", offset: [0.5, 0.7, 2.4], heading: 205, mode: "hover" },
  ],
  carry: [
    {
      anchor: "anchor_cellOpen",
      offset: [-0.3, 0.15, 0],
      heading: 140,
      mode: "perch",
      tag: { text: "蜜胃在腹部里,从外面看不见", offset: [0.55, -0.75, 0.6] },
    },
  ],
  handoff: [
    // anchor_landing 在格口平面(z=0);combFace 是面外看点,别用来放蜂
    { anchor: "anchor_landing", offset: [-0.74, 0.2, 0], heading: 0, mode: "perch", act: "handoff" },
    {
      anchor: "anchor_landing",
      offset: [0.74, 0.2, 0],
      heading: 180,
      mode: "perch",
      act: "handoff",
      tag: { text: "口对口交哺:花蜜在这里换手", offset: [0, 0.75, 0.6] },
    },
  ],
  transform: [
    // 内勤蜂头朝下,把加工中的蜜吐进空巢房(空格里浮现蜜面,对比清晰)
    { anchor: "anchor_cellOpen", offset: [0.05, 0.66, 0], heading: -90, mode: "perch", act: "probe" },
  ],
  condense: [
    {
      anchor: "anchor_cellOpen",
      offset: [0.62, -0.72, 0],
      heading: 105,
      mode: "perch",
      fan: true,
      tag: { text: "原地扇翅,给巢房通风", offset: [0.7, 0.5, 0.7] },
    },
  ],
  cap: [
    // 演示格(渐合蜡盖)在蜜区中心格(anchor_landing):蜂趴在它上方演封盖
    { anchor: "anchor_landing", offset: [-0.3, 0.42, 0], heading: -40, mode: "perch", act: "capping" },
  ],
};

const tmp = {
  axisX: new THREE.Vector3(),
  axisY: new THREE.Vector3(),
  axisZ: new THREE.Vector3(),
  fwd: new THREE.Vector3(),
  up: new THREE.Vector3(),
  m: new THREE.Matrix4(),
  q: new THREE.Quaternion(),
};

interface WingRef {
  node: THREE.Object3D;
  rest: THREE.Quaternion;
  sign: number;
}

function poseQuaternion(pose: BeePose): THREE.Quaternion {
  const q = new THREE.Quaternion();
  const m = new THREE.Matrix4();
  const rad = THREE.MathUtils.degToRad(pose.heading);
  // makeBasis 列 = 蜂局部 X(头)/Y(背)/Z 的世界指向;Z = X×Y 保持右手系(镜像会毁掉四元数)
  if (pose.mode === "perch") {
    // 背(+Y)对巢脾法线(+Z),头(+X)指向面内 heading 方向
    const fwd = new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0);
    const up = new THREE.Vector3(0, 0, 1);
    m.makeBasis(fwd, up, new THREE.Vector3().crossVectors(fwd, up));
  } else {
    // 悬停:背朝世界上方,头指向水平 heading 方向(0 = +X,90 = -Z 即朝巢脾)
    const fwd = new THREE.Vector3(Math.cos(rad), 0, -Math.sin(rad));
    const up = new THREE.Vector3(0, 1, 0);
    m.makeBasis(fwd, up, new THREE.Vector3().crossVectors(fwd, up));
  }
  return q.setFromRotationMatrix(m);
}

function StageBee({
  pose,
  hiveScene,
  motion,
  phase,
}: {
  pose: BeePose;
  hiveScene: THREE.Object3D;
  motion: boolean;
  phase: number;
}) {
  const gltf = useGLTF(BEE_URL);
  // 每只蜂克隆一份场景(纯节点旋转动画,材质共享无碍)
  const { bee, wings, head, abdomen } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const wingList: WingRef[] = [];
    let headNode: THREE.Object3D | null = null;
    let abdomenNode: THREE.Object3D | null = null;
    clone.traverse((node) => {
      if (/^(foreWing|hindWing)/.test(node.name)) {
        wingList.push({ node, rest: node.quaternion.clone(), sign: node.name.endsWith("L") ? 1 : -1 });
      }
      if (node.name === "head") headNode = node;
      if (node.name === "abdomen") abdomenNode = node;
    });
    const wrap = (node: THREE.Object3D | null) =>
      node ? { node, rest: node.quaternion.clone(), restScale: node.scale.clone() } : null;
    return { bee: clone, wings: wingList, head: wrap(headNode), abdomen: wrap(abdomenNode) };
  }, [gltf]);

  const basePos = useMemo(() => {
    const anchor = hiveScene.getObjectByName(pose.anchor);
    const p = anchor ? anchor.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3();
    p.add(new THREE.Vector3(...pose.offset));
    if (pose.mode === "perch") p.z += PERCH_LIFT;
    return p;
  }, [hiveScene, pose]);
  const baseQuat = useMemo(() => poseQuaternion(pose), [pose]);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime + phase;
    const flying = pose.mode === "hover";
    const flapping = flying || pose.fan;
    // 扇翅:悬停/扇风高频;落姿收拢;motion=0 定格在小角度
    const amp = flapping ? (pose.fan ? 0.62 : 0.85) : 0;
    const angle = motion ? Math.sin(now * 2 * Math.PI * FLAP_HZ) * amp : amp * 0.35;
    for (const w of wings) {
      w.node.quaternion.setFromAxisAngle(tmp.axisX.set(1, 0, 0), angle * w.sign).multiply(w.rest);
    }

    bee.position.copy(basePos);
    bee.quaternion.copy(baseQuat);
    if (!motion) {
      // 静格:全部姿态复位(视觉基线依赖 motion=0 的确定画面)
      if (head) head.node.quaternion.copy(head.rest);
      if (abdomen) abdomen.node.scale.copy(abdomen.restScale);
      return;
    }

    if (flying) {
      // P3 巡飞:绕悬停点走缓慢的小 8 字弧线,头朝运动方向,叠加轻浮动
      const t = now * ((Math.PI * 2) / 9);
      bee.position.x += Math.cos(t) * 0.85;
      bee.position.z += Math.sin(t) * 0.45;
      bee.position.y += Math.sin(t * 2) * 0.14 + Math.sin(now * 4.6) * 0.06;
      tmp.fwd.set(-Math.sin(t), 0, Math.cos(t) * 0.55).normalize();
      tmp.up.set(0, 1, 0);
      tmp.m.makeBasis(tmp.fwd, tmp.up, tmp.axisZ.crossVectors(tmp.fwd, tmp.up));
      bee.quaternion.setFromRotationMatrix(tmp.m);
    }

    // ---- P1 行为动画(全部叠加在落姿基准上,幅度克制) ----
    // 平滑 0→1→0 循环脉冲
    const pulse = (period: number) => 0.5 - 0.5 * Math.cos(((now % period) / period) * Math.PI * 2);
    let headPitch = 0;
    if (pose.act === "handoff") {
      // 互凑:沿头向前移-停留-退回;两蜂同相位即同时凑向中间;凑近时头微低
      const t = pulse(3.2);
      bee.position.addScaledVector(tmp.fwd.set(1, 0, 0).applyQuaternion(baseQuat), 0.09 * t);
      headPitch = -0.12 * t;
    } else if (pose.act === "probe") {
      // 探入格口-抬头-再探入:前移 + 整蜂俯身(绕局部 Z,同 BeeVisit 取蜜约定)
      const t = pulse(3.6);
      bee.position.addScaledVector(tmp.fwd.set(1, 0, 0).applyQuaternion(baseQuat), 0.12 * t);
      bee.quaternion.multiply(tmp.q.setFromAxisAngle(tmp.axisZ.set(0, 0, 1), -0.12 * t));
      headPitch = -0.14 * t;
    } else if (pose.act === "capping") {
      // 抹蜡:头低伏,沿格口面内缓慢画小圈
      bee.position.x += Math.cos(now * 0.7) * 0.1;
      bee.position.y += Math.sin(now * 0.7) * 0.1;
      headPitch = -0.12;
    }
    // 头部闲时微动(低频×低频出偶发感)+ 行为俯仰
    if (head) {
      const sway = Math.sin(now * 0.6) * Math.sin(now * 0.17) * 0.07;
      head.node.quaternion
        .setFromAxisAngle(tmp.axisZ.set(0, 0, 1), headPitch)
        .multiply(tmp.q.setFromAxisAngle(tmp.axisY.set(0, 1, 0), sway))
        .multiply(head.rest);
    }
    // 腹部呼吸泵动(落蜂;扇风蜂稍强,呼应剧烈通风)
    if (abdomen && !flying) {
      const breathe = 1 + Math.sin(now * 2 * Math.PI * 0.9) * (pose.fan ? 0.04 : 0.025);
      abdomen.node.scale.copy(abdomen.restScale).multiplyScalar(breathe);
    }
  });

  return (
    <>
      <primitive object={bee} />
      {pose.tag && (
        <Html
          position={[basePos.x + pose.tag.offset[0], basePos.y + pose.tag.offset[1], basePos.z + pose.tag.offset[2]]}
          center
          zIndexRange={[5, 0]}
        >
          <span className="hw-tag">{pose.tag.text}</span>
        </Html>
      )}
    </>
  );
}

export function HiveBees({
  stage,
  hiveScene,
  motion,
}: {
  stage: string;
  hiveScene: THREE.Object3D;
  motion: boolean;
}) {
  const poses = STAGE_BEES[stage] ?? [];
  if (typeof window !== "undefined") window.__hiveBeesCount = poses.length;
  return (
    <>
      {poses.map((pose, i) => (
        <StageBee key={`${stage}-${i}`} pose={pose} hiveScene={hiveScene} motion={motion} phase={i * 1.7} />
      ))}
    </>
  );
}

useGLTF.preload(BEE_URL);

declare global {
  interface Window {
    __hiveBeesCount?: number;
  }
}
