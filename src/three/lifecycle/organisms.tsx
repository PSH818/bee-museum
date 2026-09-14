import { useMemo } from "react";
import * as THREE from "three";

/*
 * 生命历程场景里的程序化有机体:幼虫(蛴螬状弧形分节体)、卵、茧。
 * 全部由参数生成,不依赖外部资产;材质用 Physical 的 sheen/clearcoat 做出蜡质皮肤感。
 */

// ---------------------------------------------------------------- 幼虫

export interface GrubOptions {
  /** 沿身体的环数 */
  rings?: number;
  /** 截面点数 */
  radial?: number;
  /** 身体卷曲角度(弧长对应的圆心角) */
  curl?: number;
  /** 卷曲半径(身体中线所在圆弧半径) */
  bend?: number;
  /** 体节最大半径 */
  radius?: number;
  /** 体节数 */
  segments?: number;
  /** 体节鼓起幅度(相对半径) */
  bump?: number;
}

/**
 * 蛴螬状幼虫:弧形中线 + 两端钝圆 + 沿身体的体节鼓起,截面略扁(贴地)。
 * t=0 为头端(略细),t=1 为尾端。
 */
export function createGrubGeometry({
  rings = 80,
  radial = 18,
  curl = Math.PI * 1.15,
  bend = 0.22,
  radius = 0.085,
  segments = 12,
  bump = 0.09,
}: GrubOptions = {}): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const centerAt = (t: number) => {
    const theta = -curl / 2 + curl * t;
    return new THREE.Vector3(bend * Math.cos(theta), 0, bend * Math.sin(theta));
  };
  for (let i = 0; i < rings; i += 1) {
    const t = i / (rings - 1);
    const center = centerAt(t);
    const tangent = centerAt(Math.min(1, t + 1e-3)).sub(centerAt(Math.max(0, t - 1e-3))).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
    // 两端半球形钝圆(而不是锥尖)+ 头端略细 + 体节鼓起
    const capLen = 0.11;
    const endCap =
      t < capLen
        ? Math.sqrt(Math.max(0, 1 - ((capLen - t) / capLen) ** 2))
        : t > 1 - capLen
          ? Math.sqrt(Math.max(0, 1 - ((t - (1 - capLen)) / capLen) ** 2))
          : 1;
    const shape = (0.55 + 0.45 * Math.sqrt(Math.sin(Math.PI * t))) * (0.85 + 0.15 * t) * Math.max(endCap, 0.04);
    const ridge = 1 + bump * Math.sin(Math.PI * 2 * segments * t - Math.PI / 2) * Math.min(1, endCap * 1.5);
    const r = radius * shape * ridge;
    for (let j = 0; j < radial; j += 1) {
      const phi = (j / radial) * Math.PI * 2;
      const point = center
        .clone()
        .addScaledVector(side, Math.cos(phi) * r)
        .addScaledVector(up, Math.sin(phi) * r * 0.82 + r * 0.82); // 抬起,使腹面贴地(y=0)
      positions.push(point.x, point.y, point.z);
    }
  }
  for (let i = 0; i < rings - 1; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      const c = (i + 1) * radial + j;
      const d = (i + 1) * radial + ((j + 1) % radial);
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const LARVA_COLOR = "#f1e6d2";

/** 幼虫:弧形分节体 + 头端小头壳(浅褐)。放置时以腹面贴地(局部 y=0)。 */
export function Grub({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  options,
  castShadow = true,
}: {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  options?: GrubOptions;
  castShadow?: boolean;
}) {
  const geometry = useMemo(() => createGrubGeometry(options), [options]);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: LARVA_COLOR,
        roughness: 0.42,
        sheen: 0.7,
        sheenColor: new THREE.Color("#fff4e2"),
        sheenRoughness: 0.55,
        clearcoat: 0.12,
        clearcoatRoughness: 0.6,
      }),
    [],
  );
  const headMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c9a774", roughness: 0.55 }),
    [],
  );
  const curl = options?.curl ?? Math.PI * 1.15;
  const bend = options?.bend ?? 0.22;
  const radius = options?.radius ?? 0.085;
  const headTheta = -curl / 2;
  const head: [number, number, number] = [
    bend * Math.cos(headTheta) * 1.0,
    radius * 0.55,
    bend * Math.sin(headTheta) * 1.0,
  ];
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={material} castShadow={castShadow} />
      <mesh position={head} material={headMaterial} castShadow={castShadow}>
        <sphereGeometry args={[radius * 0.42, 14, 12]} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------- 卵

/** 卵:略弯的香蕉形胶囊,珍珠质表面 */
export function Egg({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  length = 0.13,
  radius = 0.04,
}: {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  radius?: number;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.CapsuleGeometry(radius, length, 6, 14);
    // 沿长轴微弯:x 方向按 y 做二次偏移
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const half = length / 2 + radius;
    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i);
      pos.setX(i, pos.getX(i) + (y * y) / half * 0.22);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [length, radius]);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f8f4ea",
        roughness: 0.32,
        clearcoat: 0.35,
        clearcoatRoughness: 0.4,
        sheen: 0.4,
        sheenColor: new THREE.Color("#fff8ea"),
      }),
    [],
  );
  return <mesh geometry={geometry} material={material} position={position} rotation={rotation} scale={scale} castShadow />;
}

// ---------------------------------------------------------------- 茧

let cocoonBump: THREE.CanvasTexture | null = null;
/** 丝质纤维感的凹凸贴图(运行时用画布生成一次) */
function getCocoonBump(): THREE.CanvasTexture {
  if (cocoonBump) return cocoonBump;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 700; i += 1) {
    const y = rand() * size;
    const x = rand() * size;
    const len = 20 + rand() * 60;
    const angle = (rand() - 0.5) * 0.5;
    const shade = rand() > 0.5 ? 255 : 0;
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.25 + rand() * 0.35})`;
    ctx.lineWidth = 0.8 + rand() * 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }
  cocoonBump = new THREE.CanvasTexture(canvas);
  cocoonBump.wrapS = cocoonBump.wrapT = THREE.RepeatWrapping;
  cocoonBump.repeat.set(2, 1);
  return cocoonBump;
}

/** 茧:椭球 + 纤维凹凸,深褐色纸质感;opacity 用于"剖视" */
export function Cocoon({
  scale = 1,
  position = [0, 0, 0],
  opacity = 1,
}: {
  scale?: number | [number, number, number];
  position?: [number, number, number];
  opacity?: number;
}) {
  const material = useMemo(() => {
    const bump = typeof document !== "undefined" ? getCocoonBump() : null;
    return new THREE.MeshStandardMaterial({
      color: "#6b4d32",
      roughness: 0.78,
      bumpMap: bump,
      bumpScale: 0.6,
      transparent: true,
    });
  }, []);
  material.opacity = opacity;
  material.depthWrite = opacity > 0.9;
  return (
    <mesh position={position} scale={scale} material={material} castShadow>
      <sphereGeometry args={[0.3, 32, 22]} />
    </mesh>
  );
}
