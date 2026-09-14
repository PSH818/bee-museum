import { describe, expect, it } from "vitest";
import { collectDefaultDataset, validateContentData } from "../../src/data/validate";
import { formatTime, lifeCycles, stageAt, timelineTicks } from "../../src/data/life-cycles";

describe("生命历程馆数据", () => {
  it("两条故事(社会性 + 独居)均存在且阶段首尾衔接", () => {
    const kinds = Object.values(lifeCycles).map((c) => c.kind).sort();
    expect(kinds).toEqual(["social", "solitary"]);
    for (const cycle of Object.values(lifeCycles)) {
      let cursor = cycle.total.from;
      for (const stage of cycle.stages) {
        expect(stage.span.from, `${stage.id} 起点`).toBeCloseTo(cursor, 6);
        cursor = stage.span.to;
      }
      expect(cursor).toBeCloseTo(cycle.total.to, 6);
    }
  });

  it("stageAt:区间左闭右开,末尾归最后阶段", () => {
    const cycle = lifeCycles["cycle-apis-mellifera-worker"];
    expect(stageAt(cycle, 0).id).toBe("stage-mellifera-egg");
    expect(stageAt(cycle, 3).id).toBe("stage-mellifera-larva");
    expect(stageAt(cycle, 8.99).id).toBe("stage-mellifera-larva");
    expect(stageAt(cycle, 9).id).toBe("stage-mellifera-pupa");
    expect(stageAt(cycle, 63).id).toBe("stage-mellifera-forager");
  });

  it("月刻度按 startMonth 换算,跨年加“次年”", () => {
    const cycle = lifeCycles["cycle-osmia-cornifrons"];
    const ticks = timelineTicks(cycle);
    expect(ticks[0]).toEqual({ at: 0, label: "4月" });
    expect(ticks.find((t) => t.at === 9)?.label).toBe("次年1月");
    expect(ticks.at(-1)).toEqual({ at: 12, label: "次年4月" });
    expect(formatTime(cycle, 0.1)).toBe("4 月上旬");
    expect(formatTime(cycle, 11.8)).toBe("次年 3 月下旬");
    expect(formatTime(lifeCycles["cycle-apis-mellifera-worker"], 21.4)).toBe("第 21 天");
  });

  it("校验器能抓出阶段断档与不存在的关联展品", () => {
    const dataset = collectDefaultDataset();
    const cycle = structuredClone(dataset.lifeCycles![0]);
    cycle.stages[1].span.from += 0.5; // 与前一阶段脱节
    cycle.stages[0].related.push({ kind: "organ", id: "organ-nope", label: "不存在" });
    const result = validateContentData({ ...dataset, lifeCycles: [cycle] });
    expect(result.errors.some((e) => e.includes("不衔接"))).toBe(true);
    expect(result.errors.some((e) => e.includes("organ/organ-nope"))).toBe(true);
  });
});
