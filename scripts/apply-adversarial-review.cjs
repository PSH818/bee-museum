/* eslint-disable */
// 对抗式审查裁决与落地:
//   node scripts/apply-adversarial-review.cjs [--dry]
// 读取 content-review/adversarial/{fact-check,refutation,compliance}.json,
// 三方全部 pass 的条目升级为 ai-reviewed(器官条目同时写 lastReviewedOn),
// 其余保留 draft 并汇总问题;生成 content-review/adversarial/REPORT.md。
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "content-review", "adversarial");
const DRY = process.argv.includes("--dry");
const ROUND = (process.argv.find((a) => a.startsWith("--round=")) || "--round=").slice(8);
const SUFFIX = ROUND ? `-r${ROUND}` : "";
const TODAY = new Date().toISOString().slice(0, 10);

const dump = JSON.parse(fs.readFileSync(path.join(DIR, "content-dump.json"), "utf8"));
const lenses = ["fact-check", "refutation", "compliance"].map((name) => {
  const file = path.join(DIR, `${name}${SUFFIX}.json`);
  if (!fs.existsSync(file)) {
    console.error(`缺少审查结论文件: ${file}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return { name, byKey: new Map(data.verdicts.map((v) => [v.key, v])) };
});

// ---- 裁决 ----
const decisions = [];
for (const entry of dump.entries) {
  const votes = lenses.map((lens) => {
    const v = lens.byKey.get(entry.key);
    return { lens: lens.name, verdict: v ? v.verdict : "missing", issues: v ? v.issues || [] : [] };
  });
  const allPass = votes.every((v) => v.verdict === "pass");
  decisions.push({ entry, votes, final: allPass ? "ai-reviewed" : "draft" });
}

// ---- 定位并改写数据文件 ----
const FILE_BY_LIST = (listKey) => {
  if (listKey.startsWith("apis-mellifera")) return "src/data/bees/western-honeybee-worker.ts";
  if (listKey.startsWith("apis-cerana")) return "src/data/bees/eastern-honeybee.ts";
  if (listKey.startsWith("bombus")) return "src/data/bees/bombus-terrestris.ts";
  if (listKey.startsWith("osmia")) return "src/data/bees/osmia-cornifrons.ts";
  if (listKey.startsWith("megachile")) return "src/data/bees/megachile-rotundata.ts";
  if (listKey.startsWith("xylocopa")) return "src/data/bees/xylocopa-violacea.ts";
  return null;
};
const DATA_FILES = [
  "src/data/bees/western-honeybee-worker.ts",
  "src/data/bees/western-honeybee-worker-organs.ts",
  "src/data/bees/western-honeybee-compare.ts",
  "src/data/bees/eastern-honeybee.ts",
  "src/data/bees/bombus-terrestris.ts",
  "src/data/bees/osmia-cornifrons.ts",
  "src/data/bees/megachile-rotundata.ts",
  "src/data/bees/xylocopa-violacea.ts",
  "src/data/bees/species-index.ts",
  "src/data/life-cycles/apis-mellifera-worker.ts",
  "src/data/life-cycles/osmia-cornifrons.ts",
  "src/data/regions.ts",
  "src/data/relations/bee-flower.ts",
  "src/data/honey/stages.ts",
  "src/data/honey/varieties.ts",
  "src/data/honey/notes.ts",
  ...fs.readdirSync(path.join(ROOT, "src/data/flowers")).filter((f) => f.endsWith(".ts") && f !== "index.ts").map((f) => "src/data/flowers/" + f),
].filter((f) => fs.existsSync(path.join(ROOT, f)));
const sources = new Map(DATA_FILES.map((f) => [f, fs.readFileSync(path.join(ROOT, f), "utf8")]));
const edits = new Map(DATA_FILES.map((f) => [f, 0]));

function upgradeAfter(file, locator, withDate) {
  let text = sources.get(file);
  // 定位串来自审查快照(未转义);源码里 title 内的英文引号是 \" 形式,找不到时按转义形式重试
  let at = text.indexOf(locator);
  if (at < 0) {
    const m = locator.match(/^(\w+: ")(.*)(")$/);
    if (m) at = text.indexOf(m[1] + m[2].replace(/"/g, '\\"') + m[3]);
  }
  if (at < 0) return false;
  const statusAt = text.indexOf('reviewStatus: "', at);
  if (statusAt < 0) return false;
  // 已是 ai-reviewed / reviewed / verified:视为已通过,不算定位失败
  if (!text.startsWith('reviewStatus: "draft"', statusAt)) return "already";
  text = text.slice(0, statusAt) + 'reviewStatus: "ai-reviewed"' + text.slice(statusAt + 'reviewStatus: "draft"'.length);
  if (withDate) {
    const dateAt = text.indexOf("lastReviewedOn: null", statusAt);
    if (dateAt >= 0) text = text.slice(0, dateAt) + `lastReviewedOn: "${TODAY}"` + text.slice(dateAt + "lastReviewedOn: null".length);
  }
  sources.set(file, text);
  edits.set(file, edits.get(file) + 1);
  return true;
}

// 共享的观察条目(头/翅/腹)在多个列表中出现:全部列表 pass 才能升级(按 title 分组)
const focusGroups = new Map();
for (const d of decisions.filter((d) => d.entry.kind === "focus")) {
  const [, rest] = d.entry.key.split(":");
  const listKey = rest.split("/")[0];
  const file = FILE_BY_LIST(listKey);
  const shared = ["head", "wing", "abdomen"].includes(d.entry.id);
  // 蜜蜂属两种共享 western 文件里的头/翅/腹;其他物种各自文件
  const targetFile = shared && listKey.startsWith("apis-") ? "src/data/bees/western-honeybee-worker.ts" : file;
  const groupKey = `${targetFile}::${d.entry.title}`;
  if (!focusGroups.has(groupKey)) focusGroups.set(groupKey, { file: targetFile, title: d.entry.title, decisions: [] });
  focusGroups.get(groupKey).decisions.push(d);
}
let upgraded = 0, already = 0, kept = 0, notFound = [];
for (const group of focusGroups.values()) {
  const pass = group.decisions.every((d) => d.final === "ai-reviewed");
  if (!pass) { kept += group.decisions.length; continue; }
  const ok = DRY || upgradeAfter(group.file, `title: "${group.title}"`, false);
  if (ok === "already") already += group.decisions.length; else if (ok) upgraded += group.decisions.length; else notFound.push(group.title);
}
for (const d of decisions.filter((d) => d.entry.kind !== "focus")) {
  if (d.final !== "ai-reviewed") { kept += 1; continue; }
  const id = d.entry.id;
  // 花朵观察条目 id(corolla/stamen/inflorescence)在各花文件里重名:按键里的花 id 选文件
  const flowerOwner = d.entry.key.startsWith("flower-entry:") ? d.entry.key.slice("flower-entry:".length).split("/")[0] : null;
  const file = flowerOwner
    ? DATA_FILES.find((f) => sources.get(f).includes(`id: "${flowerOwner}"`))
    : DATA_FILES.find((f) => sources.get(f).includes(`id: "${id}"`));
  if (!file) { notFound.push(id); continue; }
  const ok = DRY || upgradeAfter(file, `id: "${id}"`, d.entry.kind === "organ");
  if (ok === "already") already += 1; else if (ok) upgraded += 1; else notFound.push(id);
}
if (!DRY) for (const [f, text] of sources) fs.writeFileSync(path.join(ROOT, f), text, "utf8");

// ---- 报告 ----
const lines = [];
lines.push(`# 对抗式审查报告`, ``, `> 生成:${new Date().toISOString()}  ${DRY ? "(dry run,未写回)" : ""}`, ``);
lines.push(`| 结果 | 条目数 |`, `|---|---|`);
lines.push(`| 三方全 pass → ai-reviewed | ${decisions.filter((d) => d.final === "ai-reviewed").length} |`);
lines.push(`| 保留 draft(任一 fail/uncertain) | ${decisions.filter((d) => d.final !== "ai-reviewed").length} |`, ``);
for (const lens of lenses) {
  const c = { pass: 0, fail: 0, uncertain: 0, missing: 0 };
  for (const e of dump.entries) { const v = lens.byKey.get(e.key); c[v ? v.verdict : "missing"] = (c[v ? v.verdict : "missing"] || 0) + 1; }
  lines.push(`- ${lens.name}:pass ${c.pass} / fail ${c.fail} / uncertain ${c.uncertain}${c.missing ? ` / 缺失 ${c.missing}` : ""}`);
}
lines.push(``, `## 未通过条目与问题`, ``);
for (const d of decisions.filter((d) => d.final !== "ai-reviewed")) {
  lines.push(`### ${d.entry.key}`);
  for (const v of d.votes.filter((v) => v.verdict !== "pass")) {
    lines.push(`- **${v.lens}** → ${v.verdict}`);
    for (const issue of v.issues) {
      lines.push(`  - 断言:${issue.claim || "-"}`);
      lines.push(`    问题:${issue.problem || "-"}`);
      if (issue.evidence) lines.push(`    依据:${issue.evidence}`);
      if (issue.fix) lines.push(`    建议:${issue.fix}`);
    }
  }
  lines.push(``);
}
lines.push(`## 通过条目(可选润色建议)`, ``);
for (const d of decisions.filter((d) => d.final === "ai-reviewed")) {
  const optional = d.votes.flatMap((v) => v.issues || []);
  if (optional.length) lines.push(`- ${d.entry.key}:` + optional.map((i) => i.fix || i.problem).join(";"));
}
if (notFound.length) lines.push(``, `## 定位失败(需人工改写状态)`, ``, ...notFound.map((n) => `- ${n}`));
fs.writeFileSync(path.join(DIR, "REPORT.md"), lines.join("\n"), "utf8");

console.log(`升级 ai-reviewed: ${upgraded} 条;此前已是 ai-reviewed: ${already} 条;保留 draft: ${kept} 条;定位失败: ${notFound.length}${DRY ? "(dry)" : ""}`);
for (const [f, n] of edits) if (n) console.log(`  ${f}: ${n} 处`);
