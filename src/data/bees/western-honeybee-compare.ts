import type { BeeCaste } from "../../three/bees/types";
import type { CompareRow } from "../schemas/content";

// 三职型比较台数据(产品方案 §8.2)。
// 数值由 AI 起草,reviewStatus 均为 draft,发布前需人工核对。

/** 展台按真实体长比例缩放使用的基准值(mm,取常见文献范围中值) */
export const CASTE_BODY_LENGTH_MM: Record<BeeCaste, number> = {
  worker: 13.5,
  queen: 19,
  drone: 16,
};

export const casteBodyLengthText: Record<BeeCaste, string> = {
  worker: "约 12–15 mm",
  queen: "更长,常见文献约 18–20 mm",
  drone: "介于两者之间,常见文献约 15–17 mm",
};

export const casteCompareRows: CompareRow[] = [
  {
    id: "row-body-length",
    dimension: "体长",
    values: {
      worker: casteBodyLengthText.worker,
      queen: casteBodyLengthText.queen,
      drone: casteBodyLengthText.drone,
    },
    sourceIds: ["src-wikipedia-worker-bee", "src-wikipedia-honey-bee", "src-britannica-honeybee"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "row-corbicula",
    dimension: "后足花粉筐",
    values: { worker: "有", queen: "无", drone: "无" },
    sourceIds: ["src-wikipedia-pollen-basket", "src-wikipedia-honey-bee", "src-wikipedia-western-honey-bee"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "row-sting",
    dimension: "螫针",
    values: {
      worker: "有,带倒钩",
      queen: "有,不像工蜂那样带明显倒钩",
      drone: "无",
    },
    sourceIds: [
      "src-wikipedia-worker-bee",
      "src-wikipedia-honey-bee",
      "src-wikipedia-western-honey-bee",
      "src-snodgrass-anatomy",
    ],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "row-eyes",
    dimension: "复眼",
    values: {
      worker: "常规比例",
      queen: "相对较小",
      drone: "显著增大,向头顶靠拢",
    },
    sourceIds: ["src-wikipedia-honey-bee", "src-snodgrass-anatomy"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "row-role",
    dimension: "群体角色",
    values: {
      worker: "采集、育幼、筑巢、防御",
      queen: "产卵与群体繁殖",
      drone: "交配",
    },
    sourceIds: ["src-britannica-honeybee", "src-wikipedia-honey-bee"],
    reviewStatus: "ai-reviewed",
  },
];

// 东方蜜蜂三职型对照:结构性差异与西方蜜蜂一致;
// 各职型体长缺可核来源,暂不列体长行(见审校工作台)
export const ceranaCompareRows: CompareRow[] = [
  {
    id: "row-cerana-corbicula",
    dimension: "后足花粉筐",
    values: { worker: "有", queen: "无", drone: "无" },
    sourceIds: ["src-wikipedia-pollen-basket", "src-wikipedia-apis-cerana", "src-wikipedia-honey-bee"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "row-cerana-sting",
    dimension: "螫针",
    values: { worker: "有,带倒钩", queen: "有,不像工蜂那样带明显倒钩", drone: "无" },
    sourceIds: ["src-wikipedia-honey-bee", "src-wikipedia-apis-cerana", "src-snodgrass-anatomy"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "row-cerana-eyes",
    dimension: "复眼",
    values: { worker: "常规比例", queen: "相对较小", drone: "显著增大" },
    sourceIds: ["src-wikipedia-honey-bee", "src-wikipedia-apis-cerana", "src-snodgrass-anatomy"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "row-cerana-colony",
    dimension: "群体规模",
    values: {
      worker: "约 6000–7000 只(不同资料差异较大)",
      queen: "通常一群一王",
      drone: "季节性存在",
    },
    sourceIds: ["src-wikipedia-apis-cerana"],
    reviewStatus: "ai-reviewed",
  },
];

/** 物种 → 对照行 */
export const compareRowsBySpecies: Record<string, CompareRow[]> = {
  "apis-mellifera": casteCompareRows,
  "apis-cerana": ceranaCompareRows,
};

/** 物种 → 职型体长(mm,用于比较台真实比例);缺数据的物种按模型原比例展示 */
export const bodyLengthBySpecies: Record<string, Record<BeeCaste, number> | undefined> = {
  "apis-mellifera": CASTE_BODY_LENGTH_MM,
};
export const bodyLengthTextBySpecies: Record<string, Record<BeeCaste, string> | undefined> = {
  "apis-mellifera": casteBodyLengthText,
};
