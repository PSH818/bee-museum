/* eslint-disable */
// 合并两轮审查结论:子集轮(next)覆盖基础轮(base)中同 key 的裁决,产出 *-rfinal.json
//   node scripts/merge-review-rounds.cjs --base=3 --next=4
// 之后运行:node scripts/apply-adversarial-review.cjs --round=final
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "content-review", "adversarial");
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).split("=")[1];
const base = arg("base", "3");
const next = arg("next", "4");

for (const name of ["fact-check", "refutation", "compliance"]) {
  const baseData = JSON.parse(fs.readFileSync(path.join(DIR, `${name}-r${base}.json`), "utf8"));
  const nextPath = path.join(DIR, `${name}-r${next}.json`);
  const nextData = fs.existsSync(nextPath) ? JSON.parse(fs.readFileSync(nextPath, "utf8")) : { verdicts: [] };
  const override = new Map(nextData.verdicts.map((v) => [v.key, v]));
  const merged = baseData.verdicts.map((v) => override.get(v.key) || v);
  // 子集轮可能包含基础轮没有的 key(理论上不会),补进去
  for (const v of nextData.verdicts) if (!baseData.verdicts.some((b) => b.key === v.key)) merged.push(v);
  const out = { lens: name, round: "final", mergedFrom: [Number(base), Number(next)], reviewedAt: new Date().toISOString(), verdicts: merged };
  fs.writeFileSync(path.join(DIR, `${name}-rfinal.json`), JSON.stringify(out, null, 2), "utf8");
  const c = {};
  for (const v of merged) c[v.verdict] = (c[v.verdict] || 0) + 1;
  console.log(`${name}: merged ${merged.length} (${override.size} overridden)`, JSON.stringify(c));
}

// ---- 合并审查快照:子集轮条目覆盖基础轮 ----
{
  const baseDump = JSON.parse(fs.readFileSync(path.join(DIR, `content-dump-r${base}.json`), "utf8"));
  const nextDumpPath = path.join(DIR, `content-dump-r${next}.json`);
  const nextDump = fs.existsSync(nextDumpPath) ? JSON.parse(fs.readFileSync(nextDumpPath, "utf8")) : { entries: [] };
  const override = new Map(nextDump.entries.map((e) => [e.key, e]));
  const entries = baseDump.entries.map((e) => override.get(e.key) || e);
  // 子集轮新增的 key(如新展厅内容)追加到快照末尾
  for (const e of nextDump.entries) if (!baseDump.entries.some((b) => b.key === e.key)) entries.push(e);
  fs.writeFileSync(path.join(DIR, "content-dump-rfinal.json"), JSON.stringify({ ...baseDump, entries, mergedFrom: [Number(base), Number(next)] }, null, 2), "utf8");
  console.log("content-dump-rfinal.json written (" + override.size + " entries from round " + next + ")");
}
