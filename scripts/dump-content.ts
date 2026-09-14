import { writeFileSync } from "node:fs";
import { collectDefaultDataset } from "../src/data/validate";

// 导出全部内容数据,供对抗式审查员读取:npx vite-node scripts/dump-content.ts
const dataset = collectDefaultDataset();
const entries: Array<Record<string, unknown>> = [];
for (const [listKey, list] of Object.entries(dataset.focusLists)) {
  for (const item of list) {
    entries.push({ key: `focus:${listKey}/${item.id}`, kind: "focus", ...item });
  }
}
for (const organ of dataset.organs) entries.push({ key: `organ:${organ.id}`, kind: "organ", ...organ });
for (const row of dataset.compareRows) entries.push({ key: `compare:${row.id}`, kind: "compare", ...row });
for (const sp of dataset.species) entries.push({ key: `species:${sp.id}`, kind: "species", ...sp });
for (const cycle of dataset.lifeCycles ?? []) {
  const { stages, branches, ...meta } = cycle;
  entries.push({ key: `cycle:${cycle.id}`, kind: "cycle", ...meta });
  for (const stage of stages) {
    entries.push({ key: `stage:${cycle.id}/${stage.id}`, kind: "stage", story: cycle.title, unit: cycle.unit, ...stage });
  }
  for (const branch of branches) {
    entries.push({ key: `branch:${cycle.id}/${branch.id}`, kind: "branch", story: cycle.title, ...branch });
  }
}
for (const region of dataset.regions ?? []) entries.push({ key: `region:${region.id}`, kind: "region", ...region });
for (const flower of dataset.flowers ?? []) {
  const { entries: flowerEntries, ...meta } = flower;
  entries.push({ key: `flower:${flower.id}`, kind: "flower", ...meta });
  for (const entry of flowerEntries) {
    entries.push({ key: `flower-entry:${flower.id}/${entry.id}`, kind: "flower-entry", flower: flower.name, ...entry });
  }
}
for (const relation of dataset.relations ?? []) entries.push({ key: `relation:${relation.id}`, kind: "relation", ...relation });
for (const stage of dataset.honeyStages ?? []) entries.push({ key: `honey-stage:${stage.id}`, kind: "honey-stage", ...stage });
for (const variety of dataset.honeyVarieties ?? []) entries.push({ key: `honey-variety:${variety.id}`, kind: "honey-variety", ...variety });
for (const note of dataset.honeyNotes ?? []) entries.push({ key: `honey-note:${note.id}`, kind: "honey-note", ...note });
const out = { generatedAt: new Date().toISOString(), sources: dataset.sources, entries };
writeFileSync("content-review/adversarial/content-dump.json", JSON.stringify(out, null, 2), "utf8");
console.log("dumped", entries.length, "entries,", dataset.sources.length, "sources");
