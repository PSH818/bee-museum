import * as THREE from "three";

export type DetailSegments = {
  radial: number;
  height: number;
};

export interface LoftSection {
  x: number;
  radiusY: number;
  radiusZ: number;
}

export function createEllipsoid(
  name: string,
  scale: THREE.Vector3Tuple,
  material: THREE.Material,
  segments: DetailSegments,
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(
    1,
    segments.radial,
    segments.height,
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.scale.fromArray(scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createSegment(
  name: string,
  from: THREE.Vector3Tuple,
  to: THREE.Vector3Tuple,
  radius: number,
  material: THREE.Material,
  radialSegments = 10,
): THREE.Mesh {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = end.clone().sub(start);
  const geometry = new THREE.CylinderGeometry(
    radius * 0.82,
    radius,
    direction.length(),
    radialSegments,
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  mesh.castShadow = true;
  return mesh;
}

export function createCurvedSegment(
  name: string,
  from: THREE.Vector3Tuple,
  to: THREE.Vector3Tuple,
  radiusStart: number,
  radiusEnd: number,
  material: THREE.Material,
  bend: THREE.Vector3Tuple = [0, 0, 0],
  tubularSegments = 12,
  radialSegments = 8,
): THREE.Mesh {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const control = start
    .clone()
    .add(end)
    .multiplyScalar(0.5)
    .add(new THREE.Vector3(...bend));
  const curve = new THREE.QuadraticBezierCurve3(start, control, end);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let segment = 0; segment <= tubularSegments; segment += 1) {
    const t = segment / tubularSegments;
    curve.getPointAt(t, point);
    const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, t);
    for (let radial = 0; radial < radialSegments; radial += 1) {
      const angle = (radial / radialSegments) * Math.PI * 2;
      normal
        .copy(frames.normals[segment])
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(frames.binormals[segment], Math.sin(angle));
      vertices.push(
        point.x + normal.x * radius,
        point.y + normal.y * radius,
        point.z + normal.z * radius,
      );
      uvs.push(t, radial / radialSegments);
    }
  }

  for (let segment = 0; segment < tubularSegments; segment += 1) {
    for (let radial = 0; radial < radialSegments; radial += 1) {
      const nextRadial = (radial + 1) % radialSegments;
      const current = segment * radialSegments + radial;
      const next = segment * radialSegments + nextRadial;
      const upper = (segment + 1) * radialSegments + radial;
      const upperNext = (segment + 1) * radialSegments + nextRadial;
      indices.push(current, next, upperNext, current, upperNext, upper);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  return mesh;
}

export function createWingGeometry(): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-0.1, 0.58, 0.65, 1.2, 1.9, 1.05);
  shape.bezierCurveTo(2.75, 0.95, 3.3, 0.48, 3.22, 0.06);
  shape.bezierCurveTo(2.12, -0.2, 0.86, -0.24, 0, 0);
  const geometry = new THREE.ShapeGeometry(shape, 18);
  geometry.computeVertexNormals();
  return geometry;
}

export function createLoftGeometry(
  sections: LoftSection[],
  radialSegments = 36,
): THREE.BufferGeometry {
  if (sections.length < 2) {
    throw new Error("A loft requires at least two sections.");
  }

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  sections.forEach((section, sectionIndex) => {
    for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
      const angle = (radialIndex / radialSegments) * Math.PI * 2;
      vertices.push(
        section.x,
        Math.cos(angle) * section.radiusY,
        Math.sin(angle) * section.radiusZ,
      );
      uvs.push(
        sectionIndex / (sections.length - 1),
        radialIndex / radialSegments,
      );
    }
  });

  for (let sectionIndex = 0; sectionIndex < sections.length - 1; sectionIndex += 1) {
    for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
      const nextRadial = (radialIndex + 1) % radialSegments;
      const current = sectionIndex * radialSegments + radialIndex;
      const next = sectionIndex * radialSegments + nextRadial;
      const upper = (sectionIndex + 1) * radialSegments + radialIndex;
      const upperNext = (sectionIndex + 1) * radialSegments + nextRadial;
      indices.push(current, next, upperNext, current, upperNext, upper);
    }
  }

  const firstCenterIndex = vertices.length / 3;
  const first = sections[0];
  vertices.push(first.x, 0, 0);
  uvs.push(0, 0.5);
  const lastCenterIndex = vertices.length / 3;
  const last = sections[sections.length - 1];
  vertices.push(last.x, 0, 0);
  uvs.push(1, 0.5);

  const lastRingStart = (sections.length - 1) * radialSegments;
  for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
    const nextRadial = (radialIndex + 1) % radialSegments;
    indices.push(firstCenterIndex, nextRadial, radialIndex);
    indices.push(
      lastCenterIndex,
      lastRingStart + radialIndex,
      lastRingStart + nextRadial,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}

export function createRingStripe(
  name: string,
  radius: number,
  tube: number,
  material: THREE.Material,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 12, 48),
    material,
  );
  mesh.name = name;
  mesh.rotation.y = Math.PI / 2;
  return mesh;
}
