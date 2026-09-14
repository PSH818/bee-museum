import type { LifeCycle, LifeCycleStage } from "../schemas/content";
import { apisMelliferaWorkerCycle } from "./apis-mellifera-worker";
import { osmiaCornifronsCycle } from "./osmia-cornifrons";

/** 生命历程馆的全部故事;新增一条只需在此登记 */
export const lifeCycles: Record<string, LifeCycle> = {
  [apisMelliferaWorkerCycle.id]: apisMelliferaWorkerCycle,
  [osmiaCornifronsCycle.id]: osmiaCornifronsCycle,
};
export const LIFE_CYCLE_IDS = Object.keys(lifeCycles);
export const DEFAULT_LIFE_CYCLE_ID = apisMelliferaWorkerCycle.id;

/** 时间轴位置 t 所处的阶段(区间左闭右开;末尾取最后一个) */
export function stageAt(story: LifeCycle, t: number): LifeCycleStage {
  const found = story.stages.find((s) => t >= s.span.from && t < s.span.to);
  return found ?? story.stages[story.stages.length - 1];
}

/** 时间轴刻度:天 → 每 7 天;月 → 每月(按 startMonth 换算成月份名) */
export function timelineTicks(story: LifeCycle): Array<{ at: number; label: string }> {
  const ticks: Array<{ at: number; label: string }> = [];
  if (story.unit === "day") {
    for (let d = story.total.from; d <= story.total.to; d += 7) ticks.push({ at: d, label: `${d} 天` });
  } else {
    const start = story.startMonth ?? 1;
    for (let m = Math.ceil(story.total.from); m <= story.total.to; m += 1) {
      const month = ((start - 1 + m) % 12) + 1;
      const nextYear = start - 1 + m >= 12;
      ticks.push({ at: m, label: `${nextYear ? "次年" : ""}${month}月` });
    }
  }
  return ticks;
}

/** 时间轴位置的可读文字 */
export function formatTime(story: LifeCycle, t: number): string {
  if (story.unit === "day") return `第 ${Math.floor(t)} 天`;
  const start = story.startMonth ?? 1;
  const whole = Math.floor(t);
  const month = ((start - 1 + whole) % 12) + 1;
  const nextYear = start - 1 + whole >= 12;
  const part = t - whole;
  const tenDay = part < 1 / 3 ? "上旬" : part < 2 / 3 ? "中旬" : "下旬";
  return `${nextYear ? "次年 " : ""}${month} 月${tenDay}`;
}
