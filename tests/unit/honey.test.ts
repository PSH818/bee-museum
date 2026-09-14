import { describe, expect, it } from "vitest";
import { collectDefaultDataset, validateContentData } from "../../src/data/validate";
import { honeyStages, honeyVarieties, honeyNotes } from "../../src/data/honey";
import { flowers } from "../../src/data/flowers";

describe("蜂蜜工坊数据(M5 第 1 步:实体、引用完整性、口径约束)", () => {
  it("旅程六站齐全且序号连续", () => {
    expect(honeyStages).toHaveLength(6);
    expect(honeyStages.map((s) => s.index)).toEqual(["01", "02", "03", "04", "05", "06"]);
  });

  it("单花蜜与花朵馆一一对应(七种花各一)", () => {
    expect(honeyVarieties).toHaveLength(7);
    const flowerIds = honeyVarieties.map((v) => v.flowerId).sort();
    expect(flowerIds).toEqual(Object.keys(flowers).sort());
  });

  it("纠偏卡两张:蜂王浆与谁在酿蜜,且每张至少两个分点", () => {
    expect(honeyNotes.map((n) => n.id).sort()).toEqual([
      "honey-note-royal-jelly",
      "honey-note-who-makes-honey",
    ]);
    for (const note of honeyNotes) {
      expect(note.points.length, `${note.id} 分点不足`).toBeGreaterThanOrEqual(2);
    }
  });

  it("蜂王浆卡不含功效表述(内容边界)", () => {
    const jelly = honeyNotes.find((n) => n.id === "honey-note-royal-jelly")!;
    const text = jelly.intro + jelly.points.map((p) => p.text).join("");
    for (const banned of ["保健", "免疫", "抗癌", "美容", "延缓衰老"]) {
      expect(text).not.toContain(banned);
    }
  });

  it("校验器拦截:指向不存在花朵的单花蜜", () => {
    const dataset = collectDefaultDataset();
    const broken = {
      ...dataset,
      honeyVarieties: [
        { ...honeyVarieties[0], id: "honey-nonexistent", flowerId: "flower-nonexistent" },
      ],
    };
    const result = validateContentData(broken);
    expect(result.errors.some((e) => e.includes("不存在的花朵: flower-nonexistent"))).toBe(true);
  });

  it("校验器拦截:旅程站点序号断档", () => {
    const dataset = collectDefaultDataset();
    const broken = { ...dataset, honeyStages: honeyStages.filter((s) => s.index !== "03") };
    const result = validateContentData(broken);
    expect(result.errors.some((e) => e.includes("缺少第 03 站"))).toBe(true);
  });

  it("全量数据集校验通过(蜂蜜条目计入统计)", () => {
    const result = validateContentData(collectDefaultDataset());
    expect(result.errors).toEqual([]);
    expect(result.stats.honeyEntries).toBe(15);
  });
});
