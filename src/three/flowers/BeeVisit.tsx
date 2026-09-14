import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

/** 访花演示的阶段(方案:进场 → 悬停 → 降落 → 取蜜 → 起飞 → 结束;飞一轮即停) */
export type VisitPhase = "enter" | "hover" | "land" | "probe" | "takeoff" | "done";

/** 飞行性格(子步 3):轻快=蜜蜂基准;笨重=熊蜂低频大幅、更慢、飞行中晃;直来直去=独居蜂短促直线 */
export type FlightStyle = "nimble" | "heavy" | "darting";

interface FlightProfile {
  phase: Record<Exclude<VisitPhase, "done">, number>;
  flapHz: number;
  flapAmp: number;
  spiralTurns: number; // 进场绕圈数(×π)
  spiralR0: number;
  hoverBob: number;
  rollAmp: number; // 飞行中机身晃动幅度(rad)
}

const FLIGHT_PROFILES: Record<FlightStyle, FlightProfile> = {
  nimble: {
    phase: { enter: 3.2, hover: 1.5, land: 0.9, probe: 3.6, takeoff: 2.2 },
    flapHz: 21, flapAmp: 0.85, spiralTurns: 3.6, spiralR0: 8.5, hoverBob: 0.12, rollAmp: 0,
  },
  heavy: {
    phase: { enter: 4.4, hover: 2.0, land: 1.3, probe: 4.2, takeoff: 2.8 },
    flapHz: 13, flapAmp: 1.05, spiralTurns: 3.0, spiralR0: 9.5, hoverBob: 0.24, rollAmp: 0.07,
  },
  darting: {
    phase: { enter: 1.9, hover: 0.7, land: 0.55, probe: 3.2, takeoff: 1.4 },
    flapHz: 26, flapAmp: 0.7, spiralTurns: 0.9, spiralR0: 7.5, hoverBob: 0.06, rollAmp: 0,
  },
};

// 所有长度单位 = 厘米(蜂与花 GLB 均为 1 单位 = 1 cm;工蜂体长约 1.2)
const SPIRAL_R1 = 2.4;
const SPIRAL_H0 = 4.5;
const SPIRAL_H1 = 1.2;
const HOVER_BACK = 1.6; // 悬停点:落点前方(沿花轴外)距离
const HOVER_BOB = 0.12;
const PERCH_UP = 0.28; // 落定时身体中心抬离花面的高度
const PERCH_BACK = 0.3; // 身体中心沿前向后退,让头部落在花心上方
const PITCH_DOWN = THREE.MathUtils.degToRad(14); // 取蜜俯身角(花面本身已倾斜,俯身要克制)

interface BeeVisitProps {
  beeUrl: string;
  /** 飞行性格:nimble 蜜蜂基准 / heavy 熊蜂 / darting 独居蜂;缺省 nimble */
  flight?: FlightStyle;
  /** 花粉筐彩蛋:取蜜时后足花粉团渐显(仅携粉蜂 × 有粉源/传粉记录的花);color 为该花花粉色 */
  pollen?: { color: string } | null;
  /** 花朵场景根(用于按名字找锚点;每帧取世界坐标,落定后自然跟随风摆) */
  flowerScene: THREE.Object3D;
  landingAnchor: string;
  /** 变化即从头播放 */
  seq: number;
  motion: boolean;
  onPhase?: (phase: VisitPhase) => void;
}

/** 通用飞法的访花蜂(首版不分蜂种;蜂 GLB 头朝 +X、背朝 +Y) */
export function BeeVisit({ beeUrl, flowerScene, landingAnchor, seq, motion, flight, pollen, onPhase }: BeeVisitProps) {
  const profile = FLIGHT_PROFILES[flight ?? "nimble"];
  const gltf = useGLTF(beeUrl);
  const bee = gltf.scene;
  const groupRef = useRef<THREE.Group | null>(null);

  // 翅根节点与静置姿态;花粉节点默认隐藏,取蜜时按需渐显
  const { wings, pollenNodes } = useMemo(() => {
    const wingList: { node: THREE.Object3D; rest: THREE.Quaternion; sign: number }[] = [];
    const pollenList: THREE.Object3D[] = [];
    bee.traverse((node) => {
      if (/^(foreWing|hindWing)/.test(node.name)) {
        wingList.push({
          node,
          rest: node.quaternion.clone(),
          sign: node.name.endsWith("L") ? 1 : -1,
        });
      }
      if (/^pollen/.test(node.name)) {
        // 可能是 Mesh 也可能是含子网格的 Group:一律按节点隐藏/缩放
        node.visible = false;
        pollenList.push(node);
      }
    });
    return { wings: wingList, pollenNodes: pollenList };
  }, [bee]);

  // 花粉团材质:GLB 场景被 drei 缓存共享,改色前先克隆,避免污染其他访花实例
  useEffect(() => {
    if (!pollen) return;
    for (const node of pollenNodes) {
      node.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const clone = mat.clone();
        clone.color.set(pollen.color);
        clone.roughness = 0.92;
        mesh.material = clone;
      });
    }
  }, [pollen, pollenNodes]);

  const anchors = useMemo(() => {
    return {
      land: flowerScene.getObjectByName(landingAnchor) ?? null,
      landNormal: flowerScene.getObjectByName("anchor_landingNormal") ?? null,
      center: flowerScene.getObjectByName("anchor_flowerCenter") ?? null,
      stemBase: flowerScene.getObjectByName("anchor_stemBase") ?? null,
    };
  }, [flowerScene, landingAnchor]);

  const state = useRef({
    phase: "enter" as VisitPhase,
    phaseStart: -1,
    lastSeq: Number.NaN,
    lastMotion: null as boolean | null,
  });
  const tmp = useMemo(
    () => ({
      vLand: new THREE.Vector3(),
      vCenter: new THREE.Vector3(),
      axis: new THREE.Vector3(), // 花轴(花面法线,指向花外)
      fwd: new THREE.Vector3(), // 落姿前向(垂直花轴,指向花心轴线)
      right: new THREE.Vector3(),
      perch: new THREE.Vector3(), // 落定的身体中心
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      prev: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      q2: new THREE.Quaternion(),
      a: new THREE.Vector3(),
    }),
    [],
  );

  // 注意:不能靠 useEffect 做初始化——被挂起边界包住时 passive effect 可能比 useFrame 晚数秒,
  // 蜂会先按 ref 默认值飞起来。初始化与重播都在 useFrame 首帧比对 seq/motion 完成。
  const setPhase = (phase: VisitPhase, now: number) => {
    state.current.phase = phase;
    state.current.phaseStart = now;
    onPhase?.(phase);
  };

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g || !anchors.land || !anchors.center) return;
    const s = state.current;
    const now = clock.elapsedTime;
    if (s.lastSeq !== seq || s.lastMotion !== motion) {
      s.lastSeq = seq;
      s.lastMotion = motion;
      setPhase(motion ? "enter" : "probe", now);
      for (const node of pollenNodes) node.visible = false;
    }
    if (s.phaseStart < 0) s.phaseStart = now;

    anchors.land.getWorldPosition(tmp.vLand);
    anchors.center.getWorldPosition(tmp.vCenter);

    // 落姿参考系:优先用 GLB 里显式的落点法线锚点;缺失时退回"花心 − 落点"推断
    if (anchors.landNormal) {
      anchors.landNormal.getWorldPosition(tmp.axis);
      tmp.axis.sub(tmp.vLand);
    } else {
      tmp.axis.copy(tmp.vCenter).sub(tmp.vLand);
    }
    if (tmp.axis.lengthSq() < 1e-8) tmp.axis.set(0, 1, 0);
    tmp.axis.normalize();
    // 前向:花面内的水平等高线方向(worldUp × 花轴)——避免取到花面最陡下坡,
    // 否则倾斜花面 + 俯身角会叠成"倒栽";花朝正上时退化,改用朝茎方向的投影
    tmp.fwd.set(0, 1, 0).cross(tmp.axis);
    if (tmp.fwd.lengthSq() < 1e-4) {
      if (anchors.stemBase) {
        anchors.stemBase.getWorldPosition(tmp.fwd);
        tmp.fwd.sub(tmp.vLand);
      } else {
        tmp.fwd.set(0, 0, -1);
      }
      tmp.fwd.addScaledVector(tmp.axis, -tmp.fwd.dot(tmp.axis));
      if (tmp.fwd.lengthSq() < 1e-6) tmp.fwd.set(1, 0, 0);
    }
    tmp.fwd.normalize();
    // 落定身体中心:沿花轴抬起、略后退
    tmp.perch
      .copy(tmp.vLand)
      .addScaledVector(tmp.axis, PERCH_UP)
      .addScaledVector(tmp.fwd, -PERCH_BACK);
    // 落定朝向:X=前向、Y=花轴,再绕右轴俯身
    tmp.right.crossVectors(tmp.fwd, tmp.axis).negate().normalize(); // Z = X × Y
    tmp.m.makeBasis(tmp.fwd, tmp.axis, tmp.right.clone().negate());
    tmp.q2.setFromRotationMatrix(tmp.m);
    tmp.q2.multiply(tmp.q.setFromAxisAngle(tmp.a.set(0, 0, 1), -PITCH_DOWN));

    const duration = profile.phase[s.phase as Exclude<VisitPhase, "done">] ?? 1;
    const t = s.phase === "done" ? 1 : Math.min((now - s.phaseStart) / duration, 1);
    const ease = t * t * (3 - 2 * t);
    let flap = 1;
    let oriented = false;
    tmp.prev.copy(g.position);

    if (s.phase === "enter") {
      // 绕花心螺旋渐近约 1.8 圈,半径与高度同步收紧
      const theta0 = Math.atan2(-tmp.fwd.z, -tmp.fwd.x);
      const theta = theta0 + Math.PI * 0.8 + (1 - ease) * Math.PI * profile.spiralTurns;
      const radius = THREE.MathUtils.lerp(profile.spiralR0, SPIRAL_R1, ease);
      const height = THREE.MathUtils.lerp(SPIRAL_H0, SPIRAL_H1, ease);
      // 抬升沿落点法线而非世界上方:倒挂的花(蓝莓)从下方兜进,横向的花从正面接近,
      // 否则螺旋会撞上花上方的枝条/叶
      tmp.pos.copy(tmp.vCenter).addScaledVector(tmp.axis, height);
      tmp.pos.x += Math.cos(theta) * radius;
      tmp.pos.z += Math.sin(theta) * radius;
      g.position.copy(tmp.pos);
      tmp.look.copy(g.position).sub(tmp.prev);
      if (tmp.look.lengthSq() < 1e-8) tmp.look.copy(tmp.vCenter).sub(g.position);
      if (t >= 1) setPhase("hover", now);
    } else if (s.phase === "hover") {
      tmp.pos
        .copy(tmp.perch)
        .addScaledVector(tmp.axis, HOVER_BACK)
        .addScaledVector(tmp.fwd, -HOVER_BACK * 0.5);
      tmp.pos.y += Math.sin(now * (flight === "heavy" ? 3.6 : 5.2)) * profile.hoverBob;
      g.position.lerp(tmp.pos, 0.12);
      tmp.look.copy(tmp.vLand).sub(g.position);
      if (t >= 1) setPhase("land", now);
    } else if (s.phase === "land") {
      // 从悬停点缓落到栖姿点,姿态渐入落姿
      tmp.pos
        .copy(tmp.perch)
        .addScaledVector(tmp.axis, HOVER_BACK * (1 - ease))
        .addScaledVector(tmp.fwd, -HOVER_BACK * 0.5 * (1 - ease));
      g.position.lerp(tmp.pos, 0.35);
      g.quaternion.slerp(tmp.q2, 0.22);
      oriented = true;
      flap = 1 - ease;
      if (t >= 1) setPhase("probe", now);
    } else if (s.phase === "probe") {
      // 落定:贴栖姿点(锚点随风摆,蜂跟着摆);轻微取蜜俯仰
      if (pollen) {
        // 花粉筐彩蛋:取蜜过程中后足花粉团渐渐鼓起
        const grow = motion ? ease : 1;
        for (const node of pollenNodes) {
          node.visible = grow > 0.08;
          // 标本馆的花粉团是放大过的示意尺寸,访花场景按比例缩小
          const sc = (0.35 + 0.65 * grow) * 0.45;
          node.scale.set(sc, sc, sc);
        }
      }
      g.position.copy(tmp.perch);
      tmp.q.setFromAxisAngle(tmp.a.set(0, 0, 1), motion ? Math.sin(now * 3.1) * 0.05 : 0);
      g.quaternion.copy(tmp.q2).multiply(tmp.q);
      oriented = true;
      flap = 0;
      if (motion && t >= 1) setPhase("takeoff", now);
    } else if (s.phase === "takeoff") {
      tmp.pos
        .copy(tmp.perch)
        .addScaledVector(tmp.axis, 1 + ease * 7)
        .addScaledVector(tmp.fwd, -(0.5 + ease * 9));
      g.position.lerp(tmp.pos, 0.14);
      tmp.look.copy(g.position).sub(tmp.prev);
      if (tmp.look.lengthSq() < 1e-8) tmp.look.copy(tmp.axis);
      if (t >= 1) setPhase("done", now);
    } else {
      g.visible = false;
      return;
    }
    g.visible = true;

    // 飞行阶段:头(+X)对准飞行方向,平滑转身;笨重型附加机身晃动
    if (!oriented && tmp.look.lengthSq() > 1e-8) {
      tmp.look.normalize();
      tmp.m.lookAt(tmp.a.set(0, 0, 0), tmp.look, THREE.Object3D.DEFAULT_UP);
      tmp.q.setFromRotationMatrix(tmp.m);
      // lookAt 把 -Z 对向目标,蜂的前向是 +X:补一个偏航
      tmp.q.multiply(tmp.q2.setFromAxisAngle(tmp.a.set(0, 1, 0), Math.PI / 2));
      if (profile.rollAmp > 0) {
        tmp.q.multiply(
          tmp.q2.setFromAxisAngle(tmp.a.set(1, 0, 0), Math.sin(now * 5.7) * profile.rollAmp),
        );
      }
      g.quaternion.slerp(tmp.q, 0.14);
    }

    // 扇翅:飞行高频,落定收拢(频率/幅度随飞行性格)
    const flapAngle = Math.sin(now * 2 * Math.PI * profile.flapHz) * profile.flapAmp * flap;
    for (const w of wings) {
      w.node.quaternion
        .setFromAxisAngle(tmp.a.set(1, 0, 0), flapAngle * w.sign)
        .multiply(w.rest);
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={bee} />
    </group>
  );
}
