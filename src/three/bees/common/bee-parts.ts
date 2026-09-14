import * as THREE from "three";
import {
  createCurvedSegment,
  createEllipsoid,
  createSegment,
  createWingGeometry,
} from "../../builders/primitives";
import type { SpecimenQuality } from "../../core/specimen";
import type { BeeMorphologyProfile } from "../types";
import type { BeeMaterials } from "./bee-materials";

export type BeeSide = -1 | 1;
export type LegKind = "fore" | "mid" | "hind";

export function addAntenna(
  parent: THREE.Group,
  side: BeeSide,
  materials: BeeMaterials,
  profile: BeeMorphologyProfile,
): THREE.Group {
  const antenna = new THREE.Group();
  antenna.name = side === 1 ? "antenna-right" : "antenna-left";
  const headX = profile.headPositionX;
  const headY = profile.headScale[1];
  const headZ = profile.headScale[2];
  const start: THREE.Vector3Tuple = [headX + 0.25, headY * 0.52, side * headZ * 0.38];
  const elbow: THREE.Vector3Tuple = [headX + 0.68, headY * 1.03, side * headZ * 0.6];
  const middle: THREE.Vector3Tuple = [headX + 1.02, headY * 1.3, side * headZ * 0.72];
  const tip: THREE.Vector3Tuple = [headX + 1.26, headY * 1.43, side * headZ * 0.76];

  antenna.add(
    createCurvedSegment(
      "antenna-scape",
      start,
      elbow,
      0.04,
      0.032,
      materials.shell,
      [0.02, 0.04, side * 0.035],
      10,
      8,
    ),
    createCurvedSegment(
      "antenna-pedicel",
      elbow,
      middle,
      0.031,
      0.026,
      materials.shell,
      [0, 0.035, side * 0.025],
      9,
      8,
    ),
    createCurvedSegment(
      "antenna-flagellum",
      middle,
      tip,
      0.026,
      0.018,
      materials.shell,
      [0, 0.02, side * 0.015],
      8,
      7,
    ),
  );

  const tipNode = createEllipsoid(
    "antenna-tip",
    [0.065, 0.065, 0.065],
    materials.shell,
    { radial: 12, height: 10 },
  );
  tipNode.position.fromArray(tip);
  antenna.add(tipNode);
  parent.add(antenna);
  return antenna;
}

export function addMouthparts(
  head: THREE.Group,
  materials: BeeMaterials,
  profile: BeeMorphologyProfile,
): THREE.Group {
  const mouth = new THREE.Group();
  mouth.name = "anatomy:mouthparts";
  mouth.userData.focusId = "head";
  const frontX = profile.headScale[0] * 0.72;
  const lowerY = -profile.headScale[1] * 0.52;

  for (const side of [-1, 1] as const) {
    mouth.add(
      createCurvedSegment(
        `mandible-${side === -1 ? "left" : "right"}`,
        [frontX * 0.78, lowerY * 0.78, side * 0.2],
        [frontX * 1.08, lowerY, side * 0.31],
        0.07,
        0.045,
        materials.shell,
        [0.02, -0.035, side * 0.025],
        10,
        8,
      ),
      createCurvedSegment(
        `maxillary-palp-${side === -1 ? "left" : "right"}`,
        [frontX * 0.7, lowerY * 0.95, side * 0.13],
        [frontX + profile.mouthpartLength * 0.56, lowerY - 0.22, side * 0.16],
        0.026,
        0.014,
        materials.shell,
        [0.04, -0.04, side * 0.02],
        10,
        7,
      ),
    );
  }

  const tongueStart: THREE.Vector3Tuple = [frontX * 0.72, lowerY * 0.98, 0];
  const tongueMid: THREE.Vector3Tuple = [frontX + profile.mouthpartLength * 0.48, lowerY - 0.26, 0];
  const tongueEnd: THREE.Vector3Tuple = [frontX + profile.mouthpartLength, lowerY - 0.38, 0];
  mouth.add(
    createCurvedSegment(
      "proboscis-base",
      tongueStart,
      tongueMid,
      0.042,
      0.03,
      materials.shell,
      [0.05, -0.04, 0],
      10,
      8,
    ),
    createCurvedSegment(
      "glossa",
      tongueMid,
      tongueEnd,
      0.03,
      0.014,
      materials.hairDark,
      [0.05, -0.03, 0],
      10,
      7,
    ),
  );
  head.add(mouth);
  return mouth;
}

export function createWing(
  name: string,
  side: BeeSide,
  position: THREE.Vector3Tuple,
  scale: THREE.Vector3Tuple,
  materials: BeeMaterials,
  kind: "fore" | "hind",
): THREE.Group {
  const pivot = new THREE.Group();
  pivot.name = name;
  pivot.position.fromArray(position);
  pivot.rotation.set(-side * (kind === "fore" ? 0.28 : 0.2), 0, Math.PI * 0.9);

  const surface = new THREE.Group();
  surface.name = `${name}-surface`;
  surface.scale.fromArray(scale);
  pivot.add(surface);

  const membrane = new THREE.Mesh(createWingGeometry(), materials.wing);
  membrane.name = `${name}-membrane`;
  membrane.renderOrder = 2;
  surface.add(membrane);
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(membrane.geometry, 18),
    materials.vein,
  );
  outline.name = `${name}-outline`;
  outline.renderOrder = 3;
  surface.add(outline);

  const foreVeins: Array<[number, number, number, number]> = [
    [0.04, 0.03, 3.04, 0.12],
    [0.16, 0.08, 1.02, 0.68],
    [0.66, 0.19, 1.65, 0.83],
    [1.02, 0.68, 2.1, 0.88],
    [1.65, 0.83, 2.56, 0.62],
    [0.72, 0.18, 1.2, -0.08],
    [1.45, 0.15, 2.0, -0.09],
    [2.0, -0.09, 2.55, 0.18],
    [2.1, 0.88, 2.55, 0.18],
    [2.55, 0.18, 3.04, 0.12],
  ];
  const hindVeins: Array<[number, number, number, number]> = [
    [0.04, 0.03, 2.65, 0.1],
    [0.18, 0.08, 1.05, 0.68],
    [0.72, 0.18, 1.58, 0.72],
    [1.05, 0.68, 2.12, 0.48],
    [1.22, 0.08, 1.75, -0.06],
    [2.12, 0.48, 2.65, 0.1],
  ];
  const veinCoordinates = (kind === "fore" ? foreVeins : hindVeins).flatMap(
    ([x1, y1, x2, y2]) => [x1, y1, 0.008, x2, y2, 0.008],
  );
  const veinGeometry = new THREE.BufferGeometry();
  veinGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(veinCoordinates, 3),
  );
  const veins = new THREE.LineSegments(veinGeometry, materials.vein);
  veins.name = `${name}-vein-network`;
  veins.renderOrder = 3;
  surface.add(veins);
  return pivot;
}

export function addLeg(
  parent: THREE.Group,
  side: BeeSide,
  x: number,
  angle: number,
  kind: LegKind,
  materials: BeeMaterials,
  profile: BeeMorphologyProfile,
  pollenLoad = 0,
): THREE.Group {
  const leg = new THREE.Group();
  leg.name = `${kind}-leg-${side === -1 ? "left" : "right"}`;
  const length = profile.legLength;
  const zBase = profile.thoraxScale[2] * 0.56 * side;
  const z = (value: number) => value * length * side;
  const y = (value: number) => value * length;
  const kindSpread = kind === "fore" ? 0.22 : kind === "mid" ? 0 : -0.18;
  const p0: THREE.Vector3Tuple = [x, -0.18, zBase];
  const p1: THREE.Vector3Tuple = [x + kindSpread, y(-0.38), z(0.88)];
  const p2: THREE.Vector3Tuple = [x + angle * 0.42, y(-0.55), z(1.16)];
  const p3: THREE.Vector3Tuple = [x + angle * 0.92, y(-0.68), z(1.52)];
  const p4: THREE.Vector3Tuple = [x + angle * 1.22, y(-1.02), z(1.78)];
  const p5: THREE.Vector3Tuple = [x + angle * 1.38, y(-1.26), z(1.96)];
  const p6: THREE.Vector3Tuple = [x + angle * 1.5, y(-1.39), z(2.12)];
  const tibiaRadius = kind === "hind" && profile.hasPollenBasket ? 0.073 : 0.046;

  leg.add(
    createCurvedSegment("coxa", p0, p1, 0.056, 0.048, materials.shell, [0, -0.025, side * 0.035], 9, 8),
    createCurvedSegment("trochanter", p1, p2, 0.048, 0.04, materials.shell, [0.02, -0.035, side * 0.04], 9, 8),
    createCurvedSegment("femur", p2, p3, 0.061, 0.05, materials.shell, [0.015, 0.04, side * 0.06], 12, 9),
    createCurvedSegment("tibia", p3, p4, tibiaRadius, tibiaRadius * 0.72, materials.shell, [0.025, -0.035, side * 0.045], 12, 9),
    createCurvedSegment("basitarsus", p4, p5, kind === "hind" ? 0.05 : 0.036, 0.026, materials.shell, [0.01, -0.025, side * 0.03], 10, 8),
    createCurvedSegment("tarsus", p5, p6, 0.025, 0.012, materials.shell, [0.01, -0.02, side * 0.02], 9, 7),
  );

  for (const [index, point] of [p1, p2, p3, p4, p5].entries()) {
    const joint = createEllipsoid(
      `leg-joint-${index + 1}`,
      [0.048, 0.048, 0.048],
      materials.shell,
      { radial: 10, height: 8 },
    );
    joint.position.fromArray(point);
    leg.add(joint);
  }

  if (kind === "hind" && profile.hasPollenBasket) {
    const basket = createLimbPlate("pollen-basket", p3, p4, materials.shell);
    leg.add(basket);
    if (pollenLoad > 0) {
      const pollen = createEllipsoid(
        "pollen-load",
        [0.18 * pollenLoad, 0.2 * pollenLoad, 0.14 * pollenLoad],
        materials.pollen,
        { radial: 20, height: 16 },
      );
      pollen.position.fromArray(midpoint(p3, p4));
      leg.add(pollen);
    }
  }

  const clawBase = new THREE.Vector3(...p6);
  for (const clawSide of [-1, 1]) {
    const clawTip = clawBase.clone().add(
      new THREE.Vector3(0.09, -0.07, side * clawSide * 0.08),
    );
    leg.add(
      createCurvedSegment(
        `claw-${clawSide}`,
        p6,
        clawTip.toArray(),
        0.016,
        0.008,
        materials.shell,
        [0.02, -0.018, side * clawSide * 0.02],
        6,
        6,
      ),
    );
  }

  parent.add(leg);
  return leg;
}

function createLimbPlate(
  name: string,
  from: THREE.Vector3Tuple,
  to: THREE.Vector3Tuple,
  material: THREE.Material,
): THREE.Mesh {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = end.clone().sub(start);
  const plate = createEllipsoid(
    name,
    [0.13, direction.length() * 0.62, 0.085],
    material,
    { radial: 18, height: 12 },
  );
  plate.position.copy(start).add(end).multiplyScalar(0.5);
  plate.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  return plate;
}

function midpoint(
  from: THREE.Vector3Tuple,
  to: THREE.Vector3Tuple,
): THREE.Vector3Tuple {
  return [
    (from[0] + to[0]) * 0.5,
    (from[1] + to[1]) * 0.5,
    (from[2] + to[2]) * 0.5,
  ];
}

export function createSurfaceFuzz({
  name,
  axes,
  materials,
  quality,
  density,
  length,
  tone,
  coverage = "full",
}: {
  name: string;
  axes: THREE.Vector3Tuple;
  materials: BeeMaterials;
  quality: SpecimenQuality;
  density: number;
  length: number;
  tone: "light" | "dark";
  coverage?: "full" | "dorsal";
}): THREE.LineSegments {
  const qualityCount = quality === "high" ? 220 : quality === "medium" ? 132 : 68;
  const count = Math.max(12, Math.round(qualityCount * density));
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const material = tone === "light"
    ? materials.hairLineLight
    : materials.hairLineDark;
  const fuzz = new THREE.LineSegments(geometry, material);
  fuzz.name = name;
  const position = new THREE.Vector3();
  let accepted = 0;
  let candidate = 0;

  while (accepted < count) {
    const sampleCount = coverage === "dorsal" ? count * 2 : count;
    const phi = Math.acos(1 - (2 * (candidate + 0.5)) / sampleCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * candidate;
    const normal = new THREE.Vector3(
      Math.cos(theta) * Math.sin(phi),
      Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
    );
    candidate += 1;
    if (coverage === "dorsal" && normal.y < -0.08) continue;

    position.set(
      normal.x * axes[0],
      normal.y * axes[1],
      normal.z * axes[2],
    );
    const strandLength = 0.038 * length * (0.72 + ((candidate * 29) % 19) / 34);
    positions.push(position.x, position.y, position.z);
    positions.push(
      position.x + normal.x * strandLength,
      position.y + normal.y * strandLength,
      position.z + normal.z * strandLength,
    );
    accepted += 1;
  }
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  fuzz.renderOrder = 4;
  return fuzz;
}
