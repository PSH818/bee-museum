import { describe, expect, it } from "vitest";
import {
  collectDefaultDataset,
  validateContent,
  validateContentData,
  type ContentDataset,
} from "../../src/data/validate";

describe("内容数据校验(前端方案 §11.1:构建时 Zod 校验,失败阻止发布)", () => {
  it("全部内容通过结构校验与引用完整性检查", () => {
    const result = validateContent();
    if (result.warnings.length > 0) {
      console.warn(
        `[content] ${result.warnings.length} 条提醒(草稿内容等):\n` +
          result.warnings.map((w) => `  - ${w}`).join("\n"),
      );
    }
    expect(result.errors).toEqual([]);
    expect(result.stats.sources).toBeGreaterThan(0);
    expect(result.stats.organs).toBeGreaterThan(0);
    expect(result.stats.focusEntries).toBeGreaterThan(0);
  });

  it("每个关键知识点都有来源(覆盖率 100%,产品成功指标)", () => {
    const dataset = collectDefaultDataset();
    for (const organ of dataset.organs) {
      expect(organ.sourceIds.length, `器官 ${organ.id} 缺来源`).toBeGreaterThan(0);
    }
    for (const list of Object.values(dataset.focusLists)) {
      for (const item of list ?? []) {
        expect(item.sourceIds.length, `观察条目 ${item.id} 缺来源`).toBeGreaterThan(0);
      }
    }
  });
});

describe("校验器本身的行为(用合成数据验证门禁逻辑)", () => {
  const minimalDataset = (): ContentDataset => ({
    sources: [
      {
        id: "src-test",
        title: "T",
        organization: "O",
        accessedOn: "2026-08-21",
        reviewer: "某审校人",
        status: "reviewed",
      },
    ],
    organs: [],
    focusLists: {},
    compareRows: [],
    species: [],
  });

  it("引用不存在的来源会被拦截", () => {
    const dataset = minimalDataset();
    dataset.organs.push({
      id: "organ-test",
      castes: ["worker"],
      anchorIds: ["head"],
      focusId: "head",
      name: "测试",
      summary: "长度足够的测试摘要内容。",
      functionNote: "测试功能说明。",
      sourceIds: ["src-missing"],
      reviewStatus: "reviewed",
      lastReviewedOn: "2026-08-21",
    });
    const result = validateContentData(dataset);
    expect(result.errors.some((e) => e.includes("src-missing"))).toBe(true);
  });

  it("发布门禁:releaseGate 打开时 draft 内容算错误,平时只是警告", () => {
    const dataset = minimalDataset();
    dataset.organs.push({
      id: "organ-draft",
      castes: ["worker"],
      anchorIds: ["head"],
      focusId: "head",
      name: "草稿条目",
      summary: "长度足够的测试摘要内容。",
      functionNote: "测试功能说明。",
      sourceIds: ["src-test"],
      reviewStatus: "draft",
      lastReviewedOn: null,
    });
    const normal = validateContentData(dataset);
    expect(normal.errors).toEqual([]);
    expect(normal.warnings.some((w) => w.includes("organ-draft"))).toBe(true);

    const gated = validateContentData(dataset, { releaseGate: true });
    expect(gated.errors.some((e) => e.includes("organ-draft"))).toBe(true);
  });

  it("标记已审校但缺少复核日期会被拦截", () => {
    const dataset = minimalDataset();
    dataset.organs.push({
      id: "organ-no-date",
      castes: ["worker"],
      anchorIds: ["head"],
      focusId: "head",
      name: "缺日期",
      summary: "长度足够的测试摘要内容。",
      functionNote: "测试功能说明。",
      sourceIds: ["src-test"],
      reviewStatus: "reviewed",
      lastReviewedOn: null,
    });
    const result = validateContentData(dataset);
    expect(result.errors.some((e) => e.includes("lastReviewedOn"))).toBe(true);
  });
});
