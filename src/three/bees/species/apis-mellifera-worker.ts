import * as THREE from "three";
import {
  createEllipsoid,
  createLoftGeometry,
  type LoftSection,
} from "../../builders/primitives";
import { disposeObjectTree } from "../../core/dispose";
import {
  assertSpecimenIntegrity,
  createAnchor,
  measureSpecimen,
  type MuseumSpecimen,
} from "../../core/specimen";
import {
  addAntenna,
  addLeg,
  addMouthparts,
  createSurfaceFuzz,
  createWing,
} from "../common/bee-parts";
import { createWesternHoneyBeeMaterials } from "../common/bee-materials";
import type {
  BeeAnchorId,
  BeeBuildOptions,
  BeeMorphologyProfile,
  BeeRigId,
} from "../types";
import { APIS_MELLIFERA_PROFILES } from "./apis-mellifera-profiles";

export type WesternHoneyBeeSpecimen = MuseumSpecimen<BeeAnchorId, BeeRigId>;
export type WesternHoneyBeeWorkerSpecimen = WesternHoneyBeeSpecimen;

const DEFAULT_OPTIONS: BeeBuildOptions = {
  caste: "worker",
  quality: "high",
  seed: 1,
  pollenLoad: 1,
};

export function createWesternHoneyBee(
  overrides: Partial<BeeBuildOptions> = {},
): WesternHoneyBeeSpecimen {
  const options = { ...DEFAULT_OPTIONS, ...overrides };
  const profile = APIS_MELLIFERA_PROFILES[options.caste];
  const pollenLoad = profile.hasPollenBasket
    ? THREE.MathUtils.clamp(options.pollenLoad, 0, 1.35)
    : 0;
  const specimenId = `apis-mellifera-${options.caste}`;

  const root = new THREE.Group();
  root.name = `specimen:${specimenId}`;
  root.userData.specimenId = specimenId;
  root.userData.seed = options.seed;
  root.userData.caste = options.caste;

  const body = new THREE.Group();
  body.name = "rig:body";
  body.userData.focusId = "whole";
  root.add(body);

  const materials = createWesternHoneyBeeMaterials(profile);
  const bodySegments = options.quality === "low"
    ? { radial: 24, height: 18 }
    : options.quality === "medium"
      ? { radial: 36, height: 26 }
      : { radial: 52, height: 34 };

  const head = createHead(body, profile, materials, bodySegments, options.quality);
  const mouthparts = addMouthparts(head, materials, profile);
  const antennaL = addAntenna(body, -1, materials, profile);
  const antennaR = addAntenna(body, 1, materials, profile);
  antennaL.userData.focusId = "head";
  antennaR.userData.focusId = "head";

  createThorax(body, profile, materials, bodySegments, options.quality);
  const abdomen = createAbdomen(
    body,
    profile,
    materials,
    options.quality,
  );

  const wings = new THREE.Group();
  wings.name = "anatomy:wings";
  wings.userData.focusId = "wing";
  const wingBaseX = profile.thoraxPositionX - 0.07;
  const wingBaseZ = profile.thoraxScale[2] * 0.52;
  const foreWingL = createWing(
    "rig:fore-wing-left",
    -1,
    [wingBaseX, profile.thoraxScale[1] * 0.6, -wingBaseZ],
    profile.foreWingScale,
    materials,
    "fore",
  );
  const foreWingR = createWing(
    "rig:fore-wing-right",
    1,
    [wingBaseX, profile.thoraxScale[1] * 0.6, wingBaseZ],
    profile.foreWingScale,
    materials,
    "fore",
  );
  const hindWingL = createWing(
    "rig:hind-wing-left",
    -1,
    [wingBaseX - 0.72, profile.thoraxScale[1] * 0.3, -wingBaseZ],
    profile.hindWingScale,
    materials,
    "hind",
  );
  const hindWingR = createWing(
    "rig:hind-wing-right",
    1,
    [wingBaseX - 0.72, profile.thoraxScale[1] * 0.3, wingBaseZ],
    profile.hindWingScale,
    materials,
    "hind",
  );
  wings.add(foreWingL, foreWingR, hindWingL, hindWingR);
  body.add(wings);

  const legs = new THREE.Group();
  legs.name = "anatomy:legs";
  legs.userData.focusId = "leg";
  const foreLegL = addLeg(
    legs,
    -1,
    profile.thoraxPositionX + 0.48,
    0.4,
    "fore",
    materials,
    profile,
  );
  const foreLegR = addLeg(
    legs,
    1,
    profile.thoraxPositionX + 0.48,
    0.4,
    "fore",
    materials,
    profile,
  );
  const midLegL = addLeg(
    legs,
    -1,
    profile.thoraxPositionX - 0.08,
    0.04,
    "mid",
    materials,
    profile,
  );
  const midLegR = addLeg(
    legs,
    1,
    profile.thoraxPositionX - 0.08,
    0.04,
    "mid",
    materials,
    profile,
  );
  const hindLegL = addLeg(
    legs,
    -1,
    profile.thoraxPositionX - 0.62,
    -0.42,
    "hind",
    materials,
    profile,
    pollenLoad,
  );
  const hindLegR = addLeg(
    legs,
    1,
    profile.thoraxPositionX - 0.62,
    -0.42,
    "hind",
    materials,
    profile,
    pollenLoad,
  );
  body.add(legs);

  const anchorPositions = createAnchorPositions(profile);
  const anchors = {} as Record<BeeAnchorId, THREE.Object3D>;
  for (const [id, position] of Object.entries(anchorPositions)) {
    const anchor = createAnchor(id, position);
    anchors[id as BeeAnchorId] = anchor;
    root.add(anchor);
  }

  mouthparts.userData.anchorId = "proboscis";
  root.updateMatrixWorld(true);
  const bounds = measureSpecimen(root);
  assertSpecimenIntegrity(root, anchors, bounds);
  let disposed = false;

  return {
    root,
    anchors,
    rig: {
      body,
      abdomen,
      foreWingL,
      foreWingR,
      hindWingL,
      hindWingR,
      antennaL,
      antennaR,
    },
    bounds,
    metadata: {
      id: specimenId,
      kind: "bee",
      version: 2,
      scientificName: "Apis mellifera",
      variant: options.caste,
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      disposeObjectTree(root);
    },
  };
}

export function createWesternHoneyBeeWorker(
  overrides: Partial<BeeBuildOptions> = {},
): WesternHoneyBeeWorkerSpecimen {
  return createWesternHoneyBee({ ...overrides, caste: "worker" });
}

function createHead(
  body: THREE.Group,
  profile: BeeMorphologyProfile,
  materials: ReturnType<typeof createWesternHoneyBeeMaterials>,
  segments: { radial: number; height: number },
  quality: BeeBuildOptions["quality"],
): THREE.Group {
  const head = new THREE.Group();
  head.name = "anatomy:head";
  head.position.set(profile.headPositionX, 0.08, 0);
  head.userData.focusId = "head";

  const headScaleX = profile.headScale[0] / 0.78;
  const headScaleY = profile.headScale[1] / 0.72;
  const headScaleZ = profile.headScale[2] / 0.72;
  const headSections: LoftSection[] = [
    [-0.72, 0.38, 0.46],
    [-0.54, 0.63, 0.7],
    [-0.16, 0.73, 0.76],
    [0.28, 0.68, 0.72],
    [0.62, 0.48, 0.58],
  ].map(([x, radiusY, radiusZ]) => ({
    x: x * headScaleX,
    radiusY: radiusY * headScaleY,
    radiusZ: radiusZ * headScaleZ,
  }));
  const headCapsule = new THREE.Mesh(
    createLoftGeometry(headSections, segments.radial),
    materials.shell,
  );
  headCapsule.name = "head-sculpted-capsule";
  headCapsule.castShadow = true;
  head.add(headCapsule);

  const facePlate = createEllipsoid(
    "clypeus",
    [
      profile.headScale[0] * 0.34,
      profile.headScale[1] * 0.42,
      profile.headScale[2] * 0.56,
    ],
    materials.velvet,
    segments,
  );
  facePlate.position.set(profile.headScale[0] * 0.66, -0.18, 0);
  head.add(facePlate);

  for (const side of [-1, 1] as const) {
    const eye = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 4),
      materials.eye,
    );
    eye.name = `compound-eye-${side === -1 ? "left" : "right"}`;
    eye.scale.fromArray(profile.eyeScale);
    eye.position.set(
      profile.eyeForward,
      profile.caste === "drone" ? 0.22 : 0.13,
      side * profile.headScale[2] * 0.78,
    );
    eye.rotation.set(side * 0.05, 0, 0.12);
    head.add(eye);
  }

  for (const z of [-0.23, 0, 0.23]) {
    const ocellus = createEllipsoid(
      "ocellus",
      [0.07, 0.07, 0.07],
      materials.eye,
      { radial: 14, height: 10 },
    );
    ocellus.position.set(0.1 - Math.abs(z) * 0.35, profile.headScale[1] * 0.96, z);
    head.add(ocellus);
  }

  head.add(
    createSurfaceFuzz({
      name: "head-fuzz",
      axes: [
        profile.headScale[0] * 1.02,
        profile.headScale[1] * 1.01,
        profile.headScale[2] * 1.01,
      ],
      materials,
      quality,
      density: profile.hairDensity * 0.28,
      length: profile.hairLength * 0.7,
      tone: "dark",
      coverage: "dorsal",
    }),
  );
  body.add(head);
  return head;
}

function createThorax(
  body: THREE.Group,
  profile: BeeMorphologyProfile,
  materials: ReturnType<typeof createWesternHoneyBeeMaterials>,
  segments: { radial: number; height: number },
  quality: BeeBuildOptions["quality"],
): THREE.Group {
  const thorax = new THREE.Group();
  thorax.name = "anatomy:thorax";
  thorax.position.set(profile.thoraxPositionX, 0, 0);
  thorax.userData.focusId = "whole";

  const thoraxScaleX = profile.thoraxScale[0] / 1.15;
  const thoraxScaleY = profile.thoraxScale[1] / 1.05;
  const thoraxScaleZ = profile.thoraxScale[2];
  const thoraxSections: LoftSection[] = [
    [-0.86, 0.28, 0.36],
    [-0.7, 0.62, 0.68],
    [-0.43, 0.88, 0.9],
    [-0.08, 1.02, 1],
    [0.28, 0.92, 0.92],
    [0.58, 0.64, 0.7],
    [0.74, 0.3, 0.4],
  ].map(([x, radiusY, radiusZ]) => ({
    x: x * thoraxScaleX,
    radiusY: radiusY * thoraxScaleY,
    radiusZ: radiusZ * thoraxScaleZ,
  }));
  const thoraxCapsule = new THREE.Mesh(
    createLoftGeometry(thoraxSections, segments.radial),
    materials.velvet,
  );
  thoraxCapsule.name = "thorax-sculpted-capsule";
  thoraxCapsule.castShadow = true;
  thorax.add(thoraxCapsule);
  const dorsalPlate = createEllipsoid(
    "mesoscutum",
    [
      profile.thoraxScale[0] * 0.46,
      profile.thoraxScale[1] * 0.14,
      profile.thoraxScale[2] * 0.5,
    ],
    materials.velvet,
    segments,
  );
  dorsalPlate.position.set(0.02, profile.thoraxScale[1] * 0.78, 0);
  thorax.add(dorsalPlate);

  const collar = createEllipsoid(
    "pronotum-collar",
    [0.34, profile.thoraxScale[1] * 0.72, profile.thoraxScale[2] * 0.78],
    materials.hairDark,
    segments,
  );
  collar.position.x = profile.thoraxScale[0] * 0.72;
  thorax.add(collar);

  thorax.add(
    createSurfaceFuzz({
      name: "thorax-guard-hairs",
      axes: [
        profile.thoraxScale[0] * 1.03,
        profile.thoraxScale[1] * 1.02,
        profile.thoraxScale[2] * 1.02,
      ],
      materials,
      quality,
      density: profile.hairDensity,
      length: profile.hairLength * 1.18,
      tone: "light",
    }),
    createSurfaceFuzz({
      name: "thorax-undercoat",
      axes: [
        profile.thoraxScale[0] * 1.015,
        profile.thoraxScale[1] * 1.01,
        profile.thoraxScale[2] * 1.01,
      ],
      materials,
      quality,
      density: profile.hairDensity * 0.72,
      length: profile.hairLength * 0.62,
      tone: "dark",
    }),
  );
  body.add(thorax);
  return thorax;
}

function createAbdomen(
  body: THREE.Group,
  profile: BeeMorphologyProfile,
  materials: ReturnType<typeof createWesternHoneyBeeMaterials>,
  quality: BeeBuildOptions["quality"],
): THREE.Group {
  const abdomen = new THREE.Group();
  abdomen.name = "rig:abdomen";
  abdomen.position.set(profile.abdomenPositionX, -0.02, 0);
  abdomen.userData.focusId = "abdomen";

  const terminalRadius = profile.caste === "drone" ? 0.3 : 0.13;
  const shape: Array<[number, number]> = [
    [0.48, 0.48],
    [0.33, 0.83],
    [0.1, 1],
    [-0.16, 0.94],
    [-0.36, 0.68],
    [-0.5, terminalRadius],
  ];
  const sections = sampleAbdomenSections(shape, profile, 58);
  const radialSegments = quality === "high" ? 52 : quality === "medium" ? 38 : 26;
  const shellGeometry = createLoftGeometry(sections, radialSegments);
  const shellMaterial = materials.amber.clone();
  shellMaterial.color.set("#ffffff");
  shellMaterial.vertexColors = true;
  const positionAttribute = shellGeometry.getAttribute("position");
  const colors = new Float32Array(positionAttribute.count * 3);
  const baseColor = new THREE.Color(profile.palette.abdomen);
  const bandColor = new THREE.Color(profile.palette.shell).multiplyScalar(0.72);
  const stripePositions = [0.29, 0.12, -0.06, -0.23, -0.38];
  for (let index = 0; index < positionAttribute.count; index += 1) {
    const normalizedX = positionAttribute.getX(index) / profile.abdomenLength;
    const isBand = stripePositions.some(
      (stripe) => Math.abs(normalizedX - stripe) < 0.018,
    );
    const shade = 0.9 + (normalizedX + 0.5) * 0.1;
    const color = (isBand ? bandColor : baseColor).clone().multiplyScalar(shade);
    color.toArray(colors, index * 3);
  }
  shellGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const shell = new THREE.Mesh(shellGeometry, shellMaterial);
  shell.name = "abdomen-lofted-shell";
  shell.castShadow = true;
  shell.receiveShadow = true;
  abdomen.add(shell);

  abdomen.add(
    createSurfaceFuzz({
      name: "abdomen-dorsal-hairs",
      axes: [
        profile.abdomenLength * 0.46,
        profile.abdomenRadiusY * 1.015,
        profile.abdomenRadiusZ * 1.015,
      ],
      materials,
      quality,
      density: profile.hairDensity * 0.48,
      length: profile.hairLength * 0.58,
      tone: "dark",
      coverage: "dorsal",
    }),
  );

  if (profile.hasSting) {
    const sting = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.52, 16),
      materials.shell,
    );
    sting.name = "sting";
    sting.position.set(-profile.abdomenLength * 0.53, -0.03, 0);
    sting.rotation.z = Math.PI / 2;
    abdomen.add(sting);
  }
  body.add(abdomen);
  return abdomen;
}

function sampleAbdomenSections(
  shape: Array<[number, number]>,
  profile: BeeMorphologyProfile,
  sampleCount: number,
): LoftSection[] {
  const keys = [...shape].sort((a, b) => a[0] - b[0]);
  const sections: LoftSection[] = [];
  for (let index = 0; index < sampleCount; index += 1) {
    const progress = index / (sampleCount - 1);
    const normalizedX = THREE.MathUtils.lerp(keys[0][0], keys[keys.length - 1][0], progress);
    let keyIndex = 0;
    while (
      keyIndex < keys.length - 2 &&
      normalizedX > keys[keyIndex + 1][0]
    ) {
      keyIndex += 1;
    }
    const [x0, radius0] = keys[keyIndex];
    const [x1, radius1] = keys[keyIndex + 1];
    const local = THREE.MathUtils.clamp((normalizedX - x0) / (x1 - x0), 0, 1);
    const smooth = local * local * (3 - 2 * local);
    const radius = THREE.MathUtils.lerp(radius0, radius1, smooth);
    sections.push({
      x: normalizedX * profile.abdomenLength,
      radiusY: radius * profile.abdomenRadiusY,
      radiusZ: radius * profile.abdomenRadiusZ,
    });
  }
  return sections;
}

function createAnchorPositions(
  profile: BeeMorphologyProfile,
): Record<BeeAnchorId, THREE.Vector3Tuple> {
  const headX = profile.headPositionX;
  const thoraxX = profile.thoraxPositionX;
  const abdomenRear = profile.abdomenPositionX - profile.abdomenLength * 0.4;
  const wingZ = profile.thoraxScale[2] * 1.18;
  const legZ = profile.thoraxScale[2] * profile.legLength * 2.05;
  const stingX = profile.abdomenPositionX - profile.abdomenLength * 0.53;

  return {
    whole: [0, 0, 0],
    head: [headX + profile.headScale[0] * 0.45, profile.headScale[1] * 0.82, profile.headScale[2]],
    thorax: [thoraxX, profile.thoraxScale[1] * 0.62, 0],
    abdomen: [abdomenRear, profile.abdomenRadiusY * 0.72, profile.abdomenRadiusZ * 0.82],
    compoundEyeL: [headX + profile.eyeForward, 0.2, -profile.headScale[2] * 0.8],
    compoundEyeR: [headX + profile.eyeForward, 0.2, profile.headScale[2] * 0.8],
    antennaL: [headX + 1.26, profile.headScale[1] * 1.43, -profile.headScale[2] * 0.76],
    antennaR: [headX + 1.26, profile.headScale[1] * 1.43, profile.headScale[2] * 0.76],
    proboscis: [headX + profile.headScale[0] * 0.72 + profile.mouthpartLength, -profile.headScale[1] * 0.52 - 0.38, 0],
    foreWingL: [thoraxX - 0.7, profile.thoraxScale[1] * 1.5, -wingZ],
    foreWingR: [thoraxX - 0.7, profile.thoraxScale[1] * 1.5, wingZ],
    hindWingL: [thoraxX - 1.05, profile.thoraxScale[1], -wingZ * 0.84],
    hindWingR: [thoraxX - 1.05, profile.thoraxScale[1], wingZ * 0.84],
    foreLegL: [thoraxX + 0.85, -1.2 * profile.legLength, -legZ],
    foreLegR: [thoraxX + 0.85, -1.2 * profile.legLength, legZ],
    midLegL: [thoraxX, -1.35 * profile.legLength, -legZ],
    midLegR: [thoraxX, -1.35 * profile.legLength, legZ],
    hindLegL: [thoraxX - 1.05, -1.3 * profile.legLength, -legZ],
    hindLegR: [thoraxX - 1.05, -1.3 * profile.legLength, legZ],
    leg: [thoraxX - 0.75, -1.55 * profile.legLength, legZ * 0.92],
    sting: [stingX, -0.03, 0],
  };
}
