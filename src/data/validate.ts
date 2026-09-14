import type { BeeCaste } from "../three/bees/types";
import {
  beeSpeciesSchema,
  compareRowSchema,
  focusEntrySchema,
  organEntrySchema,
  sourceRecordSchema,
  type BeeSpeciesRecord,
  beeFlowerRelationSchema,
  flowerSpeciesSchema,
  honeyNoteSchema,
  honeyStageSchema,
  honeyVarietySchema,
  lifeCycleSchema,
  monthInRange,
  regionSchema,
  type BeeFlowerRelation,
  type CompareRow,
  type FlowerSpecies,
  type HoneyNote,
  type HoneyStage,
  type HoneyVariety,
  type LifeCycle,
  type Region,
  type OrganEntry,
  type SourceRecord,
} from "./schemas/content";
import { lifeCycles } from "./life-cycles";
import { regions } from "./regions";
import { flowers } from "./flowers";
import { beeFlowerRelations } from "./relations/bee-flower";
import type { BeeFocusItem } from "./bees/western-honeybee-worker";
import { speciesContent } from "./bees/species-content";
import { compareRowsBySpecies } from "./bees/western-honeybee-compare";
import { beeSpecies, speciesCastes } from "./bees/species-index";
import { sourceRecords } from "./sources/records";
import { honeyNotes } from "./honey/notes";
import { honeyStages } from "./honey/stages";
import { honeyVarieties } from "./honey/varieties";

export interface ContentDataset {
  sources: SourceRecord[];
  organs: OrganEntry[];
  /** 键为"展品标识"(如 mellifera 三职型、cerana-worker),值为该展品的观察条目 */
  focusLists: Record<string, BeeFocusItem[]>;
  compareRows: CompareRow[];
  species: BeeSpeciesRecord[];
  /** 生命历程馆的故事(可选,便于合成数据集) */
  lifeCycles?: LifeCycle[];
  /** 花朵与四季馆(可选) */
  regions?: Region[];
  flowers?: FlowerSpecies[];
  relations?: BeeFlowerRelation[];
  /** 蜂蜜工坊(可选) */
  honeyStages?: HoneyStage[];
  honeyVarieties?: HoneyVariety[];
  honeyNotes?: HoneyNote[];
}

export interface ContentValidationResult {
  errors: string[];
  warnings: string[];
  stats: {
    sources: number;
    organs: number;
    focusEntries: number;
    draftEntries: number;
    lifeCycleStages: number;
    flowers: number;
    relations: number;
    honeyEntries: number;
  };
}

export function collectDefaultDataset(): ContentDataset {
  return {
    sources: sourceRecords,
    // 器官条目去重(蜜蜂属两种共享同一组)
    organs: [...new Set(Object.values(speciesContent).flatMap((c) => c.organs))],
    // 每个物种的每个可展出职型各一份观察条目
    focusLists: Object.fromEntries(
      Object.entries(speciesContent).flatMap(([id, c]) =>
        speciesCastes[id as keyof typeof speciesCastes].map((caste) => [
          `${id}-${caste}`,
          c.focus(caste),
        ]),
      ),
    ),
    compareRows: Object.values(compareRowsBySpecies).flat(),
    species: Object.values(beeSpecies),
    lifeCycles: Object.values(lifeCycles),
    regions: Object.values(regions),
    flowers: Object.values(flowers),
    relations: beeFlowerRelations,
    honeyStages,
    honeyVarieties,
    honeyNotes,
  };
}

/**
 * 内容数据校验(前端方案 §11.1):
 * - Zod 结构校验
 * - id 唯一性与引用完整性(sourceIds 必须指向存在的来源)
 * - 每个职型的观察条目必须完整覆盖五个聚焦点
 * - releaseGate 打开时(正式发布):draft 内容直接算错误;
 *   ai-reviewed(对抗式审查通过)按项目现行策略可以发布(content-review/REVIEW-POLICY.md)
 */
export function validateContentData(
  dataset: ContentDataset,
  { releaseGate = false }: { releaseGate?: boolean } = {},
): ContentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let draftEntries = 0;

  // -- sources --
  const sourceIds = new Set<string>();
  for (const record of dataset.sources) {
    const parsed = sourceRecordSchema.safeParse(record);
    if (!parsed.success) {
      errors.push(
        `来源 ${record?.id ?? "<未知>"} 结构非法: ${parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
      continue;
    }
    if (sourceIds.has(record.id)) errors.push(`来源 id 重复: ${record.id}`);
    sourceIds.add(record.id);
  }

  const referencedSourceIds = new Set<string>();
  const checkSourceRefs = (owner: string, ids: string[]) => {
    for (const id of ids) {
      referencedSourceIds.add(id);
      if (!sourceIds.has(id)) {
        errors.push(`${owner} 引用了不存在的来源: ${id}`);
      }
    }
  };
  const checkReviewStatus = (owner: string, status: string) => {
    if (status === "draft") {
      draftEntries += 1;
      const message = `${owner} 仍是草稿(draft),正式发布要求至少 ai-reviewed`;
      if (releaseGate) errors.push(message);
      else warnings.push(message);
    }
  };

  // -- organs --
  const organIds = new Set<string>();
  for (const organ of dataset.organs) {
    const parsed = organEntrySchema.safeParse(organ);
    if (!parsed.success) {
      errors.push(
        `器官条目 ${organ?.id ?? "<未知>"} 结构非法: ${parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
      continue;
    }
    if (organIds.has(organ.id)) errors.push(`器官条目 id 重复: ${organ.id}`);
    organIds.add(organ.id);
    checkSourceRefs(`器官条目 ${organ.id}`, organ.sourceIds);
    checkReviewStatus(`器官条目 ${organ.id}`, organ.reviewStatus);
    if (organ.reviewStatus !== "draft" && organ.lastReviewedOn === null) {
      errors.push(`器官条目 ${organ.id} 标记为已审校,但缺少 lastReviewedOn`);
    }
  }

  // -- focus entries --
  const REQUIRED_FOCUS = ["whole", "head", "wing", "abdomen", "leg"] as const;
  let focusEntries = 0;
  for (const [caste, list] of Object.entries(dataset.focusLists)) {
    const seen = new Set<string>();
    for (const item of list ?? []) {
      focusEntries += 1;
      const parsed = focusEntrySchema.safeParse(item);
      if (!parsed.success) {
        errors.push(
          `观察条目 ${caste}/${item?.id ?? "<未知>"} 结构非法: ${parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; ")}`,
        );
        continue;
      }
      if (seen.has(item.id)) errors.push(`观察条目 ${caste}/${item.id} 重复`);
      seen.add(item.id);
      checkSourceRefs(`观察条目 ${caste}/${item.id}`, item.sourceIds);
      checkReviewStatus(`观察条目 ${caste}/${item.id}`, item.reviewStatus);
    }
    for (const required of REQUIRED_FOCUS) {
      if (!seen.has(required)) {
        errors.push(`职型 ${caste} 缺少观察条目: ${required}`);
      }
    }
  }

  // -- compare rows (比较台对照行) --
  const rowIds = new Set<string>();
  for (const row of dataset.compareRows) {
    const parsed = compareRowSchema.safeParse(row);
    if (!parsed.success) {
      errors.push(
        `对照行 ${row?.id ?? "<未知>"} 结构非法: ${parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
      continue;
    }
    if (rowIds.has(row.id)) errors.push(`对照行 id 重复: ${row.id}`);
    rowIds.add(row.id);
    checkSourceRefs(`对照行 ${row.id}`, row.sourceIds);
    checkReviewStatus(`对照行 ${row.id}`, row.reviewStatus);
  }

  // -- species (蜂种实体) --
  const speciesIds = new Set<string>();
  for (const record of dataset.species) {
    const parsed = beeSpeciesSchema.safeParse(record);
    if (!parsed.success) {
      errors.push(
        `蜂种 ${record?.id ?? "<未知>"} 结构非法: ${parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
      continue;
    }
    if (speciesIds.has(record.id)) errors.push(`蜂种 id 重复: ${record.id}`);
    speciesIds.add(record.id);
    if (record.workerBodyLengthMm.min > record.workerBodyLengthMm.max) {
      errors.push(`蜂种 ${record.id} 体长范围颠倒`);
    }
    checkSourceRefs(`蜂种 ${record.id}`, record.sourceIds);
    checkReviewStatus(`蜂种 ${record.id}`, record.reviewStatus);
  }

  // -- life cycles (生命历程馆:阶段必须首尾衔接、覆盖整条时间轴,关联展品必须存在) --
  const cycleIds = new Set((dataset.lifeCycles ?? []).map((c) => c.id));
  const allOrganIds = new Set(dataset.organs.map((o) => o.id));
  const seenStageIds = new Set<string>();
  let lifeCycleStages = 0;
  for (const cycle of dataset.lifeCycles ?? []) {
    const parsed = lifeCycleSchema.safeParse(cycle);
    if (!parsed.success) {
      errors.push(
        `生命周期 ${cycle?.id ?? "<未知>"} 结构非法: ${parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
      continue;
    }
    checkSourceRefs(`生命周期 ${cycle.id}`, cycle.sourceIds);
    checkReviewStatus(`生命周期 ${cycle.id}`, cycle.reviewStatus);
    if (!speciesIds.has(cycle.speciesId)) {
      errors.push(`生命周期 ${cycle.id} 指向不存在的蜂种: ${cycle.speciesId}`);
    }
    if (cycle.unit === "month" && cycle.startMonth === undefined) {
      errors.push(`生命周期 ${cycle.id} 以月为单位但缺少 startMonth`);
    }
    let cursor = cycle.total.from;
    for (const stage of cycle.stages) {
      lifeCycleStages += 1;
      if (seenStageIds.has(stage.id)) errors.push(`阶段 id 重复: ${stage.id}`);
      seenStageIds.add(stage.id);
      if (Math.abs(stage.span.from - cursor) > 1e-6) {
        errors.push(`生命周期 ${cycle.id} 阶段 ${stage.id} 起点 ${stage.span.from} 与前一阶段终点 ${cursor} 不衔接`);
      }
      if (stage.span.to <= stage.span.from) errors.push(`阶段 ${stage.id} 区间颠倒`);
      cursor = stage.span.to;
      checkSourceRefs(`阶段 ${stage.id}`, stage.sourceIds);
      checkReviewStatus(`阶段 ${stage.id}`, stage.reviewStatus);
      for (const rel of stage.related) {
        const exists =
          rel.kind === "organ" ? allOrganIds.has(rel.id)
          : rel.kind === "species" || rel.kind === "compare" ? speciesIds.has(rel.id)
          : rel.kind === "focus" ? (REQUIRED_FOCUS as readonly string[]).includes(rel.id)
          : cycleIds.has(rel.id);
        if (!exists) errors.push(`阶段 ${stage.id} 关联了不存在的展品: ${rel.kind}/${rel.id}`);
      }
    }
    if (Math.abs(cursor - cycle.total.to) > 1e-6) {
      errors.push(`生命周期 ${cycle.id} 的阶段止于 ${cursor},未覆盖到时间轴终点 ${cycle.total.to}`);
    }
    for (const branch of cycle.branches) {
      checkSourceRefs(`分支 ${branch.id}`, branch.sourceIds);
      checkReviewStatus(`分支 ${branch.id}`, branch.reviewStatus);
    }
  }

  // -- regions / flowers / relations (花朵与四季馆) --
  const regionIds = new Set<string>();
  for (const region of dataset.regions ?? []) {
    const parsed = regionSchema.safeParse(region);
    if (!parsed.success) {
      errors.push(`地域 ${region?.id ?? "<未知>"} 结构非法: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      continue;
    }
    if (regionIds.has(region.id)) errors.push(`地域 id 重复: ${region.id}`);
    regionIds.add(region.id);
    checkSourceRefs(`地域 ${region.id}`, region.sourceIds);
    checkReviewStatus(`地域 ${region.id}`, region.reviewStatus);
  }
  const flowerIds = new Set<string>();
  const flowerById = new Map<string, FlowerSpecies>();
  const FLOWER_ENTRIES = ["corolla", "stamen", "inflorescence"] as const;
  for (const flower of dataset.flowers ?? []) {
    const parsed = flowerSpeciesSchema.safeParse(flower);
    if (!parsed.success) {
      errors.push(`花朵 ${flower?.id ?? "<未知>"} 结构非法: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      continue;
    }
    if (flowerIds.has(flower.id)) errors.push(`花朵 id 重复: ${flower.id}`);
    flowerIds.add(flower.id);
    flowerById.set(flower.id, flower);
    checkSourceRefs(`花朵 ${flower.id}`, flower.sourceIds);
    checkReviewStatus(`花朵 ${flower.id}`, flower.reviewStatus);
    if (flower.corollaDepthMm && flower.corollaDepthMm.min > flower.corollaDepthMm.max) {
      errors.push(`花朵 ${flower.id} 花冠深度范围颠倒`);
    }
    for (const regionId of Object.keys(flower.bloom)) {
      if (!regionIds.has(regionId)) errors.push(`花朵 ${flower.id} 的花期指向不存在的地域: ${regionId}`);
    }
    const entryIds = new Set(flower.entries.map((e) => e.id));
    for (const required of FLOWER_ENTRIES) {
      if (!entryIds.has(required)) errors.push(`花朵 ${flower.id} 缺少观察条目: ${required}`);
    }
    for (const entry of flower.entries) {
      checkSourceRefs(`花朵观察条目 ${flower.id}/${entry.id}`, entry.sourceIds);
      checkReviewStatus(`花朵观察条目 ${flower.id}/${entry.id}`, entry.reviewStatus);
    }
  }
  const relationIds = new Set<string>();
  const regionById = new Map((dataset.regions ?? []).map((r) => [r.id, r]));
  for (const relation of dataset.relations ?? []) {
    const parsed = beeFlowerRelationSchema.safeParse(relation);
    if (!parsed.success) {
      errors.push(`关系 ${relation?.id ?? "<未知>"} 结构非法: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      continue;
    }
    if (relationIds.has(relation.id)) errors.push(`关系 id 重复: ${relation.id}`);
    relationIds.add(relation.id);
    checkSourceRefs(`关系 ${relation.id}`, relation.sourceIds);
    checkReviewStatus(`关系 ${relation.id}`, relation.reviewStatus);
    if (!speciesIds.has(relation.beeId)) errors.push(`关系 ${relation.id} 指向不存在的蜂种: ${relation.beeId}`);
    if (!flowerIds.has(relation.flowerId)) errors.push(`关系 ${relation.id} 指向不存在的花朵: ${relation.flowerId}`);
    if (!regionIds.has(relation.regionId)) errors.push(`关系 ${relation.id} 指向不存在的地域: ${relation.regionId}`);
    // 关系的季节必须落在该花在该地域的花期内(季节月份口径取自地域)
    const flower = flowerById.get(relation.flowerId);
    const region = regionById.get(relation.regionId);
    const bloom = flower?.bloom[relation.regionId];
    const seasonRange = region && (relation.season === "spring" || relation.season === "summer") ? region.seasons[relation.season] : undefined;
    if (flower && region && !bloom) {
      errors.push(`关系 ${relation.id}:花朵 ${flower.id} 在地域 ${region.id} 没有花期记录`);
    } else if (bloom && seasonRange) {
      const months = [];
      for (let m = 1; m <= 12; m += 1) if (monthInRange(m, seasonRange) && monthInRange(m, bloom)) months.push(m);
      if (months.length === 0) {
        errors.push(`关系 ${relation.id}:${relation.season} 与花朵在该地域的花期(${bloom.from}–${bloom.to} 月)不重叠`);
      }
    }
    if (relation.evidence === "editorial" && !/编辑|整理/.test(relation.note)) {
      errors.push(`关系 ${relation.id} 为编辑整理级证据,说明里必须写明"编辑整理"`);
    }
  }

  // -- honey workshop (蜂蜜工坊:旅程站点 / 单花蜜 / 纠偏卡) --
  const checkHoneyRelated = (owner: string, related: { kind: string; id: string }[]) => {
    for (const rel of related) {
      const exists =
        rel.kind === "organ" ? allOrganIds.has(rel.id)
        : rel.kind === "species" || rel.kind === "compare" ? speciesIds.has(rel.id)
        : rel.kind === "focus" ? (REQUIRED_FOCUS as readonly string[]).includes(rel.id)
        : cycleIds.has(rel.id);
      if (!exists) errors.push(`${owner} 关联了不存在的展品: ${rel.kind}/${rel.id}`);
    }
  };
  const honeyStageIds = new Set<string>();
  const honeyStageIndexes = new Set<string>();
  let honeyEntries = 0;
  for (const stage of dataset.honeyStages ?? []) {
    honeyEntries += 1;
    const parsed = honeyStageSchema.safeParse(stage);
    if (!parsed.success) {
      errors.push(`蜂蜜站点 ${stage?.id ?? "<未知>"} 结构非法: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      continue;
    }
    if (honeyStageIds.has(stage.id)) errors.push(`蜂蜜站点 id 重复: ${stage.id}`);
    honeyStageIds.add(stage.id);
    if (honeyStageIndexes.has(stage.index)) errors.push(`蜂蜜站点序号重复: ${stage.index}`);
    honeyStageIndexes.add(stage.index);
    checkSourceRefs(`蜂蜜站点 ${stage.id}`, stage.sourceIds);
    checkReviewStatus(`蜂蜜站点 ${stage.id}`, stage.reviewStatus);
    checkHoneyRelated(`蜂蜜站点 ${stage.id}`, stage.related);
  }
  // 站点序号必须从 01 起连续(旅程线性走)
  for (let i = 1; i <= (dataset.honeyStages ?? []).length; i += 1) {
    const expected = String(i).padStart(2, "0");
    if (!honeyStageIndexes.has(expected)) errors.push(`蜂蜜旅程缺少第 ${expected} 站`);
  }
  const honeyVarietyIds = new Set<string>();
  const honeyVarietyFlowerIds = new Set<string>();
  for (const variety of dataset.honeyVarieties ?? []) {
    honeyEntries += 1;
    const parsed = honeyVarietySchema.safeParse(variety);
    if (!parsed.success) {
      errors.push(`单花蜜 ${variety?.id ?? "<未知>"} 结构非法: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      continue;
    }
    if (honeyVarietyIds.has(variety.id)) errors.push(`单花蜜 id 重复: ${variety.id}`);
    honeyVarietyIds.add(variety.id);
    if (!flowerIds.has(variety.flowerId)) {
      errors.push(`单花蜜 ${variety.id} 指向不存在的花朵: ${variety.flowerId}`);
    }
    if (honeyVarietyFlowerIds.has(variety.flowerId)) {
      errors.push(`单花蜜与花朵必须一一对应,花朵重复: ${variety.flowerId}`);
    }
    honeyVarietyFlowerIds.add(variety.flowerId);
    checkSourceRefs(`单花蜜 ${variety.id}`, variety.sourceIds);
    checkReviewStatus(`单花蜜 ${variety.id}`, variety.reviewStatus);
  }
  const honeyNoteIds = new Set<string>();
  for (const note of dataset.honeyNotes ?? []) {
    honeyEntries += 1;
    const parsed = honeyNoteSchema.safeParse(note);
    if (!parsed.success) {
      errors.push(`蜂蜜纠偏卡 ${note?.id ?? "<未知>"} 结构非法: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      continue;
    }
    if (honeyNoteIds.has(note.id)) errors.push(`蜂蜜纠偏卡 id 重复: ${note.id}`);
    honeyNoteIds.add(note.id);
    checkSourceRefs(`蜂蜜纠偏卡 ${note.id}`, note.sourceIds);
    checkReviewStatus(`蜂蜜纠偏卡 ${note.id}`, note.reviewStatus);
    checkHoneyRelated(`蜂蜜纠偏卡 ${note.id}`, note.related);
  }

  // -- unreferenced sources (提示,不算错误) --
  for (const id of sourceIds) {
    if (!referencedSourceIds.has(id)) {
      warnings.push(`来源 ${id} 未被任何条目引用`);
    }
  }

  return {
    errors,
    warnings,
    stats: {
      sources: dataset.sources.length,
      organs: dataset.organs.length,
      focusEntries,
      draftEntries,
      lifeCycleStages,
      flowers: (dataset.flowers ?? []).length,
      relations: (dataset.relations ?? []).length,
      honeyEntries,
    },
  };
}

export function validateContent(
  options?: { releaseGate?: boolean },
): ContentValidationResult {
  return validateContentData(collectDefaultDataset(), options);
}
