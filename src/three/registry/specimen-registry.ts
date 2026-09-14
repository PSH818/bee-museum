import type { BeeBuildOptions, BeeCaste } from "../bees/types";
import type { WesternHoneyBeeSpecimen } from "../bees/species/apis-mellifera-worker";

// 两种蜜蜂:三职型;其余蜂种:仅 worker 通道(独居蜂界面显示为"雌蜂")
const THREE_CASTE_SPECIES = ["apis-mellifera", "apis-cerana"] as const;
type ThreeCasteSpecies = (typeof THREE_CASTE_SPECIES)[number];
const WORKER_ONLY_SPECIES = [
  "bombus-terrestris",
  "osmia-cornifrons",
  "megachile-rotundata",
  "xylocopa-violacea",
] as const;
type WorkerOnlySpecies = (typeof WORKER_ONLY_SPECIES)[number];

export type SpecimenId =
  | `${ThreeCasteSpecies}-${BeeCaste}`
  | `${ThreeCasteSpecies}-${BeeCaste}-hero`
  | `${WorkerOnlySpecies}-worker`
  | `${WorkerOnlySpecies}-worker-hero`;

export interface SpecimenRegistryEntry {
  id: SpecimenId;
  scientificName: string;
  variant: BeeCaste;
  load: (
    options?: Partial<BeeBuildOptions>,
  ) => Promise<WesternHoneyBeeSpecimen>;
}

const SCIENTIFIC_NAMES: Record<string, string> = {
  "apis-mellifera": "Apis mellifera",
  "apis-cerana": "Apis cerana",
  "bombus-terrestris": "Bombus terrestris",
  "osmia-cornifrons": "Osmia cornifrons",
  "megachile-rotundata": "Megachile rotundata",
  "xylocopa-violacea": "Xylocopa violacea",
};

/** 程序化兜底:蜜蜂属参数化构建器(非蜜蜂属物种形态近似,仅 GLB 加载失败时可见) */
function proceduralEntry(species: string, caste: BeeCaste): SpecimenRegistryEntry {
  return {
    id: `${species}-${caste}` as SpecimenId,
    scientificName: SCIENTIFIC_NAMES[species],
    variant: caste,
    load: async (options) => {
      const module = await import("../bees/species/apis-mellifera-worker");
      return module.createWesternHoneyBee({ ...options, caste });
    },
  };
}

/** 烘焙精模(混合管线 §7.5):每个物种/职型一份 GLB */
function heroEntry(species: string, caste: BeeCaste): SpecimenRegistryEntry {
  return {
    id: `${species}-${caste}-hero` as SpecimenId,
    scientificName: SCIENTIFIC_NAMES[species],
    variant: caste,
    load: async (options) => {
      const module = await import(
        "../bees/species/apis-mellifera-worker-hero"
      );
      return module.createWesternHoneyBeeHero({ ...options, caste }, species);
    },
  };
}

const entries: SpecimenRegistryEntry[] = [];
for (const species of THREE_CASTE_SPECIES) {
  for (const caste of ["worker", "queen", "drone"] as const) {
    entries.push(proceduralEntry(species, caste));
    entries.push(heroEntry(species, caste));
  }
}
for (const species of WORKER_ONLY_SPECIES) {
  entries.push(proceduralEntry(species, "worker"));
  entries.push(heroEntry(species, "worker"));
}

export const specimenRegistry = Object.fromEntries(
  entries.map((entry) => [entry.id, entry]),
) as Record<SpecimenId, SpecimenRegistryEntry>;

export async function loadSpecimen(
  id: SpecimenId,
  options?: Partial<BeeBuildOptions>,
): Promise<WesternHoneyBeeSpecimen> {
  const entry = specimenRegistry[id];
  if (!entry) throw new Error(`unknown specimen '${id}'`);
  return entry.load(options);
}
