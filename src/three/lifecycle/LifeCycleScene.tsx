import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { LifeCycle } from "../../data/schemas/content";
import { stageAt } from "../../data/life-cycles";
import type { WesternHoneyBeeSpecimen } from "../bees/species/apis-mellifera-worker";
import { applyHeroIdleMotion } from "../bees/species/apis-mellifera-worker-hero";
import { applyHoneyBeeIdleMotion } from "../bees/motion/worker-idle";
import { loadSpecimen, type SpecimenId } from "../registry/specimen-registry";
import { StageSetting } from "../viewer/WesternHoneyBeeViewer";
import { Cocoon, Egg, Grub } from "./organisms";

/*
 * 生命历程场景(产品方案 §4.5 / §8.3):
 * 由时间轴位置 t 直接决定一切可见状态——卵、幼虫、蜡盖/泥隔、茧、成蜂的位置与配色。
 * 社会性故事:一片巢脾的剖视,焦点巢房里从卵到蛹,出房后成蜂按年龄分工换位。
 * 独居故事:一根剖开的巢管,雌蜂由后向前逐间储粉、产卵、封泥;后代在各间里长、结茧、越冬。
 * 成蜂复用标本馆的烘焙精模;蛹期/茧内期用统一浅色材质覆盖,再逐渐"上色"。
 */

const GROUND_Y = -0.79;
/** 巢房里的蜜蜂幼虫:卷成 C 形,体节 12 */
const GRUB_IN_CELL = { curl: Math.PI * 1.25, bend: 0.2, radius: 0.09, segments: 12, bump: 0.1 } as const;
/** 巢管里的壁蜂幼虫:更粗壮,卷曲略松 */
const GRUB_IN_TUBE = { curl: Math.PI * 1.0, bend: 0.27, radius: 0.165, segments: 12, bump: 0.12 } as const;
const ADULT_SCALE = 0.28; // 蜂体 ≈ 巢房直径 2.5 倍(工蜂约 13 mm,巢房约 5.3 mm)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

type V3 = [number, number, number];

/** 站点行为动画(P1,motion 门控;手法同蜂蜜工坊 HiveBees):
    groom=梳理点头 / probe=探头进巢房 / build=低头抹蜡画圈 / scan=警戒扫视 / patrol=小 8 字巡飞 */
type BeeAct = "groom" | "probe" | "build" | "scan" | "patrol";

interface BeePose {
  position: V3;
  rotation: V3;
  scale: number;
  /** 1 = 完全浅色(蛹/茧内初期),0 = 原色 */
  pale: number;
  pollen: boolean;
  /** 悬停轻浮(外勤飞行) */
  hover: boolean;
  animate: boolean;
  act?: BeeAct;
}

interface CameraPreset {
  position: V3;
  target: V3;
}

export function LifeCycleScene({
  story,
  t,
  motion,
  interactive,
}: {
  story: LifeCycle;
  t: number;
  motion: boolean;
  /** false = 测试用固定视角:不装轨道控制、状态即时落位 */
  interactive: boolean;
}) {
  const specimen = useCycleSpecimen(story.speciesId);
  const snap = !interactive;
  const { invalidate } = useThree();
  useEffect(() => {
    invalidate();
  }, [specimen, t, invalidate]);

  return (
    <>
      <StageSetting fogRange={[11, 19]} />
      {story.kind === "social" ? (
        <HoneyBeeCycle story={story} t={t} specimen={specimen} motion={motion} snap={snap} />
      ) : (
        <SolitaryCycle story={story} t={t} specimen={specimen} motion={motion} snap={snap} />
      )}
    </>
  );
}

// ---------------------------------------------------------------- 标本加载

function useCycleSpecimen(speciesId: string) {
  const [specimen, setSpecimen] = useState<WesternHoneyBeeSpecimen | null>(null);
  useEffect(() => {
    let cancelled = false;
    let owned: WesternHoneyBeeSpecimen | null = null;
    window.__specimenReady = false;
    void loadSpecimen(`${speciesId}-worker-hero` as SpecimenId, {
      caste: "worker",
      quality: "high",
      seed: 1,
      pollenLoad: 0.6,
    })
      .catch(() => loadSpecimen(`${speciesId}-worker` as SpecimenId, { caste: "worker" }))
      .then((loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }
        owned = loaded;
        setSpecimen(loaded);
        window.__specimenReady = true;
        window.__specimenGeneration = (window.__specimenGeneration ?? 0) + 1;
      });
    return () => {
      cancelled = true;
      owned?.dispose();
      setSpecimen(null);
    };
  }, [speciesId]);
  return specimen;
}

/** 模型体长(未缩放的根节点单位) */
function modelLength(specimen: WesternHoneyBeeSpecimen) {
  return specimen.bounds.getSize(new THREE.Vector3()).x || 1;
}
/** 足尖落地所需的 y */
function feetY(specimen: WesternHoneyBeeSpecimen, scale: number) {
  return GROUND_Y - specimen.bounds.min.y * scale;
}

// ---------------------------------------------------------------- 成蜂

// 行为层的模块级临时量(避免每帧分配;蜂 GLB 约定头朝 +X、背 +Y:俯仰绕 Z、偏航绕 Y、扇翅绕 X)
const ACT_X_AXIS = new THREE.Vector3(1, 0, 0);
const ACT_Y_AXIS = new THREE.Vector3(0, 1, 0);
const ACT_Z_AXIS = new THREE.Vector3(0, 0, 1);
const actTmpQuat = new THREE.Quaternion();

// 蛹的着色顺序(参照真实蜜蜂蛹):体表先是乳白,复眼先变粉→紫褐→深褐,体表随后才转为琥珀褐
const PALE_FROM = new THREE.Color("#f4ecdc");
const PALE_TO = new THREE.Color("#a8824e");
const EYE_FROM = new THREE.Color("#f0dada");
const EYE_TO = new THREE.Color("#3a2416");

function CycleBee({
  specimen,
  pose,
  motion,
  snap,
}: {
  specimen: WesternHoneyBeeSpecimen;
  pose: BeePose | null;
  motion: boolean;
  snap: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);
  const initialized = useRef(false);
  // 行为层节点:头(点头/扫视)与翅(巡飞扇翅覆盖待机微颤)。
  // rest 四元数取自加载态;行为不激活时每帧复位(motion=0 / 快照模式与旧版逐位一致)
  const actRefs = useMemo<{
    head: { node: THREE.Object3D; rest: THREE.Quaternion } | null;
    wings: Array<{ node: THREE.Object3D; rest: THREE.Quaternion; sign: number }>;
  }>(() => {
    let head: { node: THREE.Object3D; rest: THREE.Quaternion } | null = null;
    const wings: Array<{ node: THREE.Object3D; rest: THREE.Quaternion; sign: number }> = [];
    specimen.root.traverse((node) => {
      if (node.name === "head") head = { node, rest: node.quaternion.clone() };
      if (/^(foreWing|hindWing)/.test(node.name)) {
        wings.push({ node, rest: node.quaternion.clone(), sign: node.name.endsWith("L") ? 1 : -1 });
      }
    });
    return { head, wings };
  }, [specimen]);
  const overridden = useRef(new Map<THREE.Mesh, THREE.Material | THREE.Material[]>());
  const paleMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: PALE_FROM.clone(), roughness: 0.62, metalness: 0, sheen: 0.5, sheenColor: new THREE.Color("#fff3e0"), sheenRoughness: 0.7 }),
    [],
  );
  const paleEyeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: EYE_FROM.clone(), roughness: 0.35, metalness: 0 }),
    [],
  );
  useEffect(
    () => () => {
      paleMaterial.dispose();
      paleEyeMaterial.dispose();
    },
    [paleMaterial, paleEyeMaterial],
  );

  // 花粉团(精模中以 pollen* 命名)只在外勤阶段可见
  useEffect(() => {
    specimen.root.traverse((object) => {
      if (/^pollen/i.test(object.name)) object.visible = Boolean(pose?.pollen);
    });
  }, [specimen, pose?.pollen]);

  const setPale = (pale: number) => {
    if (pale > 0.001) {
      const progress = 1 - pale; // 0 = 刚化蛹,1 = 即将出房
      // 复眼在前半段完成着色,体表在后 3/4 段逐渐转褐
      paleEyeMaterial.color.copy(EYE_FROM).lerp(EYE_TO, Math.min(1, progress / 0.5));
      paleMaterial.color.copy(PALE_FROM).lerp(PALE_TO, Math.max(0, (progress - 0.25) / 0.75));
      specimen.root.traverse((object) => {
        if (object instanceof THREE.Mesh && !overridden.current.has(object)) {
          overridden.current.set(object, object.material);
          object.material = /^(compoundEye|ocellus)/.test(object.name) ? paleEyeMaterial : paleMaterial;
        }
      });
    } else if (overridden.current.size > 0) {
      for (const [mesh, material] of overridden.current) mesh.material = material;
      overridden.current.clear();
    }
  };
  // 卸载时恢复原材质(标本可能被别处复用)
  useEffect(() => () => setPale(0), []); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (k: number, elapsed: number) => {
    const g = group.current;
    if (!g) return;
    if (!pose) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const target = new THREE.Vector3(...pose.position);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...pose.rotation));
    if (!initialized.current) {
      k = 1;
      initialized.current = true;
    }
    g.position.lerp(target, k);
    g.quaternion.slerp(q, k);
    g.scale.setScalar(lerp(g.scale.x, pose.scale, k));
    setPale(pose.pale);
    const animate = motion && pose.animate;
    if (specimen.metadata.id.endsWith("-hero")) applyHeroIdleMotion(specimen, elapsed, animate);
    else applyHoneyBeeIdleMotion(specimen, elapsed, animate);

    // ---- 行为层(P1):一切偏移只写在 bob 子组与头/翅节点上,基座 lerp 不受影响。
    // 位移单位取蜂体长比例(len),对不同物种/缩放通用;不激活时全部归零复位。
    const b = bob.current;
    if (!b) return;
    b.position.set(0, pose.hover ? Math.sin(elapsed * 2.2) * 0.05 : 0, 0);
    b.rotation.set(0, 0, 0);
    if (actRefs.head) actRefs.head.node.quaternion.copy(actRefs.head.rest);
    const act = animate ? pose.act : undefined;
    if (!act) return;
    const len = modelLength(specimen);
    // 平滑 0→1→0 循环脉冲(同工坊)
    const pulse = (period: number) => 0.5 - 0.5 * Math.cos((elapsed * Math.PI * 2) / period);
    let headPitch = 0;
    let headYaw = 0;
    if (act === "groom") {
      // 梳理:低头-抬头循环 + 身体轻微前倾配合
      const p = pulse(2.6);
      headPitch = -0.2 * p;
      b.rotation.z = -0.05 * p;
      b.position.x += 0.015 * len * p;
    } else if (act === "probe") {
      // 探头进巢房:前移-停留-退回 + 整体俯身(同工坊转化站)
      const p = pulse(3.6);
      b.position.x += 0.06 * len * p;
      b.rotation.z = -0.1 * p;
      headPitch = -0.14 * p;
    } else if (act === "build") {
      // 抹蜡:头低伏,贴面缓慢画小圈
      b.position.x += Math.cos(elapsed * 0.7) * 0.04 * len;
      b.position.z += Math.sin(elapsed * 0.7) * 0.04 * len;
      headPitch = -0.12;
    } else if (act === "scan") {
      // 警戒扫视:头部低频×低频左右转(出偶发感),身体微随
      const sway = Math.sin(elapsed * 0.9) * Math.sin(elapsed * 0.23);
      headYaw = 0.38 * sway;
      b.rotation.y = 0.09 * sway;
    } else if (act === "patrol") {
      // 巡飞:悬停点附近的小 8 字漂移 + 侧倾,翅膀换高频扇动
      const tau = elapsed * ((Math.PI * 2) / 10);
      b.position.x += Math.cos(tau) * 0.16 * len;
      b.position.z += Math.sin(tau * 2) * 0.09 * len;
      b.position.y += Math.sin(tau * 2 + 1) * 0.03 * len;
      b.rotation.x = Math.sin(tau) * 0.09;
      b.rotation.y = -Math.sin(tau) * 0.14;
      const flap = Math.sin(elapsed * Math.PI * 2 * 19) * 0.55;
      for (const w of actRefs.wings) {
        w.node.quaternion.setFromAxisAngle(ACT_X_AXIS, flap * w.sign).multiply(w.rest);
      }
    }
    if (actRefs.head && (headPitch !== 0 || headYaw !== 0)) {
      actRefs.head.node.quaternion
        .setFromAxisAngle(ACT_Z_AXIS, headPitch)
        .multiply(actTmpQuat.setFromAxisAngle(ACT_Y_AXIS, headYaw))
        .multiply(actRefs.head.rest);
    }
  };

  useEffect(() => {
    if (snap) apply(1, 0);
  }); // 固定视角模式:每次渲染即时落位
  useFrame((state, dt) => {
    if (snap) return;
    apply(Math.min(1, dt * 4.5), state.clock.elapsedTime);
  });

  return (
    <group ref={group} visible={false}>
      <group ref={bob}>
        <primitive object={specimen.root} />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------- 镜头

function CycleCamera({
  preset,
  interactive,
}: {
  preset: CameraPreset;
  interactive: boolean;
}) {
  const { camera, controls, invalidate } = useThree();
  const target = useRef(new THREE.Vector3(...preset.target));
  const rig = useRef(true);
  const key = `${preset.position.join(",")}|${preset.target.join(",")}`;

  useEffect(() => {
    rig.current = true;
    if (!interactive) {
      camera.position.set(...preset.position);
      target.current.set(...preset.target);
      camera.lookAt(target.current);
      invalidate();
    }
  }, [key, interactive, camera, invalidate]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    if (!interactive || !rig.current) return;
    const k = Math.min(1, dt * 3);
    camera.position.lerp(new THREE.Vector3(...preset.position), k);
    target.current.lerp(new THREE.Vector3(...preset.target), k);
    const orbit = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (orbit && "target" in orbit) {
      orbit.target.copy(target.current);
      orbit.update();
    } else {
      camera.lookAt(target.current);
    }
  });

  if (!interactive) return null;
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      minDistance={1.2}
      maxDistance={12}
      maxPolarAngle={Math.PI * 0.62}
      onStart={() => {
        rig.current = false;
      }}
    />
  );
}

// ---------------------------------------------------------------- 社会性:巢脾

const CELL_R = 0.36;
const CELL_DX = CELL_R * Math.sqrt(3);
const CELL_DY = CELL_R * 1.5;
const CELL_DEPTH = 1.0;
const CELL_FRONT_Z = -0.3;
const CELL_BACK_Z = CELL_FRONT_Z - CELL_DEPTH;
const FOCAL = { i: 0, j: 2 };
const cellX = (i: number, j: number) => i * CELL_DX + (j % 2 ? CELL_DX / 2 : 0);
const cellY = (j: number) => GROUND_Y + 0.25 + j * CELL_DY;
const FOCAL_X = cellX(FOCAL.i, FOCAL.j);
const FOCAL_Y = cellY(FOCAL.j);
const FOCAL_ZC = CELL_FRONT_Z - CELL_DEPTH / 2;

function HoneyBeeCycle({
  story,
  t,
  specimen,
  motion,
  snap,
}: {
  story: LifeCycle;
  t: number;
  specimen: WesternHoneyBeeSpecimen | null;
  motion: boolean;
  snap: boolean;
}) {
  const stage = stageAt(story, t);
  const cells = useMemo(() => {
    const list: Array<{ i: number; j: number; capped: boolean }> = [];
    for (let j = 0; j < 7; j += 1) {
      for (let i = -6; i <= 6; i += 1) {
        const focal = i === FOCAL.i && j === FOCAL.j;
        list.push({ i, j, capped: !focal && (i * 5 + j * 3 + 20) % 4 === 0 });
      }
    }
    return list;
  }, []);

  // ---- 焦点巢房内容随 t 变化 ----
  const eggScale = t < 3 ? 1 : lerp(1, 0, ramp(t, 3, 3.3));
  const larvaScale = t < 3 ? 0 : t < 10 ? lerp(0.45, 1.3, ramp(t, 3, 9)) : 0;
  // 蜡盖:封盖淡入→剖视半透;出房时从中心被咬开(孔渐大,P3),咬剩的圈缘再淡出
  const capOpacity =
    t < 8.6 ? 0
    : t < 9.4 ? lerp(0, 0.92, ramp(t, 8.6, 9.4))
    : t < 10.2 ? lerp(0.92, 0.42, ramp(t, 9.4, 10.2))
    : t < 21.3 ? 0.42
    : lerp(0.42, 0, ramp(t, 21.3, 21.9));
  const capHole = ramp(t, 20.5, 21.0) * 0.86; // 孔半径(占 CELL_R 比例);0 = 完整蜡盖走原渲染分支
  const combOpacity = t < 41 ? 1 : lerp(1, 0.32, ramp(t, 41, 43));
  const newWaxScale = t < 33 ? 0 : lerp(0, 1, ramp(t, 33, 35));
  const entranceScale = t < 37.5 ? 0 : t < 41.5 ? lerp(0, 1, ramp(t, 37.5, 38.2)) : lerp(1, 0, ramp(t, 41.5, 42.5));
  const nurseLarvae = t >= 23 && t < 33;

  // ---- 成蜂位姿 ----
  const pose = useMemo<BeePose | null>(() => {
    if (!specimen) return null;
    const length = modelLength(specimen);
    if (t < 9.8) return null;
    if (t < 21) {
      // 蛹:头朝巢房口(+z),浅色渐深
      const scale = (CELL_DEPTH * 0.88) / length;
      return {
        position: [FOCAL_X, FOCAL_Y - 0.02, FOCAL_ZC],
        rotation: [0, -Math.PI / 2, 0],
        scale,
        pale: 1 - 0.55 * ramp(t, 10, 20),
        pollen: false,
        hover: false,
        animate: false,
      };
    }
    const y = feetY(specimen, ADULT_SCALE);
    const base = { scale: ADULT_SCALE, pale: 0, pollen: false, hover: false, animate: true };
    // 出房(P3):蜡盖咬开后,从焦点巢房格口爬到巢脾面下,刚出房的蜂体色仍浅、渐转深
    if (t < 21.7) {
      const k = ramp(t, 21, 21.7);
      return {
        ...base,
        position: [lerp(FOCAL_X, -0.2, k), lerp(FOCAL_Y - 0.05, y, k), lerp(CELL_FRONT_Z + 0.12, 0.4, k)],
        // 目标偏航取 -2π 等价角,爬出时就近转身而不是原地转大半圈
        rotation: [0, lerp(-Math.PI / 2, Math.PI / 2 + 1.05 - Math.PI * 2, k), lerp(0, 0.04, k)],
        scale: lerp((CELL_DEPTH * 0.88) / length, ADULT_SCALE, k),
        pale: 0.4 * (1 - k),
      };
    }
    if (t < 23) return { ...base, position: [-0.2, y, 0.4], rotation: [0, Math.PI / 2 + 1.05, 0.04], act: "groom" };
    if (t < 33) return { ...base, position: [0.3, y, 0.35], rotation: [0, Math.PI / 2 + 0.95, 0.02], act: "probe" };
    if (t < 38) return { ...base, position: [1.0, y, 0.4], rotation: [0, Math.PI / 2 + 0.8, 0], act: "build" };
    if (t < 41) return { ...base, position: [0.55, y, 0.45], rotation: [0.03, Math.PI - 0.15, -0.06], act: "scan" };
    return {
      ...base,
      position: [0.6, y + 0.75, 1.1],
      rotation: [0.1, Math.PI - 0.5, 0.12],
      pollen: true,
      hover: true,
      act: "patrol",
    };
  }, [specimen, t]);

  const preset = useMemo<CameraPreset>(() => {
    if (stage.phase === "egg" || stage.phase === "larva" || stage.phase === "pupa") {
      return { position: [FOCAL_X + 0.7, FOCAL_Y + 0.62, CELL_FRONT_Z + 1.85], target: [FOCAL_X, FOCAL_Y - 0.08, FOCAL_ZC + 0.15] };
    }
    if (t >= 41) return { position: [1.1, 1.3, 4.3], target: [0.5, 0.45, 0.3] };
    return { position: [0.9, 0.8, 4.3], target: [0.4, -0.05, 0.2] };
  }, [stage.phase, t >= 41]); // eslint-disable-line react-hooks/exhaustive-deps

  const waxMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#e6c273", roughness: 0.62, side: THREE.DoubleSide, transparent: true }),
    [],
  );
  const focalWaxMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#efd28a", roughness: 0.55, side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthWrite: false }),
    [],
  );
  const capMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d3a95a", roughness: 0.7, transparent: true }),
    [],
  );
  useEffect(() => () => {
    waxMaterial.dispose();
    focalWaxMaterial.dispose();
    capMaterial.dispose();
  }, [waxMaterial, focalWaxMaterial, capMaterial]);
  waxMaterial.opacity = combOpacity;
  capMaterial.opacity = combOpacity;

  return (
    <>
      <CycleCamera preset={preset} interactive={!snap} />
      {/* 巢脾:六边形巢房阵列 + 中脉底板 */}
      <group>
        <mesh position={[0, GROUND_Y + 1.85, CELL_BACK_Z - 0.03]} receiveShadow>
          <boxGeometry args={[8.2, 4.4, 0.06]} />
          <meshStandardMaterial color="#c9a052" roughness={0.9} transparent opacity={combOpacity} />
        </mesh>
        {cells.map(({ i, j, capped }) => (
          <group key={`${i}:${j}`} position={[cellX(i, j), cellY(j), FOCAL_ZC]}>
            <mesh
              rotation={[Math.PI / 2, 0, 0]}
              material={i === FOCAL.i && j === FOCAL.j ? focalWaxMaterial : waxMaterial}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[CELL_R * 0.93, CELL_R * 0.93, CELL_DEPTH, 6, 1, true]} />
            </mesh>
            {capped && (
              <mesh position={[0, 0, CELL_DEPTH / 2 + 0.02]} rotation={[Math.PI / 2, 0, 0]} material={capMaterial}>
                <cylinderGeometry args={[CELL_R * 0.9, CELL_R * 0.9, 0.05, 6]} />
              </mesh>
            )}
            {/* 哺育阶段:底排几间敞开巢房里有幼虫 */}
            {nurseLarvae && j === 0 && [-3, -1, 2, 4].includes(i) && (
              <Grub
                position={[0, -CELL_R * 0.62, 0.05]}
                rotation={[0, (i * 0.9) % Math.PI, 0]}
                scale={0.72}
                options={GRUB_IN_CELL}
                motion={motion}
                phase={i * 1.3}
              />
            )}
          </group>
        ))}
        {/* 新造的浅色巢房(筑巢阶段) */}
        {newWaxScale > 0 &&
          [7, 8, 9].map((i) =>
            [3, 4, 5].map((j) => (
              <mesh
                key={`new-${i}-${j}`}
                position={[cellX(i, j), cellY(j), FOCAL_ZC]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[newWaxScale, 1, newWaxScale]}
                castShadow
              >
                <cylinderGeometry args={[CELL_R * 0.93, CELL_R * 0.93, CELL_DEPTH, 6, 1, true]} />
                <meshStandardMaterial color="#f7ead0" roughness={0.55} side={THREE.DoubleSide} transparent opacity={combOpacity} />
              </mesh>
            )),
          )}
        {/* 巢门(守卫阶段) */}
        {entranceScale > 0 && (
          <mesh position={[0.3, GROUND_Y + 0.1, CELL_FRONT_Z + 0.25]} scale={[1, entranceScale, 1]}>
            <boxGeometry args={[2.4, 0.2, 0.5]} />
            <meshStandardMaterial color="#3b2a14" roughness={1} />
          </mesh>
        )}
      </group>

      {/* 焦点巢房内容 */}
      <group position={[FOCAL_X, FOCAL_Y, 0]}>
        {eggScale > 0 && t < 3.3 && (
          <Egg position={[0, -CELL_R * 0.5 + 0.09, CELL_BACK_Z + 0.1]} rotation={[Math.PI / 2 - 0.35, 0, 0.2]} scale={eggScale} />
        )}
        {larvaScale > 0 && (
          <Grub
            position={[0, -CELL_R * 0.62, FOCAL_ZC - 0.02]}
            rotation={[0, 0.9, 0]}
            scale={larvaScale}
            options={GRUB_IN_CELL}
            motion={motion}
          />
        )}
        {capOpacity > 0 &&
          (capHole <= 0 ? (
            <mesh position={[0, 0, CELL_FRONT_Z + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[CELL_R * 0.9, CELL_R * 0.9, 0.05, 6]} />
              <meshStandardMaterial color="#d9b05e" roughness={0.7} transparent opacity={capOpacity} depthWrite={false} />
            </mesh>
          ) : (
            <RingDisc
              position={[0, 0, CELL_FRONT_Z + 0.02]}
              outline="hex"
              outer={CELL_R * 0.9}
              hole={CELL_R * capHole}
              color="#d9b05e"
              opacity={capOpacity}
            />
          ))}
      </group>

      {specimen && <CycleBee specimen={specimen} pose={pose} motion={motion} snap={snap} />}
    </>
  );
}

// ---------------------------------------------------------------- 被咬开的盖/隔(P3)

/** 带圆孔的平面盘(XY 平面,面向 +z):蜡盖被咬开 / 泥隔被咬穿的通用件。
    孔为 0 的完整态不要用它——各调用点保留原几何分支,保证既有画面逐位不变。 */
function RingDisc({
  position,
  rotation,
  outline,
  outer,
  hole,
  holeOffsetY = 0,
  color,
  opacity,
}: {
  position: V3;
  rotation?: V3;
  outline: "hex" | "circle";
  outer: number;
  hole: number;
  /** 孔心相对盘心的 y 偏移(泥隔在蜂爬行高度被咬穿) */
  holeOffsetY?: number;
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    if (outline === "hex") {
      // 尖角朝上(60i+30°),与巢房格口方向一致
      for (let i = 0; i < 6; i += 1) {
        const a = THREE.MathUtils.degToRad(60 * i + 30);
        const x = Math.cos(a) * outer;
        const y = Math.sin(a) * outer;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
    } else {
      shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
    }
    const holePath = new THREE.Path();
    holePath.absarc(0, holeOffsetY, hole, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
    return new THREE.ShapeGeometry(shape, 24);
  }, [outline, outer, hole, holeOffsetY]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh position={position} rotation={rotation ?? [0, 0, 0]} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        roughness={0.85}
        transparent
        opacity={opacity}
        depthWrite={opacity >= 0.99}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** 泥隔碎屑:咬穿进度 p 驱动的确定性掉落(加速下坠,落地后存留) */
const CHIP_SPECS = [
  { dx: -0.12, dz: 0.16, size: 0.075, spin: 0.7, drift: 0.1 },
  { dx: 0.1, dz: 0.24, size: 0.06, spin: 2.1, drift: -0.14 },
  { dx: 0.04, dz: -0.2, size: 0.085, spin: 4.4, drift: 0.05 },
  { dx: -0.05, dz: 0.3, size: 0.055, spin: 1.3, drift: 0.18 },
] as const;

function MudChips({ x, progress }: { x: number; progress: number }) {
  if (progress <= 0.05) return null;
  const p = clamp01((progress - 0.05) / 0.95);
  return (
    <>
      {CHIP_SPECS.map((chip, i) => {
        const fall = p * p; // 加速下坠
        const y0 = TUBE_Y - 0.18;
        const y1 = CELL_FLOOR_Y + chip.size * 0.5;
        return (
          <mesh
            key={i}
            position={[x + chip.dx + chip.drift * p, lerp(y0, y1, fall), chip.dz * 0.6]}
            rotation={[chip.spin, chip.spin * 1.7, chip.spin * 0.6]}
            castShadow
          >
            <boxGeometry args={[chip.size, chip.size * 0.7, chip.size]} />
            <meshStandardMaterial color="#7d5c3a" roughness={1} />
          </mesh>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------- 独居:巢管

const TUBE_R = 0.62;
const TUBE_Y = GROUND_Y + TUBE_R;
const TUBE_LEN = 5.6;
const EDGES = [-2.5, -1.05, 0.4, 1.85];
const FOCAL_CELL = 1;
const CELL_COUNT = EDGES.length - 1;
const cellCenter = (k: number) => (EDGES[k] + EDGES[k + 1]) / 2;
const CELL_FLOOR_Y = TUBE_Y - TUBE_R + 0.02;

function SolitaryCycle({
  story,
  t,
  specimen,
  motion,
  snap,
}: {
  story: LifeCycle;
  t: number;
  specimen: WesternHoneyBeeSpecimen | null;
  motion: boolean;
  snap: boolean;
}) {
  const stage = stageAt(story, t);
  const offset = (k: number) => k * 0.16; // 雌蜂由后向前逐间营巢

  const pose = useMemo<BeePose | null>(() => {
    if (!specimen) return null;
    const length = modelLength(specimen);
    // 雌蜂约 10 mm,巢管内径约 7–8 mm:蜂体 ≈ 1.4 倍管径
    const adultScale = (TUBE_R * 2 * 1.4) / length;
    const y = feetY(specimen, adultScale);
    const base = { scale: adultScale, pale: 0, pollen: false, hover: false, animate: true };
    if (t < 0.3) return { ...base, position: [2.45, y, 0.55], rotation: [0.03, Math.PI - 0.55, -0.04], act: "scan" };
    // 筑巢:在巢管口,头朝管内(-x),身体在管底;探头动作 = 储粉/整巢。
    // 封最后一道泥隔(t>0.7)时移到管口外侧作业,身体不再穿过成型中的泥隔
    if (t < 1.05) {
      const nestX = t > 0.7 ? 2.95 : 2.15;
      return { ...base, position: [nestX, CELL_FLOOR_Y - specimen.bounds.min.y * adultScale, 0.02], rotation: [0, Math.PI, 0.02], act: "probe" };
    }
    if (t < 4.9) return null;
    // 茧内成蜂:头朝巢管口(+x)
    const cocoonScale = 1.0 / length;
    if (t < 11.55) {
      return {
        position: [cellCenter(FOCAL_CELL), CELL_FLOOR_Y + 0.3, 0],
        rotation: [0, 0, 0],
        scale: cocoonScale,
        pale: 1 - ramp(t, 5.0, 6.2),
        pollen: false,
        hover: false,
        animate: false,
      };
    }
    // 次年出巢:沿巢管爬出,落到地面;完全出巢后原地张望
    const k = ramp(t, 11.55, 11.92);
    return {
      ...base,
      position: [lerp(cellCenter(FOCAL_CELL), 2.3, k), lerp(CELL_FLOOR_Y + 0.3, y, k), lerp(0, 0.6, k)],
      rotation: [0, lerp(0, -0.45, k), 0],
      scale: lerp(cocoonScale, adultScale, k),
      act: k >= 1 ? "scan" : undefined,
    };
  }, [specimen, t]);

  const preset = useMemo<CameraPreset>(() => {
    if (stage.phase === "nest" || stage.phase === "emerge") {
      return { position: [2.0, 1.5, 4.9], target: [0.85, -0.3, 0] };
    }
    return { position: [cellCenter(FOCAL_CELL) + 0.9, 1.1, 2.7], target: [cellCenter(FOCAL_CELL), -0.32, 0] };
  }, [stage.phase]);

  const tubeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#cdb98f", roughness: 0.85, side: THREE.DoubleSide }),
    [],
  );
  useEffect(() => () => tubeMaterial.dispose(), [tubeMaterial]);

  return (
    <>
      <CycleCamera preset={preset} interactive={!snap} />
      {/* 剖开的巢管(去掉前上方四分之三,露出内部) */}
      <mesh position={[0, TUBE_Y, 0]} rotation={[0, 0, Math.PI / 2]} material={tubeMaterial} receiveShadow castShadow>
        <cylinderGeometry args={[TUBE_R, TUBE_R, TUBE_LEN, 48, 1, true, Math.PI * 0.5, Math.PI * 1.3]} />
      </mesh>
      {/* 后方两根完整的巢管作背景 */}
      <mesh position={[0.4, TUBE_Y, -1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[TUBE_R * 0.9, TUBE_R * 0.9, TUBE_LEN - 0.4, 32]} />
        <meshStandardMaterial color="#bfa87c" roughness={0.9} />
      </mesh>
      <mesh position={[-0.3, TUBE_Y + TUBE_R * 1.7, -1.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[TUBE_R * 0.85, TUBE_R * 0.85, TUBE_LEN - 0.6, 32]} />
        <meshStandardMaterial color="#c8b389" roughness={0.9} />
      </mesh>

      {/* 泥隔:由后向前依次出现;次年春天前方的被逐道咬穿(P3):
          孔在爬行高度渐大、咬剩的圈缘存留、碎屑落到管底 */}
      {EDGES.map((x, k) => {
        const appear = ramp(t, 0.22 + offset(k), 0.3 + offset(k));
        if (appear <= 0) return null;
        const chewStart = 11.5 + (k - FOCAL_CELL - 1) * 0.2;
        const chew = k >= FOCAL_CELL + 1 ? ramp(t, chewStart, chewStart + 0.16) : 0;
        return (
          <group key={`mud-${k}`}>
            {chew <= 0 ? (
              <mesh position={[x, TUBE_Y, 0]} rotation={[0, 0, Math.PI / 2]} scale={[appear, 1, appear]}>
                <cylinderGeometry args={[TUBE_R * 0.97, TUBE_R * 0.97, 0.07, 32]} />
                <meshStandardMaterial color="#7d5c3a" roughness={1} />
              </mesh>
            ) : (
              <RingDisc
                position={[x, TUBE_Y, 0]}
                rotation={[0, Math.PI / 2, 0]}
                outline="circle"
                outer={TUBE_R * 0.97}
                hole={TUBE_R * 0.75 * chew}
                holeOffsetY={-0.15}
                color="#7d5c3a"
                opacity={1}
              />
            )}
            <MudChips x={x} progress={chew} />
          </group>
        );
      })}

      {/* 每一间的内容 */}
      {Array.from({ length: CELL_COUNT }, (_, k) => k).map((k) => {
        const o = offset(k);
        const cx = cellCenter(k);
        const focal = k === FOCAL_CELL;
        const loafAppear = ramp(t, 0.3 + o, 0.42 + o);
        const loafShrink = t < 1.4 ? 1 : lerp(1, 0.12, ramp(t, 1.4, 2.8));
        const loafScale = t < 3.0 ? loafAppear * loafShrink : 0;
        const eggVisible = t >= 0.4 + o && t < 1.45;
        const larvaScale = t < 1.4 ? 0 : t < 3.0 ? lerp(0.45, 1.08, ramp(t, 1.4, 2.8)) : 0;
        const cocoonScale = t < 2.8 ? 0 : lerp(0, 1, ramp(t, 2.8, 3.15));
        const cocoonOpacity = !focal
          ? 1
          : t < 4.8 ? 1
          : t < 5.2 ? lerp(1, 0.42, ramp(t, 4.8, 5.2))
          : t < 11.5 ? 0.42
          : lerp(0.42, 0.12, ramp(t, 11.5, 11.7));
        return (
          <group key={`cell-${k}`} position={[cx, CELL_FLOOR_Y, 0]}>
            {loafScale > 0 && (
              <mesh position={[-0.25, 0.24 * loafScale, 0]} scale={[1.5 * loafScale, 0.85 * loafScale, 1.05 * loafScale]} castShadow>
                <sphereGeometry args={[0.28, 24, 18]} />
                <meshStandardMaterial color="#d9a832" roughness={0.95} />
              </mesh>
            )}
            {eggVisible && (
              <Egg position={[-0.2, 0.5 * loafAppear, 0.05]} rotation={[0, 0.3, Math.PI / 2 - 0.2]} scale={loafAppear} length={0.11} radius={0.035} />
            )}
            {larvaScale > 0 && (
              <Grub
                position={[0.12, 0.01, 0.02]}
                rotation={[0, 1.25, 0]}
                scale={larvaScale}
                options={GRUB_IN_TUBE}
                motion={motion}
                phase={k * 1.1}
              />
            )}
            {cocoonScale > 0 && (
              <Cocoon
                position={[0, 0.33 * cocoonScale, 0]}
                scale={[2.0 * cocoonScale, 1.1 * cocoonScale, 1.1 * cocoonScale]}
                opacity={cocoonOpacity}
              />
            )}
          </group>
        );
      })}

      {specimen && <CycleBee specimen={specimen} pose={pose} motion={motion} snap={snap} />}
    </>
  );
}
