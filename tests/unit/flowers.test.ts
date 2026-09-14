import { describe, expect, it } from "vitest";
import { collectDefaultDataset, validateContentData } from "../../src/data/validate";
import { monthInRange, type BeeFlowerRelation, type FlowerSpecies, type Region } from "../../src/data/schemas/content";

const region: Region = {
  id: "region-test",
  reviewStatus: "ai-reviewed",
  name: "测试地域",
  englishName: "Test region",
  summary: "用于校验器行为测试的合成地域。",
  seasons: { spring: { from: 3, to: 5 }, summer: { from: 6, to: 8 } },
  sourceIds: ["src-wikipedia-honey-bee"],
};

const entry = (id: "corolla" | "stamen" | "inflorescence", index: string) => ({
  id,
  reviewStatus: "ai-reviewed" as const,
  index,
  short: "部位",
  title: "合成观察条目标题",
  latin: "test",
  description: "合成描述文本,用于校验器测试。",
  fact: "合成观察笔记。",
  sourceIds: ["src-wikipedia-honey-bee"],
});

const flower: FlowerSpecies = {
  id: "flower-test",
  reviewStatus: "ai-reviewed",
  name: "测试花",
  scientificName: "Testus flos",
  englishName: "Test flower",
  family: "测试科",
  form: "radial",
  bloom: { "region-test": { from: 4, to: 5 } },
  nectar: "有花蜜",
  pollen: "有花粉",
  summary: "合成花朵,用于校验器测试。",
  entries: [entry("corolla", "01"), entry("stamen", "02"), entry("inflorescence", "03")],
  sourceIds: ["src-wikipedia-honey-bee"],
};

const relation = (over: Partial<BeeFlowerRelation>): BeeFlowerRelation => ({
  id: "rel-test",
  reviewStatus: "ai-reviewed",
  beeId: "apis-mellifera",
  flowerId: "flower-test",
  regionId: "region-test",
  season: "spring",
  relation: "nectar",
  evidence: "review",
  note: "词条记载为重要蜜源。",
  sourceIds: ["src-wikipedia-honey-bee"],
  ...over,
});

describe("花朵与四季馆校验", () => {
  // 合成的花朵子集不含真实七种花:蜂蜜单花蜜引用真实花朵 id,一并清空免得误报
  const base = { ...collectDefaultDataset(), honeyStages: [], honeyVarieties: [], honeyNotes: [] };

  it("monthInRange 支持跨年区间", () => {
    expect(monthInRange(12, { from: 11, to: 2 })).toBe(true);
    expect(monthInRange(1, { from: 11, to: 2 })).toBe(true);
    expect(monthInRange(6, { from: 11, to: 2 })).toBe(false);
    expect(monthInRange(4, { from: 3, to: 5 })).toBe(true);
  });

  it("合法的地域 / 花朵 / 关系通过校验", () => {
    const result = validateContentData({ ...base, regions: [region], flowers: [flower], relations: [relation({})] });
    expect(result.errors).toEqual([]);
    expect(result.stats.flowers).toBe(1);
    expect(result.stats.relations).toBe(1);
  });

  it("关系季节与花期不重叠时报错", () => {
    const result = validateContentData({
      ...base,
      regions: [region],
      flowers: [flower],
      relations: [relation({ season: "summer" })],
    });
    expect(result.errors.some((e) => e.includes("不重叠"))).toBe(true);
  });

  it("花朵缺观察条目、花期指向不存在的地域都会被抓出", () => {
    const broken: FlowerSpecies = {
      ...flower,
      bloom: { "region-nope": { from: 4, to: 5 } },
      entries: [entry("corolla", "01"), entry("stamen", "02"), entry("stamen", "03")],
    };
    const result = validateContentData({ ...base, regions: [region], flowers: [broken], relations: [] });
    expect(result.errors.some((e) => e.includes("缺少观察条目: inflorescence"))).toBe(true);
    expect(result.errors.some((e) => e.includes("不存在的地域: region-nope"))).toBe(true);
  });

  it("编辑整理级证据必须在说明里写明;引用不存在的蜂种报错", () => {
    const result = validateContentData({
      ...base,
      regions: [region],
      flowers: [flower],
      relations: [
        relation({ id: "rel-a", evidence: "editorial", note: "常见于花园。" }),
        relation({ id: "rel-b", beeId: "apis-nope" }),
      ],
    });
    expect(result.errors.some((e) => e.includes("rel-a") && e.includes("编辑整理"))).toBe(true);
    expect(result.errors.some((e) => e.includes("rel-b") && e.includes("不存在的蜂种"))).toBe(true);
  });
});
