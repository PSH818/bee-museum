import * as THREE from "three";

export type SpecimenKind = "bee" | "flower" | "stage";

export type SpecimenQuality = "low" | "medium" | "high";

export interface SpecimenMetadata {
  id: string;
  kind: SpecimenKind;
  version: number;
  scientificName: string;
  variant?: string;
}

export interface MuseumSpecimen<
  TAnchor extends string = string,
  TRig extends string = string,
> {
  root: THREE.Group;
  anchors: Record<TAnchor, THREE.Object3D>;
  rig: Record<TRig, THREE.Object3D>;
  bounds: THREE.Box3;
  metadata: SpecimenMetadata;
  dispose: () => void;
}

export function createAnchor(
  name: string,
  position: THREE.Vector3Tuple,
): THREE.Object3D {
  const anchor = new THREE.Object3D();
  anchor.name = `anchor:${name}`;
  anchor.position.fromArray(position);
  anchor.userData.anchorId = name;
  return anchor;
}

export function measureSpecimen(root: THREE.Object3D): THREE.Box3 {
  root.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(root);
}

export function assertSpecimenIntegrity<TAnchor extends string>(
  root: THREE.Object3D,
  anchors: Record<TAnchor, THREE.Object3D>,
  bounds: THREE.Box3,
): void {
  if (bounds.isEmpty()) {
    throw new Error(`Specimen '${root.name}' has empty bounds.`);
  }

  const values = [
    bounds.min.x,
    bounds.min.y,
    bounds.min.z,
    bounds.max.x,
    bounds.max.y,
    bounds.max.z,
  ];
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error(`Specimen '${root.name}' has invalid bounds.`);
  }

  for (const [id, anchor] of Object.entries<THREE.Object3D>(anchors)) {
    let current: THREE.Object3D | null = anchor;
    let belongsToRoot = false;
    while (current) {
      if (current === root) {
        belongsToRoot = true;
        break;
      }
      current = current.parent;
    }
    if (!belongsToRoot) {
      throw new Error(`Anchor '${id}' is not attached to '${root.name}'.`);
    }
  }
}
