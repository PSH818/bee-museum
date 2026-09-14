import { Link } from "react-router";
import { collectDefaultDataset } from "../data/validate";
import { REVIEW_STATUS_LABEL, type ReviewStatus } from "../data/schemas/content";
import { sourceRecords } from "../data/sources/records";
import {
  BEE_SPECIES_IDS,
  beeSpecies,
  casteLabelOverrides,
  speciesCastes,
} from "../data/bees/species-index";
import { speciesContent } from "../data/bees/species-content";
import { compareRowsBySpecies } from "../data/bees/western-honeybee-compare";
import { westernHoneyBeeCastes } from "../data/bees/western-honeybee-worker";
import { lifeCycles } from "../data/life-cycles";
import { flowers } from "../data/flowers";
import { regions } from "../data/regions";
import { beeFlowerRelations } from "../data/relations/bee-flower";
import { honeyNotes, honeyStages, honeyVarieties } from "../data/honey";
import { FLOWER_FORM_LABEL, SEASON_LABEL } from "../data/schemas/content";
import { SiteFooter, SiteHeader, SkipLink, usePageTitle } from "../ui/SiteChrome";

const STATUS_ORDER: ReviewStatus[] = ["draft", "ai-reviewed", "reviewed", "verified"];
const STATUS_EXPLAIN: Record<ReviewStatus, string> = {
  draft: "AI 起草,尚未经过任何核对。正式发布门禁不允许出现。",
  "ai-reviewed":
    "通过 AI 对抗式审查:事实核查员、反驳者、合规审查员三方互不通信、独立裁决,全部通过才算过。未经专家核校。",
  reviewed: "有署名的人工审校人逐条核对过来源与表述。",
  verified: "经两个以上独立来源交叉核验。",
};

/** 一组条目的整体状态 = 其中最低的那个 */
function lowest(statuses: ReviewStatus[]): ReviewStatus {
  return statuses.reduce<ReviewStatus>(
    (min, s) => (STATUS_ORDER.indexOf(s) < STATUS_ORDER.indexOf(min) ? s : min),
    "verified",
  );
}

function StatusPill({ status }: { status: ReviewStatus }) {
  return <span className={`review-badge review-${status}`}>{REVIEW_STATUS_LABEL[status]}</span>;
}

// 对抗式审查执行记录摘要(详见仓库 content-review/REVIEW-WORKSHEET.md)
const REVIEW_ROUNDS = [
  { round: "1", scope: "全部 89 条", fact: "37 / 1 / 51", refute: "58 / 3 / 28", comp: "65 / 23 / 1", fixes: "112 处" },
  { round: "2", scope: "全部 89 条", fact: "61 / 0 / 28", refute: "86 / 0 / 3", comp: "79 / 9 / 1", fixes: "44 处" },
  { round: "3", scope: "全部 89 条", fact: "73 / 0 / 16", refute: "82 / 0 / 7", comp: "89 / 0 / 0", fixes: "37 处" },
  { round: "4–10", scope: "未全过 ∪ 文本有改动的子集(30 → 1 条)", fact: "逐轮收敛", refute: "逐轮收敛", comp: "逐轮收敛", fixes: "37 处" },
  { round: "11–13", scope: "采纳审查员可选润色后的复审(5 → 1 条)", fact: "最终 89 / 0 / 0", refute: "最终 89 / 0 / 0", comp: "最终 89 / 0 / 0", fixes: "16 处" },
  { round: "14", scope: "生命历程馆新增 21 条", fact: "18 / 1 / 2", refute: "18 / 1 / 2", comp: "17 / 2 / 2", fixes: "11 处" },
  { round: "15–22", scope: "生命历程馆子集复审(9 → 1 条)", fact: "最终 110 / 0 / 0", refute: "最终 110 / 0 / 0", comp: "最终 110 / 0 / 0", fixes: "18 处" },
  { round: "23", scope: "花朵与四季馆新增 60 条(3 地域 / 7 花 / 21 条目 / 29 关系)", fact: "34 / 2 / 24", refute: "42 / 7 / 11", comp: "38 / 18 / 4", fixes: "69 处 + 删 3 条弱关系" },
  { round: "24–26", scope: "修文复审子集(39 → 13 → 2 条)", fact: "最终 167 / 0 / 0", refute: "最终 167 / 0 / 0", comp: "最终 167 / 0 / 0", fixes: "17 处" },
  { round: "27", scope: "蜂蜜工坊新增 15 条(6 站点 / 7 单花蜜 / 2 纠偏卡)", fact: "9 / 0 / 6", refute: "9 / 0 / 6", comp: "9 / 0 / 6", fixes: "18 处" },
  { round: "28–29", scope: "修文复审子集(14 → 6 条,含花朵馆口径同步 3 条)", fact: "最终 182 / 0 / 0", refute: "最终 182 / 0 / 0", comp: "最终 182 / 0 / 0", fixes: "8 处" },
];

function Sources() {
  usePageTitle("来源与审校");
  const dataset = collectDefaultDataset();

  // 全部展出条目的状态统计
  const allStatuses: ReviewStatus[] = [
    ...Object.values(dataset.focusLists).flat().map((e) => e.reviewStatus),
    ...dataset.organs.map((e) => e.reviewStatus),
    ...dataset.compareRows.map((e) => e.reviewStatus),
    ...dataset.species.map((e) => e.reviewStatus),
    ...(dataset.lifeCycles ?? []).flatMap((c) => [
      c.reviewStatus,
      ...c.stages.map((s) => s.reviewStatus),
      ...c.branches.map((b) => b.reviewStatus),
    ]),
    ...(dataset.regions ?? []).map((r) => r.reviewStatus),
    ...(dataset.flowers ?? []).flatMap((f) => [f.reviewStatus, ...f.entries.map((e) => e.reviewStatus)]),
    ...(dataset.relations ?? []).map((r) => r.reviewStatus),
    ...(dataset.honeyStages ?? []).map((s) => s.reviewStatus),
    ...(dataset.honeyVarieties ?? []).map((v) => v.reviewStatus),
    ...(dataset.honeyNotes ?? []).map((n) => n.reviewStatus),
  ];
  const counts = Object.fromEntries(
    STATUS_ORDER.map((s) => [s, allStatuses.filter((x) => x === s).length]),
  ) as Record<ReviewStatus, number>;
  const lastReviewedOn = dataset.organs
    .map((o) => o.lastReviewedOn)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  return (
    <div className="site">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="doc">
        <header className="doc-head">
          <p className="kicker">
            <span /> ARCHIVE · SOURCES & REVIEW
          </p>
          <h1>来源与审校</h1>
          <p className="lede">
            这一页回答三个问题:馆里每句话的依据是什么、经过了怎样的审查、还有哪些没做到。
            {lastReviewedOn && <> 内容最后一次审查:{lastReviewedOn}。</>}
          </p>
        </header>

        <section aria-labelledby="status-title">
          <h2 id="status-title">审校状态口径</h2>
          <p>
            全馆共 {allStatuses.length} 条展出内容(观察条目、器官条目、对照表、蜂种卡、生命历程的故事/阶段/分支)。每条都带一个状态徽章,
            徽章含义如下;正式发布的门禁要求所有条目至少达到 <code>ai-reviewed</code>。
          </p>
          <table className="data-table" aria-label="审校状态说明与数量">
            <thead>
              <tr>
                <th>状态</th>
                <th>含义</th>
                <th className="num">条数</th>
              </tr>
            </thead>
            <tbody>
              {STATUS_ORDER.map((s) => (
                <tr key={s}>
                  <td>
                    <StatusPill status={s} />
                  </td>
                  <td>{STATUS_EXPLAIN[s]}</td>
                  <td className="num">{counts[s]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="entries-title">
          <h2 id="entries-title">各蜂种内容状态</h2>
          <div className="table-scroll">
            <table className="data-table" aria-label="各蜂种内容条目与状态">
              <thead>
                <tr>
                  <th>蜂种</th>
                  <th>展出形态</th>
                  <th className="num">观察条目</th>
                  <th className="num">器官条目</th>
                  <th className="num">对照行</th>
                  <th>整体状态</th>
                </tr>
              </thead>
              <tbody>
                {BEE_SPECIES_IDS.map((id) => {
                  const castes = speciesCastes[id];
                  const focus = castes.flatMap((c) => dataset.focusLists[`${id}-${c}`] ?? []);
                  const organs = speciesContent[id].organs;
                  const rows = compareRowsBySpecies[id] ?? [];
                  const status = lowest([
                    beeSpecies[id].reviewStatus,
                    ...focus.map((e) => e.reviewStatus),
                    ...organs.map((e) => e.reviewStatus),
                    ...rows.map((e) => e.reviewStatus),
                  ]);
                  return (
                    <tr key={id}>
                      <td>
                        <Link to={`/museum/bees/${id}`}>{beeSpecies[id].name}</Link>
                        <br />
                        <i className="latin-inline">{beeSpecies[id].scientificName}</i>
                      </td>
                      <td>
                        {castes
                          .map((c) => casteLabelOverrides[id]?.[c] ?? westernHoneyBeeCastes[c].name)
                          .join(" / ")}
                      </td>
                      <td className="num">{focus.length}</td>
                      <td className="num">{organs.length}</td>
                      <td className="num">{rows.length}</td>
                      <td>
                        <StatusPill status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="note">西方蜜蜂与东方蜜蜂共用一组蜜蜂属器官条目,因此器官条目数相同。</p>
        </section>

        <section aria-labelledby="cycles-title">
          <h2 id="cycles-title">生命历程馆内容状态</h2>
          <div className="table-scroll">
            <table className="data-table" aria-label="生命历程故事与状态">
              <thead>
                <tr>
                  <th>故事</th>
                  <th>时间轴</th>
                  <th className="num">阶段</th>
                  <th className="num">分支</th>
                  <th>整体状态</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(lifeCycles).map((cycle) => (
                  <tr key={cycle.id}>
                    <td>
                      <Link to={`/museum/life-cycle/${cycle.id}`}>{cycle.title}</Link>
                      <br />
                      <i className="latin-inline">{cycle.subtitle}</i>
                    </td>
                    <td>
                      {cycle.unit === "day"
                        ? `${cycle.total.from}–${cycle.total.to} 天`
                        : `${cycle.total.to} 个月(${cycle.startMonth} 月起)`}
                    </td>
                    <td className="num">{cycle.stages.length}</td>
                    <td className="num">{cycle.branches.length}</td>
                    <td>
                      <StatusPill
                        status={lowest([
                          cycle.reviewStatus,
                          ...cycle.stages.map((s) => s.reviewStatus),
                          ...cycle.branches.map((b) => b.reviewStatus),
                        ])}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


        <section aria-labelledby="flowers-title">
          <h2 id="flowers-title">花朵与四季馆内容状态</h2>
          <p className="muted">
            首期 7 种蜜源植物、3 个地域切片({Object.values(regions).map((r) => r.name).join(" / ")}),以及
            {beeFlowerRelations.length} 条"某蜂 × 某花 × 某地 × 某季"的关系。关系只收录有来源的记载;来源来自邻近地区或未点名到种的,标为"编辑整理"并在说明里写明。
          </p>
          <div className="table-scroll">
            <table className="data-table" aria-label="花朵与关系状态">
              <thead>
                <tr>
                  <th>花</th>
                  <th>花型</th>
                  <th>花期(按地域)</th>
                  <th className="num">观察条目</th>
                  <th className="num">蜂花关系</th>
                  <th>整体状态</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(flowers).map((flower) => {
                  const rels = beeFlowerRelations.filter((r) => r.flowerId === flower.id);
                  return (
                    <tr key={flower.id}>
                      <td>
                        {flower.name}
                        <br />
                        <i className="latin-inline">{flower.scientificName}</i>
                      </td>
                      <td>{FLOWER_FORM_LABEL[flower.form]}</td>
                      <td>
                        {Object.entries(flower.bloom).map(([regionId, range]) => (
                          <span key={regionId} className="bloom-chip">
                            {regions[regionId]?.name ?? regionId} {range.from}–{range.to} 月
                          </span>
                        ))}
                      </td>
                      <td className="num">{flower.entries.length}</td>
                      <td className="num">
                        {rels.length}
                        {rels.some((r) => r.evidence === "editorial") ? (
                          <>
                            <br />
                            <small className="muted">含编辑整理 {rels.filter((r) => r.evidence === "editorial").length}</small>
                          </>
                        ) : null}
                      </td>
                      <td>
                        <StatusPill
                          status={lowest([
                            flower.reviewStatus,
                            ...flower.entries.map((e) => e.reviewStatus),
                            ...rels.map((r) => r.reviewStatus),
                          ])}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="muted">
            季节口径:{Object.entries(SEASON_LABEL).map(([k, v]) => `${v}(${k === "spring" ? "3–5" : "6–8"} 月)`).join("、")};三个地域均按北半球气象学四季划分。
          </p>
        </section>

        <section aria-labelledby="honey-title">
          <h2 id="honey-title">蜂蜜工坊内容状态</h2>
          <p className="muted">
            "一滴花蜜的旅程"{honeyStages.length} 站、与花朵馆一一对应的 {honeyVarieties.length} 种单花蜜,以及
            {honeyNotes.length} 张纠偏卡(蜂王浆、谁在酿蜜)。感官描述有来源才写;蜂蜜与蜂王浆对人的功效不属于本馆展出范围。
          </p>
          <div className="table-scroll">
            <table className="data-table" aria-label="蜂蜜工坊条目与状态">
              <thead>
                <tr>
                  <th>条目</th>
                  <th>类别</th>
                  <th>关联</th>
                  <th className="num">来源数</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {honeyStages.map((stage) => (
                  <tr key={stage.id}>
                    <td>{stage.index} · {stage.title}</td>
                    <td>旅程站点</td>
                    <td>{stage.related.map((r) => r.label).join("、") || "—"}</td>
                    <td className="num">{stage.sourceIds.length}</td>
                    <td><StatusPill status={stage.reviewStatus} /></td>
                  </tr>
                ))}
                {honeyVarieties.map((variety) => (
                  <tr key={variety.id}>
                    <td>{variety.name}</td>
                    <td>单花蜜</td>
                    <td>{flowers[variety.flowerId]?.name ?? variety.flowerId}</td>
                    <td className="num">{variety.sourceIds.length}</td>
                    <td><StatusPill status={variety.reviewStatus} /></td>
                  </tr>
                ))}
                {honeyNotes.map((note) => (
                  <tr key={note.id}>
                    <td>{note.title}</td>
                    <td>纠偏卡</td>
                    <td>{note.related.map((r) => r.label).join("、") || "—"}</td>
                    <td className="num">{note.sourceIds.length}</td>
                    <td><StatusPill status={note.reviewStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="method-title">
          <h2 id="method-title">审查方法:AI 对抗式审查</h2>
          <p>
            受时间、能力与资金限制,首期无法聘请蜂类学专家逐条核校。我们采用的替代方案是<b>对抗式审查</b>:
            对每一条展出内容,由三个<b>互不通信</b>的 AI 审查视角独立裁决——
          </p>
          <ul>
            <li>
              <b>事实核查员</b>:把正文拆成事实断言,逐条抓取所引来源原文核对,标出"支持 / 不支持 / 未提及"。
            </li>
            <li>
              <b>反驳者</b>:只负责证伪。对每个断言追问"哪里可能是错的",用来源之外的资料(含原始文献)交叉验证。
            </li>
            <li>
              <b>合规审查员</b>:不管真伪,只看表述是否适合面向公众与青少年发布——绝对化、拟人化、安全暗示、术语可读性等。
            </li>
          </ul>
          <p>
            三方全部通过才升级为 <code>ai-reviewed</code>;任一方否决或存疑即保留草稿、修文后进入下一轮,只复审"未通过 ∪ 文本有改动"的子集,直到全部通过。
            所有裁决 JSON、每轮快照与报告都保存在仓库的 <code>content-review/</code> 目录。
          </p>
          <div className="table-scroll">
            <table className="data-table" aria-label="对抗式审查各轮结果">
              <thead>
                <tr>
                  <th>轮次</th>
                  <th>范围</th>
                  <th>事实核查 通过/否决/存疑</th>
                  <th>反驳者</th>
                  <th>合规</th>
                  <th>修文</th>
                </tr>
              </thead>
              <tbody>
                {REVIEW_ROUNDS.map((r) => (
                  <tr key={r.round}>
                    <td>{r.round}</td>
                    <td>{r.scope}</td>
                    <td>{r.fact}</td>
                    <td>{r.refute}</td>
                    <td>{r.comp}</td>
                    <td>{r.fixes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            审查抓出并已修正的实质性错误包括:把欧洲熊蜂写成长舌种(实为短舌、以盗蜜著称);蜂王螫针写成"无倒钩";
            "腹面集粉毛是多数蜂类的携粉方式"(实为切叶蜂科特征);熊蜂工蜂体型差异沿用了英文维基的"胸长",而原始文献测的是胸宽。
          </p>
          <h3>已知边界</h3>
          <ul>
            <li>
              <code>ai-reviewed</code> 不等于专家审校。AI 审查能发现与来源不符、与主流资料矛盾的表述,但不能替代领域专家的判断。
            </li>
            <li>Britannica 的两条来源在审查期间始终无法在线抓取,由其独立支撑的断言已改由可核来源承担或收敛措辞。</li>
            <li>Snodgrass《Anatomy of the Honey Bee》为纸本来源,通用解剖描述的核对依赖审查员的既有知识。</li>
            <li>东方蜜蜂"热球防御"的来源以日本亚种为例;熊蜂"咬孔盗蜜"在所引来源中为属级描述,正文已加限定。</li>
          </ul>
        </section>

        <section aria-labelledby="sources-title">
          <h2 id="sources-title">来源列表</h2>
          <p>
            共 {sourceRecords.length} 条。来源记录自身的状态指的是"引用关系是否经<b>人工</b>逐条核对",与条目正文的审查状态是两回事:
            对抗式审查中事实核查员已逐条抓取核对过这些来源,但尚无署名审校人,因此来源记录保持草稿标注。
          </p>
          <div className="table-scroll">
            <table className="data-table" aria-label="来源列表">
              <thead>
                <tr>
                  <th>来源</th>
                  <th>机构</th>
                  <th>访问日期</th>
                  <th>人工核对</th>
                </tr>
              </thead>
              <tbody>
                {sourceRecords.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer">
                          {s.title}
                        </a>
                      ) : (
                        <>{s.title}(纸本)</>
                      )}
                    </td>
                    <td>{s.organization}</td>
                    <td>{s.accessedOn}</td>
                    <td>{s.reviewer ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="help-title" className="callout">
          <h2 id="help-title">帮我们把它做对</h2>
          <p>
            如果你是蜂类学研究者、昆虫学教师或一线养蜂人,发现任何一处与你所知不符,欢迎指出。
            被人工核对过的条目会升级为"已审校"并署上审校人。
          </p>
        </section>
      </main>
      <SiteFooter lastReviewedOn={lastReviewedOn} />
    </div>
  );
}

export default Sources;
