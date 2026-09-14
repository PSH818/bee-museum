import { z } from "zod";
import type { BeeAnchorId } from "../../three/bees/types";

// ---- 审校状态(产品方案 §9.2) ----
// draft: AI 起草,未经核对
// ai-reviewed: 通过 AI 对抗式审查(事实核查/反驳/合规三视角独立审查,任一否决即不通过),未经专家核校
// reviewed: 有人工审校人核对;verified: 多源核验
// 说明:因资源限制,首期采用 ai-reviewed 作为正式展出门槛,界面如实标注(见 content-review/REVIEW-POLICY.md)
export const reviewStatusSchema = z.enum(["draft", "ai-reviewed", "reviewed", "verified"]);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// ---- 来源记录(产品方案 §9.1 SourceRecord) ----
export const sourceRecordSchema = z.object({
  id: z.string().regex(/^src-[a-z0-9-]+$/),
  title: z.string().min(1),
  organization: z.string().min(1),
  /** 书籍等离线来源可以没有链接 */
  url: z.url().optional(),
  accessedOn: z.string().regex(ISO_DATE),
  /** 审校人;null 表示尚无人工审校 */
  reviewer: z.string().min(1).nullable(),
  status: reviewStatusSchema,
});
export type SourceRecord = z.infer<typeof sourceRecordSchema>;

// ---- 观察部位(序厅观察卡使用的 5 个聚焦点) ----
export const focusIdSchema = z.enum(["whole", "head", "wing", "abdomen", "leg"]);
export type FocusIdValue = z.infer<typeof focusIdSchema>;

export const focusEntrySchema = z.object({
  id: focusIdSchema,
  index: z.string().regex(/^\d{2}$/),
  short: z.string().min(1),
  title: z.string().min(4),
  latin: z.string().min(1),
  description: z.string().min(10),
  fact: z.string().min(6),
  sourceIds: z.array(z.string()).min(1),
  reviewStatus: reviewStatusSchema,
});

// ---- 独立器官条目(身体与职型馆的数据基础) ----
// 与三维标本的语义锚点(前端方案 §8.1)一一对应
export const BEE_ANCHOR_ID_VALUES = [
  "whole", "head", "thorax", "abdomen",
  "compoundEyeL", "compoundEyeR", "antennaL", "antennaR", "proboscis",
  "foreWingL", "foreWingR", "hindWingL", "hindWingR",
  "foreLegL", "foreLegR", "midLegL", "midLegR", "hindLegL", "hindLegR",
  "leg", "sting",
] as const satisfies readonly BeeAnchorId[];

export const organEntrySchema = z.object({
  id: z.string().regex(/^organ-[a-z0-9-]+$/),
  /** 适用职型:如工蜂特有的花粉筐、雄蜂缺失的螫针(产品方案 §2.2) */
  castes: z.array(z.enum(["worker", "queen", "drone"])).min(1),
  /** 该器官在三维标本上的语义锚点(可多个,如左右成对器官) */
  anchorIds: z.array(z.enum(BEE_ANCHOR_ID_VALUES)).min(1),
  /** 属于哪个观察聚焦组 */
  focusId: focusIdSchema,
  name: z.string().min(1),
  latinName: z.string().optional(),
  summary: z.string().min(10),
  functionNote: z.string().min(6),
  /** 模型侧说明:器官在当前模型中省略或近似时必须注明原因(前端方案 §8.1) */
  modelNote: z.string().optional(),
  sourceIds: z.array(z.string()).min(1),
  reviewStatus: reviewStatusSchema,
  /** 最后一次人工复核日期;null 表示尚未复核 */
  lastReviewedOn: z.string().regex(ISO_DATE).nullable(),
});
export type OrganEntry = z.infer<typeof organEntrySchema>;

// ---- 蜂种实体(产品方案 §9.1:物种馆的数据基础) ----
export const beeSpeciesSchema = z.object({
  /** 如 apis-mellifera / apis-cerana */
  id: z.string().regex(/^[a-z]+(-[a-z]+)+$/),
  name: z.string().min(1),
  scientificName: z.string().min(1),
  englishName: z.string().min(1),
  family: z.string().min(1),
  distribution: z.string().min(2),
  socialStructure: z.string().min(2),
  nesting: z.string().min(2),
  /** 工蜂体长范围(mm) */
  workerBodyLengthMm: z.object({ min: z.number().positive(), max: z.number().positive() }),
  summary: z.string().min(10),
  sourceIds: z.array(z.string()).min(1),
  reviewStatus: reviewStatusSchema,
});
export type BeeSpeciesRecord = z.infer<typeof beeSpeciesSchema>;

// ---- 职型对照行(比较台,产品方案 §8.2) ----
export const compareRowSchema = z.object({
  id: z.string().regex(/^row-[a-z0-9-]+$/),
  dimension: z.string().min(1),
  values: z.object({
    worker: z.string().min(1),
    queen: z.string().min(1),
    drone: z.string().min(1),
  }),
  sourceIds: z.array(z.string()).min(1),
  reviewStatus: reviewStatusSchema,
});
export type CompareRow = z.infer<typeof compareRowSchema>;

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  draft: "草稿 · 未经核校",
  "ai-reviewed": "AI 对抗审查通过 · 未经专家核校",
  reviewed: "已审校",
  verified: "已核验",
};

// ---- 生命周期(产品方案 §4.5 / §9.1 LifeCycle) ----
// 一条故事 = 一个物种(职型)从卵到死亡/下一代的时间轴;阶段按时间轴单位(天或月)给区间
export const lifeCyclePhaseSchema = z.enum([
  "egg", "larva", "pupa", "adult", "nest", "cocoon", "overwinter", "emerge",
]);
export type LifeCyclePhase = z.infer<typeof lifeCyclePhaseSchema>;

/** 过程节点可跳回的相关展品(产品方案 §8.3:形成知识网络) */
export const relatedExhibitSchema = z.object({
  kind: z.enum(["organ", "species", "focus", "compare", "cycle"]),
  id: z.string().min(1),
  label: z.string().min(1),
});
export type RelatedExhibit = z.infer<typeof relatedExhibitSchema>;

export const lifeCycleStageSchema = z.object({
  id: z.string().regex(/^stage-[a-z0-9-]+$/),
  reviewStatus: reviewStatusSchema,
  name: z.string().min(1),
  /** 时间轴与左侧列表用的短名(≤4 字) */
  short: z.string().min(1).max(4),
  /** 场景可视化用的阶段类型 */
  phase: lifeCyclePhaseSchema,
  /** 时间轴区间,单位由所属故事的 unit 决定 */
  span: z.object({ from: z.number().min(0), to: z.number().positive() }),
  spanText: z.string().min(1),
  summary: z.string().min(10),
  detail: z.string().min(10),
  /** 温度、季节等条件说明(只写经审校的影响) */
  condition: z.string().optional(),
  related: z.array(relatedExhibitSchema),
  sourceIds: z.array(z.string()).min(1),
});
export type LifeCycleStage = z.infer<typeof lifeCycleStageSchema>;

export const lifeCycleBranchSchema = z.object({
  id: z.string().regex(/^branch-[a-z0-9-]+$/),
  reviewStatus: reviewStatusSchema,
  title: z.string().min(1),
  text: z.string().min(10),
  sourceIds: z.array(z.string()).min(1),
});
export type LifeCycleBranch = z.infer<typeof lifeCycleBranchSchema>;

export const lifeCycleSchema = z.object({
  id: z.string().regex(/^cycle-[a-z-]+$/),
  reviewStatus: reviewStatusSchema,
  kind: z.enum(["social", "solitary"]),
  speciesId: z.string().min(1),
  caste: z.enum(["worker", "queen", "drone"]).optional(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  unit: z.enum(["day", "month"]),
  /** 月为单位时,时间轴 0 对应的月份(1–12) */
  startMonth: z.number().int().min(1).max(12).optional(),
  total: z.object({ from: z.number().min(0), to: z.number().positive() }),
  intro: z.string().min(10),
  stages: z.array(lifeCycleStageSchema).min(4),
  branches: z.array(lifeCycleBranchSchema),
  sourceIds: z.array(z.string()).min(1),
});
export type LifeCycle = z.infer<typeof lifeCycleSchema>;

// ---- 花朵与四季馆(产品方案 §4.4 / §9.1;前端方案 §11.2) ----
export const seasonSchema = z.enum(["spring", "summer", "autumn", "winter"]);
export type Season = z.infer<typeof seasonSchema>;
export const SEASON_LABEL: Record<Season, string> = { spring: "春", summer: "夏", autumn: "秋", winter: "冬" };

/** 月份区间(含首尾,允许跨年:from 11 to 2) */
export const monthRangeSchema = z.object({
  from: z.number().int().min(1).max(12),
  to: z.number().int().min(1).max(12),
});
export type MonthRange = z.infer<typeof monthRangeSchema>;

export const regionSchema = z.object({
  id: z.string().regex(/^region-[a-z-]+$/),
  reviewStatus: reviewStatusSchema,
  name: z.string().min(1),
  englishName: z.string().min(1),
  summary: z.string().min(10),
  /** 首期只做春、夏两季的月份口径 */
  seasons: z.object({ spring: monthRangeSchema, summer: monthRangeSchema }),
  sourceIds: z.array(z.string()).min(1),
});
export type Region = z.infer<typeof regionSchema>;

/** 花型(前端方案 §7.4 三类花冠模板 + 四类花序中的首期子集) */
export const flowerFormSchema = z.enum(["radial", "bilateral", "papilionaceous", "capitulum", "spike"]);
export type FlowerForm = z.infer<typeof flowerFormSchema>;
export const FLOWER_FORM_LABEL: Record<FlowerForm, string> = {
  radial: "辐射对称",
  bilateral: "两侧对称",
  papilionaceous: "蝶形花",
  capitulum: "头状花序",
  spike: "穗状花序",
};

/** 花朵观察部位(对应锚点 flowerCenter / petalFocus / stamenFocus / nectarEntrance) */
export const flowerFocusIdSchema = z.enum(["whole", "corolla", "stamen", "inflorescence"]);
export type FlowerFocusId = z.infer<typeof flowerFocusIdSchema>;

export const flowerEntrySchema = z.object({
  id: flowerFocusIdSchema,
  reviewStatus: reviewStatusSchema,
  index: z.string().regex(/^\d{2}$/),
  short: z.string().min(1).max(4),
  title: z.string().min(4),
  latin: z.string().min(1),
  description: z.string().min(10),
  fact: z.string().min(6),
  sourceIds: z.array(z.string()).min(1),
});
export type FlowerEntry = z.infer<typeof flowerEntrySchema>;

export const flowerSpeciesSchema = z.object({
  id: z.string().regex(/^flower-[a-z-]+$/),
  reviewStatus: reviewStatusSchema,
  name: z.string().min(1),
  scientificName: z.string().min(1),
  englishName: z.string().min(1),
  family: z.string().min(1),
  form: flowerFormSchema,
  /** 花冠管深度 / 花朵长度(mm);无来源则不填 */
  corollaDepthMm: z.object({ min: z.number().positive(), max: z.number().positive() }).optional(),
  /** 各地域花期(键为 region id) */
  bloom: z.record(z.string(), monthRangeSchema),
  nectar: z.string().min(2),
  pollen: z.string().min(2),
  summary: z.string().min(10),
  /** 三条观察条目:花冠 / 花蕊 / 花序(校验器要求齐全) */
  entries: z.array(flowerEntrySchema).min(3),
  sourceIds: z.array(z.string()).min(1),
});
export type FlowerSpecies = z.infer<typeof flowerSpeciesSchema>;

export const relationTypeSchema = z.enum(["nectar", "pollen", "pollination", "observed-visit"]);
export type RelationType = z.infer<typeof relationTypeSchema>;
export const RELATION_LABEL: Record<RelationType, string> = {
  nectar: "取蜜",
  pollen: "采粉",
  pollination: "传粉",
  "observed-visit": "观察到访花",
};
export const evidenceLevelSchema = z.enum(["primary", "review", "institutional", "editorial"]);
export type EvidenceLevel = z.infer<typeof evidenceLevelSchema>;
export const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  primary: "一手研究",
  review: "综述/教科书",
  institutional: "机构资料",
  editorial: "编辑整理",
};

/** 蜂 × 花 × 地域 × 季节 的关系,只表达有依据的关联 */
export const beeFlowerRelationSchema = z.object({
  id: z.string().regex(/^rel-[a-z0-9-]+$/),
  reviewStatus: reviewStatusSchema,
  beeId: z.string().min(1),
  flowerId: z.string().min(1),
  regionId: z.string().min(1),
  season: seasonSchema,
  relation: relationTypeSchema,
  evidence: evidenceLevelSchema,
  /** 一句话说明依据(editorial 必填且要写明是编辑整理) */
  note: z.string().min(6),
  sourceIds: z.array(z.string()).min(1),
});
export type BeeFlowerRelation = z.infer<typeof beeFlowerRelationSchema>;

// ---- 蜂蜜工坊(M5;docs/m5-honey-workshop-plan.md) ----
/** 一滴花蜜的旅程:6 个站点(采集→携带→交接→转化→浓缩→封盖) */
export const honeyStageSchema = z.object({
  id: z.string().regex(/^honey-stage-[a-z0-9-]+$/),
  reviewStatus: reviewStatusSchema,
  index: z.string().regex(/^\d{2}$/),
  /** 左栏与站点条用的短名(≤4 字) */
  short: z.string().min(1).max(4),
  title: z.string().min(4),
  /** 英文小标(对齐观察条目的 latin 风格) */
  latin: z.string().min(1),
  summary: z.string().min(10),
  detail: z.string().min(10),
  /** 资料出入或科学边界说明(只在确有出入时写) */
  boundary: z.string().optional(),
  related: z.array(relatedExhibitSchema),
  sourceIds: z.array(z.string()).min(1),
});
export type HoneyStage = z.infer<typeof honeyStageSchema>;

/** 单花蜜:与花朵馆一一对应;感官描述有来源才写,没有就如实说没找到 */
export const honeyVarietySchema = z.object({
  id: z.string().regex(/^honey-[a-z-]+$/),
  reviewStatus: reviewStatusSchema,
  name: z.string().min(2),
  /** 来源花,必须存在于花朵馆 */
  flowerId: z.string().min(1),
  /** 色泽/结晶/风味等描述 */
  traits: z.string().min(10),
  /** 主产地口径 */
  regionNote: z.string().min(2),
  sourceIds: z.array(z.string()).min(1),
});
export type HoneyVariety = z.infer<typeof honeyVarietySchema>;

/** 纠偏卡(蜂王浆是什么/谁在酿蜜):一段引言 + 分点 */
export const honeyNoteSchema = z.object({
  id: z.string().regex(/^honey-note-[a-z-]+$/),
  reviewStatus: reviewStatusSchema,
  title: z.string().min(4),
  intro: z.string().min(10),
  points: z
    .array(z.object({ label: z.string().min(1), text: z.string().min(6) }))
    .min(2),
  related: z.array(relatedExhibitSchema),
  sourceIds: z.array(z.string()).min(1),
});
export type HoneyNote = z.infer<typeof honeyNoteSchema>;

/** 月份是否落在区间内(区间可跨年) */
export function monthInRange(month: number, range: MonthRange): boolean {
  return range.from <= range.to
    ? month >= range.from && month <= range.to
    : month >= range.from || month <= range.to;
}
