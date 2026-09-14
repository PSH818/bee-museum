import * as THREE from "three";

function disposeTextureValues(material: THREE.Material): void {
  const values = Object.values(material) as unknown[];
  const textures = new Set<THREE.Texture>();

  for (const value of values) {
    if (value instanceof THREE.Texture) textures.add(value);
  }

  for (const texture of textures) texture.dispose();
}

export function disposeObjectTree(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Line)) return;

    if (object.geometry) geometries.add(object.geometry);
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    objectMaterials.forEach((material) => materials.add(material));
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => {
    disposeTextureValues(material);
    material.dispose();
  });

  root.clear();
}
