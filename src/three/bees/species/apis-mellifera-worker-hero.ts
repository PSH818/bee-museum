import * as THREE from "three";
import { asset } from "../../../lib/asset";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { disposeObjectTree } from "../../core/dispose";
import {
  assertSpecimenIntegrity,
  createAnchor,
  measureSpecimen,
} from "../../core/specimen";
import type { BeeAnchorId, BeeBuildOptions } from "../types";
import type { WesternHoneyBeeSpecimen } from "./apis-mellifera-worker";

// Baked hero assets (Blender): 1 unit = 1 cm, +X head, origin at thorax center,
// named anchors on nodes, wing-flap clips included.
// See beemodel/bee_gen.py + beemodel/export_hero.py.
const HERO_URLS: Record<string, { high: string; low: string }> = {
  "apis-mellifera:worker": {
    high: asset("/models/bee-hero.glb"),
    low: asset("/models/bee-hero-low.glb"),
  },
  "apis-mellifera:queen": {
    high: asset("/models/bee-hero-queen.glb"),
    low: asset("/models/bee-hero-queen-low.glb"),
  },
  "apis-mellifera:drone": {
    high: asset("/models/bee-hero-drone.glb"),
    low: asset("/models/bee-hero-drone-low.glb"),
  },
  "apis-cerana:worker": {
    high: asset("/models/bee-hero-cerana.glb"),
    low: asset("/models/bee-hero-cerana-low.glb"),
  },
  "apis-cerana:queen": {
    high: asset("/models/bee-hero-cerana-queen.glb"),
    low: asset("/models/bee-hero-cerana-queen-low.glb"),
  },
  "apis-cerana:drone": {
    high: asset("/models/bee-hero-cerana-drone.glb"),
    low: asset("/models/bee-hero-cerana-drone-low.glb"),
  },
  "bombus-terrestris:worker": {
    high: asset("/models/bee-hero-bombus.glb"),
    low: asset("/models/bee-hero-bombus-low.glb"),
  },
  "osmia-cornifrons:worker": {
    high: asset("/models/bee-hero-osmia.glb"),
    low: asset("/models/bee-hero-osmia-low.glb"),
  },
  "megachile-rotundata:worker": {
    high: asset("/models/bee-hero-megachile.glb"),
    low: asset("/models/bee-hero-megachile-low.glb"),
  },
  "xylocopa-violacea:worker": {
    high: asset("/models/bee-hero-xylocopa.glb"),
    low: asset("/models/bee-hero-xylocopa-low.glb"),
  },
};

/** 舞台地面对应的标本空间深度:足尖统一落在这里(与灯光/地面搭配调定) */
const FEET_TARGET_Y = -1.48;

// GLB feet sit ~0.48 units below the thorax origin. The observatory ground
// plane sits 1.48 specimen-units below origin (after the stage's 0.5 scale),
// so this factor puts the tarsi exactly on the ground.
const STAGE_SCALE = 3.08;

interface QuatRef {
  object: THREE.Object3D;
  base: THREE.Quaternion;
}

export interface HeroMotion {
  sway: THREE.Object3D;
  abdomen: { object: THREE.Object3D; baseScale: THREE.Vector3 } | null;
  foreWings: QuatRef[];
  hindWings: QuatRef[];
  antennae: QuatRef[];
}

const FOCUS_BY_NAME: Array<[RegExp, string]> = [
  // 分区绒毛(fuzz_thorax 不属于任何聚焦组,单独显示时随胸部虚化)
  [/^fuzz_head/, "head"],
  [/^fuzz_abdomen/, "abdomen"],
  [/^(head|compoundEye|antenna|ocellus)/, "head"],
  [/^(foreWing|hindWing)/, "wing"],
  [/^(abdomen|sting|petiole)/, "abdomen"],
  [/^(foreLeg|midLeg|hindLeg|tarsus|pollen)/, "leg"],
];

export async function createWesternHoneyBeeHero(
  overrides: Partial<BeeBuildOptions> = {},
  speciesId = "apis-mellifera",
): Promise<WesternHoneyBeeSpecimen> {
  const caste = overrides.caste ?? "worker";
  const quality = overrides.quality ?? "high";
  const urls = HERO_URLS[`${speciesId}:${caste}`];
  if (!urls) {
    throw new Error(`no hero asset for '${speciesId}:${caste}'`);
  }
  const gltf = await new GLTFLoader().loadAsync(
    quality === "low" ? urls.low : urls.high,
  );
  const specimenId = `${speciesId}-${caste}-hero`;

  const root = new THREE.Group();
  root.name = `specimen:${specimenId}`;
  root.userData.specimenId = specimenId;
  const sway = new THREE.Group();
  sway.name = "rig:hero-sway";
  sway.add(gltf.scene);
  root.add(sway);
  // 注意:锚点全部计算完之后才应用整体缩放——
  // 锚点是 root 的子节点,必须存"缩放前"的局部坐标,
  // 否则其世界坐标会被二次放大,镜头聚焦时飞出画面

  const byName = new Map<string, THREE.Object3D>();
  gltf.scene.traverse((object) => {
    byName.set(object.name, object);
    for (const [pattern, focusId] of FOCUS_BY_NAME) {
      if (pattern.test(object.name)) {
        object.userData.focusId = focusId;
        break;
      }
    }
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = false;
      const material = object.material as THREE.MeshStandardMaterial;
      if (material?.isMeshStandardMaterial) {
        material.envMapIntensity = 0.55;
        if (material.name === "bee:wing") {
          material.transparent = true;
          material.depthWrite = false;
          // 浅色翅膜在浅色舞台上会隐形:提亮并加暖;
          // 深色翅膜(如木蜂的烟紫色翅)保留物种原色,只保证可见度
          const luminance =
            0.2126 * material.color.r +
            0.7152 * material.color.g +
            0.0722 * material.color.b;
          if (luminance > 0.5) {
            material.opacity = 0.45;
            material.color.set("#d8cdb4");
          } else {
            material.opacity = Math.max(material.opacity, 0.6);
          }
          object.castShadow = false;
          object.renderOrder = 2;
        }
      }
      if (object.name === "fuzz") {
        object.castShadow = false;
        // let organ clicks pass through the hair shell
        object.raycast = () => {};
      }
    }
  });

  root.updateMatrixWorld(true);
  // root 此刻未缩放,世界坐标 == root 局部坐标(GLB 厘米尺度)
  const nodePosition = (name: string): THREE.Vector3 => {
    const node = byName.get(name);
    if (!node) throw new Error(`bee-hero.glb is missing node '${name}'.`);
    return node.getWorldPosition(new THREE.Vector3());
  };
  // 锚点放在部件"表面"而不是几何中心,否则热点遮挡检测
  // 与镜头聚焦都会把锚点当成藏在网格内部的点
  const surface = (
    name: string,
    dx: number,
    dy: number,
    dz: number,
  ): THREE.Vector3Tuple => {
    const p = nodePosition(name);
    return [p.x + dx, p.y + dy, p.z + dz];
  };
  // 部分部件节点的原点不在部件几何上:触角/六足是恒等变换(原点=蜂根原点)、
  // 腹部原点在腰部动画枢轴。这些锚点若用节点原点,圆点会落到双足之间
  // 或悬在背上方空中(2026-09-14 用户报告的"触角点漂移"即此)——
  // 必须从几何包围盒取点,与节点枢轴无关,对所有物种/职型通用。
  const partBox = (name: string): THREE.Box3 => {
    const node = byName.get(name);
    if (!node) throw new Error(`bee-hero.glb is missing node '${name}'.`);
    return new THREE.Box3().setFromObject(node);
  };
  /** 包围盒内取相对位置点(fx/fy/fz:0=min 面,1=max 面,可略越界取表面外浮点) */
  const boxPoint = (
    box: THREE.Box3,
    fx: number,
    fy: number,
    fz: number,
  ): THREE.Vector3Tuple => [
    THREE.MathUtils.lerp(box.min.x, box.max.x, fx),
    THREE.MathUtils.lerp(box.min.y, box.max.y, fy),
    THREE.MathUtils.lerp(box.min.z, box.max.z, fz),
  ];
  const legsBox = ["foreLegL", "foreLegR", "midLegL", "midLegR", "hindLegL", "hindLegR"]
    .map(partBox)
    .reduce((a, b) => a.union(b));

  const anchorPositions: Record<BeeAnchorId, THREE.Vector3Tuple> = {
    whole: [0, 0, 0],
    head: surface("head", 0.03, 0.14, 0),
    thorax: surface("thorax", 0, 0.28, 0),
    // 腹背面中点略上浮(fy 1.1 = 盒顶外 10% 高度,浮出绒毛壳)
    abdomen: boxPoint(partBox("abdomen"), 0.5, 1.1, 0.5),
    compoundEyeL: surface("compoundEyeL", 0.04, 0.04, -0.1),
    compoundEyeR: surface("compoundEyeR", 0.04, 0.04, 0.1),
    antennaL: boxPoint(partBox("antennaL"), 0.5, 0.55, 0.5),
    antennaR: boxPoint(partBox("antennaR"), 0.5, 0.55, 0.5),
    // the hero asset has no sculpted proboscis yet; anchor sits at the lower
    // face so focus/labels still have a sensible target (noted in content data)
    proboscis: surface("head", 0.18, -0.15, 0),
    foreWingL: surface("foreWingL", 0, 0.06, -0.03),
    foreWingR: surface("foreWingR", 0, 0.06, 0.03),
    hindWingL: surface("hindWingL", 0, 0.04, -0.04),
    hindWingR: surface("hindWingR", 0, 0.04, 0.04),
    // 足:取盒中低处偏外侧(L 外侧 = z min 向,R 外侧 = z max 向);
    // 前足点近清洁器(基跗节)、后足点近花粉筐(胫节)高度
    foreLegL: boxPoint(partBox("foreLegL"), 0.5, 0.35, 0.25),
    foreLegR: boxPoint(partBox("foreLegR"), 0.5, 0.35, 0.75),
    midLegL: boxPoint(partBox("midLegL"), 0.5, 0.4, 0.25),
    midLegR: boxPoint(partBox("midLegR"), 0.5, 0.4, 0.75),
    hindLegL: boxPoint(partBox("hindLegL"), 0.5, 0.45, 0.25),
    hindLegR: boxPoint(partBox("hindLegR"), 0.5, 0.45, 0.75),
    // "六足"聚焦看点 = 六足联合盒中心(略低),镜头框住全部足
    leg: boxPoint(legsBox, 0.5, 0.4, 0.5),
    // 雄蜂无螫针(资产中无 sting 节点),锚点回退到腹部末端
    sting: byName.has("sting")
      ? surface("sting", -0.1, 0, 0)
      : surface("abdomen", -0.5, -0.02, 0),
  };
  const anchors = {} as Record<BeeAnchorId, THREE.Object3D>;
  for (const [id, position] of Object.entries(anchorPositions)) {
    const anchor = createAnchor(id, position);
    anchors[id as BeeAnchorId] = anchor;
    root.add(anchor);
  }
  root.scale.setScalar(STAGE_SCALE);
  root.updateMatrixWorld(true);
  // 足尖对齐:不同物种/职型体型不同,统一把最低点落到舞台地面深度
  const preBounds = measureSpecimen(root);
  root.position.y += FEET_TARGET_Y - preBounds.min.y;
  root.updateMatrixWorld(true);

  const quatRef = (name: string): QuatRef | null => {
    const object = byName.get(name);
    return object ? { object, base: object.quaternion.clone() } : null;
  };
  const abdomenNode = byName.get("abdomen") ?? null;
  const motionRefs: HeroMotion = {
    sway,
    abdomen: abdomenNode
      ? { object: abdomenNode, baseScale: abdomenNode.scale.clone() }
      : null,
    foreWings: [quatRef("foreWingL"), quatRef("foreWingR")].filter(
      (ref): ref is QuatRef => ref !== null,
    ),
    hindWings: [quatRef("hindWingL"), quatRef("hindWingR")].filter(
      (ref): ref is QuatRef => ref !== null,
    ),
    antennae: [quatRef("antennaL"), quatRef("antennaR")].filter(
      (ref): ref is QuatRef => ref !== null,
    ),
  };
  root.userData.heroMotion = motionRefs;
  // baked wing-flap clips, kept for a future take-off interaction
  root.userData.animations = gltf.animations;

  const bounds = measureSpecimen(root);
  assertSpecimenIntegrity(root, anchors, bounds);
  let disposed = false;

  return {
    root,
    anchors,
    rig: {
      body: sway,
      abdomen: abdomenNode ?? sway,
      foreWingL: motionRefs.foreWings[0]?.object ?? sway,
      foreWingR: motionRefs.foreWings[1]?.object ?? sway,
      hindWingL: motionRefs.hindWings[0]?.object ?? sway,
      hindWingR: motionRefs.hindWings[1]?.object ?? sway,
      antennaL: motionRefs.antennae[0]?.object ?? sway,
      antennaR: motionRefs.antennae[1]?.object ?? sway,
    },
    bounds,
    metadata: {
      id: specimenId,
      kind: "bee",
      version: 2,
      scientificName: "Apis mellifera",
      variant: caste,
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      disposeObjectTree(root);
    },
  };
}

const wingDelta = new THREE.Quaternion();
const WING_LOCAL_FLAP_AXIS = new THREE.Vector3(0, 1, 0);
const ANTENNA_LOCAL_AXIS = new THREE.Vector3(0, 0, 1);

/**
 * Idle motion for the baked hero specimen. The GLB wings carry their pose in
 * quaternions, so deltas are composed on top of the captured base pose instead
 * of writing Euler angles like the procedural rig does.
 */
export function applyHeroIdleMotion(
  specimen: WesternHoneyBeeSpecimen,
  elapsedSeconds: number,
  enabled: boolean,
): void {
  const refs = specimen.root.userData.heroMotion as HeroMotion | undefined;
  if (!refs) return;
  const amount = enabled ? 1 : 0;

  const tremble = Math.sin(elapsedSeconds * 26) * 0.045 * amount;
  for (const { object, base } of refs.foreWings) {
    wingDelta.setFromAxisAngle(WING_LOCAL_FLAP_AXIS, tremble);
    object.quaternion.copy(base).multiply(wingDelta);
  }
  const hindTremble = Math.sin(elapsedSeconds * 26 + 0.6) * 0.03 * amount;
  for (const { object, base } of refs.hindWings) {
    wingDelta.setFromAxisAngle(WING_LOCAL_FLAP_AXIS, hindTremble);
    object.quaternion.copy(base).multiply(wingDelta);
  }

  refs.antennae.forEach(({ object, base }, index) => {
    const drift =
      Math.sin(elapsedSeconds * 2.1 + index * Math.PI) * 0.05 * amount;
    wingDelta.setFromAxisAngle(ANTENNA_LOCAL_AXIS, drift);
    object.quaternion.copy(base).multiply(wingDelta);
  });

  if (refs.abdomen) {
    const breath = 1 + Math.sin(elapsedSeconds * 1.4) * 0.012 * amount;
    refs.abdomen.object.scale
      .copy(refs.abdomen.baseScale)
      .multiplyScalar(breath);
  }
  refs.sway.rotation.y = Math.sin(elapsedSeconds * 0.55) * 0.035 * amount;
}
