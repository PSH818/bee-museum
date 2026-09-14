import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  createWesternHoneyBee,
  type WesternHoneyBeeSpecimen,
} from "../../src/three/bees/species/apis-mellifera-worker";
import type { BeeAnchorId, BeeCaste } from "../../src/three/bees/types";

const REQUIRED_ANCHORS: BeeAnchorId[] = [
  "whole", "head", "thorax", "abdomen",
  "compoundEyeL", "compoundEyeR", "antennaL", "antennaR", "proboscis",
  "foreWingL", "foreWingR", "hindWingL", "hindWingR",
  "foreLegL", "foreLegR", "midLegL", "midLegR", "hindLegL", "hindLegR",
  "leg", "sting",
];
const CASTES: BeeCaste[] = ["worker", "queen", "drone"];

/** stable structural digest: mesh names, vertex counts, anchor coordinates */
function fingerprint(specimen: WesternHoneyBeeSpecimen): string {
  const meshes: string[] = [];
  specimen.root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const count = object.geometry.getAttribute("position")?.count ?? 0;
      meshes.push(`${object.name}:${count}`);
    }
  });
  meshes.sort();
  const anchors = Object.entries(specimen.anchors)
    .map(([id, anchor]) =>
      `${id}@${anchor.position.toArray().map((v) => v.toFixed(5)).join(",")}`)
    .sort();
  return [...meshes, ...anchors].join("|");
}

describe("确定性:同一种子生成同一标本", () => {
  it("两次构建的网格结构与锚点坐标逐位一致", () => {
    const a = createWesternHoneyBee({ caste: "worker", seed: 1, quality: "high" });
    const b = createWesternHoneyBee({ caste: "worker", seed: 1, quality: "high" });
    expect(fingerprint(a)).toBe(fingerprint(b));
    a.dispose();
    b.dispose();
  });
});

describe("锚点契约(前端方案 §8.1)", () => {
  for (const caste of CASTES) {
    it(`${caste}:全部标准锚点存在且落在包围盒内`, () => {
      const specimen = createWesternHoneyBee({ caste, seed: 1, quality: "low" });
      const inflated = specimen.bounds.clone().expandByScalar(0.25);
      for (const id of REQUIRED_ANCHORS) {
        const anchor = specimen.anchors[id];
        expect(anchor, `缺少锚点 ${id}`).toBeDefined();
        expect(
          inflated.containsPoint(anchor.position),
          `锚点 ${id} 位于包围盒之外: ${anchor.position.toArray().join(",")}`,
        ).toBe(true);
      }
      specimen.dispose();
    });
  }
});

describe("形态合法性", () => {
  for (const caste of CASTES) {
    it(`${caste}:包围盒有限、三轴尺寸为正`, () => {
      const specimen = createWesternHoneyBee({ caste, seed: 1, quality: "low" });
      const size = specimen.bounds.getSize(new THREE.Vector3());
      for (const axis of ["x", "y", "z"] as const) {
        expect(Number.isFinite(size[axis])).toBe(true);
        expect(size[axis]).toBeGreaterThan(0);
      }
      specimen.dispose();
    });
  }
});

describe("dispose() 幂等(前端方案 §15.1)", () => {
  it("可重复调用且清空场景树", () => {
    const specimen = createWesternHoneyBee({ caste: "worker", seed: 1, quality: "low" });
    expect(() => {
      specimen.dispose();
      specimen.dispose();
    }).not.toThrow();
    expect(specimen.root.children.length).toBe(0);
  });

  it("释放后几何体缓冲已被丢弃", () => {
    const specimen = createWesternHoneyBee({ caste: "worker", seed: 1, quality: "low" });
    const geometries: THREE.BufferGeometry[] = [];
    specimen.root.traverse((object) => {
      if (object instanceof THREE.Mesh) geometries.push(object.geometry);
    });
    expect(geometries.length).toBeGreaterThan(0);
    const disposed: boolean[] = geometries.map(() => false);
    geometries.forEach((geometry, index) => {
      geometry.addEventListener("dispose", () => {
        disposed[index] = true;
      });
    });
    specimen.dispose();
    expect(disposed.every(Boolean)).toBe(true);
  });
});
