/* eslint-disable */
// 计算下一轮需要复审的条目子集并导出:
//   node scripts/review-round-subset.cjs --prev=3 --next=4
// 子集 = 上一轮未三方全 pass 的条目 ∪ 上一轮审查后文本有改动的条目
// 输出 content-review/adversarial/content-dump-r{next}.json(仅子集 entries,全部 sources)
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "content-review", "adversarial");
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).split("=")[1];
const prev = arg("prev", "3");
const next = arg("next", String(Number(prev) + 1));

const current = JSON.parse(fs.readFileSync(path.join(DIR, "content-dump.json"), "utf8"));
const reviewed = JSON.parse(fs.readFileSync(path.join(DIR, `content-dump-r${prev}.json`), "utf8"));
const lenses = ["fact-check", "refutation", "compliance"].map((name) =>
  JSON.parse(fs.readFileSync(path.join(DIR, `${name}-r${prev}.json`), "utf8")),
);
const verdictOf = (lens, key) => (lens.verdicts.find((v) => v.key === key) || {}).verdict;

// 比对正文时忽略状态类字段(reviewStatus / lastReviewedOn 由裁决脚本改写,不算文本改动)
const textOf = (e) => { const { reviewStatus, lastReviewedOn, ...rest } = e; return JSON.stringify(rest); };
const reviewedByKey = new Map(reviewed.entries.map((e) => [e.key, textOf(e)]));
const subset = [];
const reasons = [];
for (const entry of current.entries) {
  const notAllPass = lenses.some((lens) => verdictOf(lens, entry.key) !== "pass");
  const changed = reviewedByKey.get(entry.key) !== textOf(entry);
  if (notAllPass || changed) {
    subset.push(entry);
    reasons.push(`${entry.key}: ${[notAllPass && "未全过", changed && "文本已改"].filter(Boolean).join(" + ")}`);
  }
}
const out = { generatedAt: new Date().toISOString(), round: Number(next), baseRound: Number(prev), sources: current.sources, entries: subset };
fs.writeFileSync(path.join(DIR, `content-dump-r${next}.json`), JSON.stringify(out, null, 2), "utf8");
fs.writeFileSync(path.join(DIR, `_subset-r${next}.txt`), reasons.join("\n"), "utf8");
console.log(`round ${next} subset: ${subset.length}/${current.entries.length} entries`);
