import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { honeyNotes, honeyStages, honeyVarieties } from "../data/honey";
import { flowers } from "../data/flowers";
import { FLOWER_SWATCHES } from "../data/flowers/swatches";
import { sourceRecordById } from "../data/sources/records";
import type { HoneyStage, RelatedExhibit } from "../data/schemas/content";
import { HiveStage, type HiveFocus } from "../three/hive/HiveStage";
import { Provenance } from "../ui/Provenance";
import { SucroseDemo } from "../ui/SucroseDemo";
import { SiteHeader, SkipLink, usePageTitle } from "../ui/SiteChrome";

// 蜂蜜工坊(M5 第 3 步骨架):三栏工作台——左 旅程六站 / 中 巢脾舞台 / 右 当前站档案卡。
// ?stage=<短名> 直链(gather/carry/handoff/transform/condense/cap);?motion=0 镜头直接吸附。
// 单花蜜与纠偏卡区块在第 5 步接入。

/** 每站的舞台机位:对准该站的蜂摆位与格态(蜂位见 HiveBees 的 STAGE_BEES) */
const STAGE_FOCUS: Record<string, { anchor: string; offset?: [number, number, number]; distance: number | "fit" }> = {
  gather: { anchor: "fit", distance: "fit" },
  carry: { anchor: "anchor_cellOpen", offset: [-0.3, 0.15, 0.34], distance: 4.4 },
  handoff: { anchor: "anchor_landing", offset: [0, 0.2, 0.34], distance: 5.4 },
  transform: { anchor: "anchor_cellOpen", offset: [0, 0.35, 0.2], distance: 5.6 },
  condense: { anchor: "anchor_cellOpen", offset: [0.3, -0.35, 0.2], distance: 4.8 },
  cap: { anchor: "anchor_landing", offset: [-0.15, 0.2, 0.1], distance: 4.6 },
};

const shortId = (stage: HoneyStage) => stage.id.replace("honey-stage-", "");
const honeyShortId = (id: string) => id.replace("honey-", "");

/** 来源行(与花朵馆关系卡同一视觉) */
function SourceLine({ sourceIds }: { sourceIds: string[] }) {
  return (
    <p className="fl-rel-sources">
      来源:
      {sourceIds.map((id, i) => {
        const rec = sourceRecordById.get(id);
        if (!rec) return null;
        return (
          <span key={id}>
            {i > 0 && " · "}
            {rec.url ? (
              <a href={rec.url} target="_blank" rel="noreferrer">{rec.title}</a>
            ) : (
              rec.title
            )}
          </span>
        );
      })}
    </p>
  );
}

function relatedLink(rel: RelatedExhibit): string {
  if (rel.kind === "organ") return `/?organ=${rel.id}`;
  if (rel.kind === "species" || rel.kind === "compare") return `/museum/bees/${rel.id}`;
  if (rel.kind === "cycle") return `/museum/life-cycle/${rel.id.replace("cycle-", "")}`;
  return "/";
}

function HoneyWorkshopHall() {
  usePageTitle("蜂蜜工坊");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const motion = params.get("motion") !== "0";
  const stageParam = params.get("stage");
  const stageIndex = Math.max(
    0,
    honeyStages.findIndex((s) => shortId(s) === stageParam),
  );
  const stage = honeyStages[stageIndex];

  const seqRef = useRef(1);
  const [focusSeq, setFocusSeq] = useState(0);
  const [zoomRequest, setZoomRequest] = useState<{ dir: 1 | -1; seq: number } | null>(null);

  // 右栏页签:旅程站点 / 这瓶蜜(?panel=honeys 直链;?honey=<短名> 高亮并滚到对应蜜卡)
  const panel = params.get("panel") === "honeys" ? "honeys" : "journey";
  const honeyParam = params.get("honey");
  const setPanel = (next: "journey" | "honeys") => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next === "honeys") p.set("panel", "honeys");
      else {
        p.delete("panel");
        p.delete("honey");
      }
      return p;
    });
  };
  const highlightRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (panel === "honeys" && honeyParam && highlightRef.current) {
      highlightRef.current.scrollIntoView({ block: "center" });
    }
  }, [panel, honeyParam]);

  const gotoStage = (target: HoneyStage) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("stage", shortId(target));
        return next;
      },
      { replace: false },
    );
    setFocusSeq(seqRef.current++);
  };

  const focus: HiveFocus = useMemo(() => {
    const f = STAGE_FOCUS[shortId(stage)] ?? STAGE_FOCUS.gather;
    return { anchor: f.anchor, offset: f.offset, distance: f.distance, seq: focusSeq * 10 + stageIndex };
  }, [stage, focusSeq, stageIndex]);

  const prev = honeyStages[stageIndex - 1];
  const next = honeyStages[stageIndex + 1];

  return (
    <div className="workbench flowers honey">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="wb-body">
        <aside className="wb-panel wb-library" aria-label="旅程站点">
          <p className="wb-eyebrow">HONEY · 一滴花蜜的旅程</p>
          <nav className="fl-list" aria-label="选择站点">
            {honeyStages.map((s) => (
              <button
                key={s.id}
                className={`fl-item${s.id === stage.id ? " active" : ""}`}
                aria-pressed={s.id === stage.id}
                onClick={() => gotoStage(s)}
              >
                <span className="fl-swatch hw-num" aria-hidden="true">{Number(s.index)}</span>
                <span className="fl-item-text">
                  <b>{s.title.split(" · ")[0]}</b>
                  <span className="fl-sub">
                    <i className="latin">{s.latin}</i>
                  </span>
                </span>
              </button>
            ))}
          </nav>
          <p className="fl-note muted">
            六站连成一滴花蜜到一格封盖蜜的路;第一站发生在花上,可回花朵馆看访花演示。
          </p>
        </aside>

        <section className="wb-stage" aria-label="蜂巢巢脾三维观察区">
          <nav className="species-switch wb-narrow-only" aria-label="选择站点">
            {honeyStages.map((s) => (
              <button
                key={s.id}
                className={s.id === stage.id ? "active" : ""}
                aria-pressed={s.id === stage.id}
                onClick={() => gotoStage(s)}
              >
                {s.index} {s.short}
              </button>
            ))}
          </nav>
          <div className="wb-tools" role="toolbar" aria-label="观察工具">
            <button aria-label="放大" onClick={() => setZoomRequest({ dir: 1, seq: seqRef.current++ })}>
              <span className="fl-glyph" aria-hidden="true">＋</span>
              <span>放大</span>
            </button>
            <button aria-label="缩小" onClick={() => setZoomRequest({ dir: -1, seq: seqRef.current++ })}>
              <span className="fl-glyph" aria-hidden="true">－</span>
              <span>缩小</span>
            </button>
            <button aria-label="回到本站机位" onClick={() => setFocusSeq(seqRef.current++)}>
              <span className="fl-glyph" aria-hidden="true">↺</span>
              <span>重置</span>
            </button>
          </div>
          <HiveStage focus={focus} stage={shortId(stage)} motion={motion} zoomRequest={zoomRequest} />
          {shortId(stage) === "transform" && (
            <SucroseDemo
              motion={motion}
              defaultCollapsed={typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches}
            />
          )}
          <p className="stage-caption">HONEYCOMB · 竖立巢脾 · 左 空房 / 中 盛蜜 / 右 封盖</p>
        </section>

        <aside className="wb-panel wb-dossier flower-card" aria-label="工坊档案" key={`${stage.id}-${panel}`}>
          <p className="wb-eyebrow">
            {panel === "journey"
              ? `HONEY WORKSHOP · 第 ${Number(stage.index)}/${honeyStages.length} 站`
              : "HONEY WORKSHOP · 单花蜜与两个误会"}
          </p>
          <div className="fl-tabs" role="tablist" aria-label="工坊页签">
            <button
              role="tab"
              aria-selected={panel === "journey"}
              className={panel === "journey" ? "active" : ""}
              onClick={() => setPanel("journey")}
            >
              旅程站点
            </button>
            <button
              role="tab"
              aria-selected={panel === "honeys"}
              className={panel === "honeys" ? "active" : ""}
              onClick={() => setPanel("honeys")}
            >
              这瓶蜜
              <em className="fl-tab-count">{honeyVarieties.length}</em>
            </button>
          </div>
          {panel === "honeys" ? (
            <>
              <p className="hw-panel-intro">
                本馆七种花,各对应一种有来源记载的单花蜜;点花名回花朵馆看那朵花。感官描述有来源才写,没有的如实标注。
              </p>
              {honeyVarieties.map((variety) => {
                const active = honeyParam === honeyShortId(variety.id);
                return (
                  <article
                    key={variety.id}
                    ref={active ? (el) => void (highlightRef.current = el) : undefined}
                    className={`hw-honey${active ? " active" : ""}`}
                  >
                    <header className="hw-honey-head">
                      <span
                        className="fl-swatch"
                        aria-hidden="true"
                        style={{ background: FLOWER_SWATCHES[variety.flowerId] }}
                      />
                      <b>{variety.name}</b>
                      <button onClick={() => navigate(`/museum/flowers/${variety.flowerId}`)}>
                        看{flowers[variety.flowerId]?.name ?? "这朵花"} →
                      </button>
                    </header>
                    <p className="hw-honey-traits">{variety.traits}</p>
                    <p className="hw-honey-region">产地口径:{variety.regionNote}</p>
                    <SourceLine sourceIds={variety.sourceIds} />
                  </article>
                );
              })}
              <h2 className="hw-notes-head">两个常见误会</h2>
              {honeyNotes.map((note) => (
                <article key={note.id} className="hw-note">
                  <h3>{note.title}</h3>
                  <p className="hw-note-intro">{note.intro}</p>
                  {note.points.map((pt) => (
                    <p key={pt.label} className="hw-note-point">
                      <b>{pt.label}</b>
                      {pt.text}
                    </p>
                  ))}
                  {note.related.length > 0 && (
                    <div className="hw-related">
                      {note.related.map((rel) => (
                        <button key={`${rel.kind}-${rel.id}`} onClick={() => navigate(relatedLink(rel))}>
                          {rel.label} →
                        </button>
                      ))}
                    </div>
                  )}
                  <Provenance sourceIds={note.sourceIds} reviewStatus={note.reviewStatus} />
                </article>
              ))}
            </>
          ) : (
            <>
          <h1 className="fl-title">{stage.title}</h1>
          <p className="latin">{stage.latin}</p>
          <p className="hw-summary">{stage.summary}</p>
          <p className="hw-detail">{stage.detail}</p>
          {stage.boundary && <p className="hw-boundary">{stage.boundary}</p>}
          {(stage.related.length > 0 || shortId(stage) === "gather") && (
            <div className="hw-related">
              {shortId(stage) === "gather" && (
                <button
                  className="hw-related-hero"
                  onClick={() => navigate("/museum/flowers/flower-brassica-napus?visit=apis-mellifera")}
                >
                  去花朵馆看这一站:蜜蜂落上油菜花 →
                </button>
              )}
              {stage.related.map((rel) => (
                <button key={`${rel.kind}-${rel.id}`} onClick={() => navigate(relatedLink(rel))}>
                  {rel.label} →
                </button>
              ))}
            </div>
          )}
          <div className="hw-nav">
            <button disabled={!prev} onClick={() => prev && gotoStage(prev)}>
              ← {prev ? prev.short : "起点"}
            </button>
            <button className="hw-nav-next" disabled={!next} onClick={() => next && gotoStage(next)}>
              {next ? `下一站:${next.short}` : "旅程终点"} →
            </button>
          </div>
          <Provenance sourceIds={stage.sourceIds} reviewStatus={stage.reviewStatus} />
          <p className="fl-note muted">
            模型说明:真实巢房的轴略向上倾、巢脾两面都有巢房;本模型为单面、直轴的示意简化。
          </p>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}

export default HoneyWorkshopHall;
