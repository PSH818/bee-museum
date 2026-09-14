import * as THREE from "three";

export const SPECIMEN_UNIT = "centimeter" as const;
export const HEAD_DIRECTION = new THREE.Vector3(1, 0, 0);
export const UP_DIRECTION = new THREE.Vector3(0, 1, 0);
export const RIGHT_DIRECTION = new THREE.Vector3(0, 0, 1);

// The specimen uses +X as its anatomical head direction. The museum's default
// camera presents the head on the left, matching the original observation page.
export const DEFAULT_BEE_ROTATION = new THREE.Euler(
  0.03,
  Math.PI - 0.15,
  -0.06,
);

export function boundsCenter(bounds: THREE.Box3): THREE.Vector3 {
  return bounds.getCenter(new THREE.Vector3());
}

export function boundsRadius(bounds: THREE.Box3): number {
  return bounds.getBoundingSphere(new THREE.Sphere()).radius;
}
