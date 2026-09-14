import * as THREE from "three";
import type { BeeMorphologyProfile } from "../types";

export interface BeeMaterials {
  shell: THREE.MeshPhysicalMaterial;
  velvet: THREE.MeshPhysicalMaterial;
  amber: THREE.MeshPhysicalMaterial;
  eye: THREE.MeshPhysicalMaterial;
  wing: THREE.MeshPhysicalMaterial;
  pollen: THREE.MeshStandardMaterial;
  vein: THREE.LineBasicMaterial;
  hairLight: THREE.MeshStandardMaterial;
  hairDark: THREE.MeshStandardMaterial;
  hairLineLight: THREE.LineBasicMaterial;
  hairLineDark: THREE.LineBasicMaterial;
}

export function createWesternHoneyBeeMaterials(
  profile: BeeMorphologyProfile,
): BeeMaterials {
  const surfaceNoise = createNoiseTexture(64, 17);
  return {
    shell: new THREE.MeshPhysicalMaterial({
      color: profile.palette.shell,
      roughness: 0.46,
      metalness: 0.04,
      clearcoat: 0.32,
      clearcoatRoughness: 0.38,
      sheen: 0.2,
      sheenColor: new THREE.Color("#9c6938"),
      sheenRoughness: 0.65,
      bumpMap: surfaceNoise,
      bumpScale: 0.035,
    }),
    velvet: new THREE.MeshPhysicalMaterial({
      color: profile.palette.thorax,
      roughness: 0.82,
      sheen: 0.72,
      sheenColor: new THREE.Color(profile.palette.hairLight),
      sheenRoughness: 0.82,
      bumpMap: surfaceNoise,
      bumpScale: 0.055,
    }),
    amber: new THREE.MeshPhysicalMaterial({
      color: profile.palette.abdomen,
      roughness: 0.62,
      clearcoat: 0.1,
      clearcoatRoughness: 0.68,
      sheen: 0.16,
      sheenColor: new THREE.Color("#bc7b37"),
      bumpMap: surfaceNoise,
      bumpScale: 0.028,
    }),
    eye: new THREE.MeshPhysicalMaterial({
      color: "#120c08",
      roughness: 0.24,
      metalness: 0.15,
      clearcoat: 0.92,
      clearcoatRoughness: 0.12,
      iridescence: 0.28,
      iridescenceIOR: 1.38,
      flatShading: true,
    }),
    wing: new THREE.MeshPhysicalMaterial({
      color: "#b9ad89",
      transparent: true,
      opacity: 0.22,
      roughness: 0.18,
      transmission: 0.22,
      thickness: 0.018,
      clearcoat: 0.32,
      clearcoatRoughness: 0.2,
      iridescence: 0.58,
      iridescenceIOR: 1.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    pollen: new THREE.MeshStandardMaterial({
      color: "#dfa72f",
      roughness: 1,
    }),
    vein: new THREE.LineBasicMaterial({
      color: "#544a37",
      transparent: true,
      opacity: 0.52,
    }),
    hairLight: new THREE.MeshStandardMaterial({
      color: profile.palette.hairLight,
      roughness: 1,
    }),
    hairDark: new THREE.MeshStandardMaterial({
      color: profile.palette.hairDark,
      roughness: 1,
    }),
    hairLineLight: new THREE.LineBasicMaterial({
      color: profile.palette.hairLight,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
    hairLineDark: new THREE.LineBasicMaterial({
      color: profile.palette.hairDark,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    }),
  };
}

function createNoiseTexture(size: number, seed: number): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  let state = seed >>> 0;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967295;
  };

  for (let index = 0; index < size * size; index += 1) {
    const value = Math.round(96 + random() * 96);
    const offset = index * 4;
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.name = "procedural-chitin-microtexture";
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}
