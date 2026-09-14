import { describe, expect, it } from "vitest";
import { findHallByPath, halls } from "../../src/data/halls";

describe("展厅目录", () => {
  it("id 与路径唯一", () => {
    const ids = halls.map((h) => h.id);
    const paths = halls.map((h) => h.path);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("路径均为站内绝对路径", () => {
    for (const hall of halls) expect(hall.path.startsWith("/")).toBe(true);
  });

  it("筹备中的展厅必须标注里程碑;开放展厅不需要", () => {
    for (const hall of halls) {
      if (hall.status === "planned") expect(hall.milestone).toMatch(/^M\d$/);
    }
  });

  it("按路径能找回筹备中的展厅", () => {
    expect(findHallByPath("/museum/flowers")?.id).toBe("flowers");
    expect(findHallByPath("/museum/life-cycle")?.id).toBe("life-cycle");
    expect(findHallByPath("/nope")).toBeUndefined();
  });
});
