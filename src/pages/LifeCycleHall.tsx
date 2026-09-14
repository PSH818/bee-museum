import { Canvas } from "@react-three/fiber";
import { asset } from "../lib/asset";
import { Suspense, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import * as THREE from "three";
import {
  DEFAULT_LIFE_CYCLE_ID,
  LIFE_CYCLE_IDS,
  formatTime,
  lifeCycles,
  stageAt,
  timelineTicks,
} from "../data/life-cycles";
import type { LifeCycle, RelatedExhibit } from "../data/schemas/content";
import { beeSpecies, type BeeSpeciesId } from "../data/bees/species-index";
import { LifeCycleScene } from "../three/lifecycle/LifeCycleScene";
import { SiteHeader, SkipLink, usePageTitle } from "../ui/SiteChrome";
import { Provenance } from "../ui/Provenance";

const clampTo = (v: number, story: LifeCycle) => Math.min(story.total.to - 1e-3, Math.max(story.total.from, v));

/** 相关展品 → 路径(产品方案 §8.3:过程节点跳回器官/蜂种/比较台) */
function relatedPath(rel: RelatedExhibit, story: LifeCycle): string {
  switch (rel.kind) {
    case "organ":
      return `/museum/bees/${story.speciesId}?organ=${rel.id}`;
    case "focus":
      return `/museum/bees/${story.speciesId}?focus=${rel.id}`;
    case "species":
      return `/museum/bees/${rel.id}`;
    case "compare":
      return `/museum/bees/${rel.id}?compare=1`;
    case "cycle":
      return `/museum/life-cycle/${rel.id}`;
  }
}

/**
 * 生命历程馆(产品方案 §4.5、§8.3):可拖动时间轴驱动的过程展品。
 * 路由:/museum/life-cycle(默认故事)与 /museum/life-cycle/:storyId;?t= 为时间轴位置。
 * 测试专用:?vr=1&t=… 固定视角、冻结帧循环、隐藏界面。
 */
function LifeCycleHall() {
  const params = useParams<{ storyId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const storyId = params.storyId && lifeCycles[params.storyId] ? params.storyId : DEFAULT_LIFE_CYCLE_ID;
  const story = lifeCycles[storyId];
  const VR_VIEW = searchParams.get("vr");

  const [t, setT] = useState(() => {
    const raw = searchParams.get("t");
    const v = raw === null ? NaN : Number(raw);
    return Number.isFinite(v) ? clampTo(v, story) : story.total.from;
  });
  const [playing, setPlaying] = useState(false);
  const [motion, setMotion] = useState(!VR_VIEW && searchParams.get("motion") !== "0");
  const stage = stageAt(story, t);
  const stageIndex = story.stages.indexOf(stage);
  const species = beeSpecies[story.speciesId as BeeSpeciesId];

  usePageTitle(`${story.title} · 生命历程馆`);

  // 切换故事:时间轴归零(首次挂载沿用 URL 中的 t)
  const mountedStory = useRef(storyId);
  useEffect(() => {
    if (mountedStory.current === storyId) return;
    mountedStory.current = storyId;
    setT(story.total.from);
    setPlaying(false);
  }, [storyId, story]);

  // 时间轴位置 → URL(可分享);测试模式不改写
  useEffect(() => {
    if (VR_VIEW) return;
    const handle = window.setTimeout(() => {
      const next = new URLSearchParams();
      next.set("t", t.toFixed(1));
      const target = `/museum/life-cycle/${storyId}?${next.toString()}`;
      if (location.pathname + location.search !== target) navigate(target, { replace: true });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [t, storyId, VR_VIEW, navigate, location.pathname, location.search]);

  // 播放:整条时间轴约 45 秒走完
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const rate = (story.total.to - story.total.from) / 45;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((value) => {
        const next = value + rate * dt;
        if (next >= story.total.to) {
          setPlaying(false);
          return story.total.to - 1e-3;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, story]);

  const pct = (v: number) => ((v - story.total.from) / (story.total.to - story.total.from)) * 100;
  const ticks = timelineTicks(story);
  const jumpTo = (v: number) => {
    setPlaying(false);
    setT(clampTo(v, story));
  };

  const stageCanvas = (
    <Suspense fallback={<div className="loading-mark">正在布置场景…</div>}>
      <Canvas
        shadows="basic"
        frameloop={VR_VIEW ? "demand" : "always"}
        dpr={VR_VIEW ? 1 : [1, 1.7]}
        camera={{ position: [0.9, 1.05, 5.4], fov: 34 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <LifeCycleScene story={story} t={t} motion={motion} interactive={!VR_VIEW} />
      </Canvas>
    </Suspense>
  );

  // 测试模式:沿用原舞台容器与尺寸,保证视觉基线不变
  if (VR_VIEW) {
    return (
      <main className="observatory-shell lifecycle-shell">
        <section className="bee-stage lifecycle-stage" aria-label="生命历程三维场景">
          {stageCanvas}
        </section>
      </main>
    );
  }

  return (
    <div className="workbench lifecycle">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="wb-body">
        <aside className="wb-panel wb-library lc-library" aria-label="故事与阶段">
          <div className="wb-panel-head">
            <span className="wb-kicker">生命历程 · LIFE CYCLE</span>
          </div>
          <ul className="lc-stories">
            {LIFE_CYCLE_IDS.map((id) => (
              <li key={id} className={id === storyId ? "active" : ""}>
                <button
                  className="lc-story-row"
                  onClick={() => navigate(`/museum/life-cycle/${id}`)}
                  aria-pressed={id === storyId}
                >
                  <img src={asset(`/images/cards/${id}.png`)} alt="" width={56} height={56} loading="lazy" />
                  <span>
                    <b>{lifeCycles[id].title}</b>
                    <i>{lifeCycles[id].subtitle}</i>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="wb-kicker lc-stage-kicker">阶段 · {story.stages.length} 站</p>
          <nav className="stage-nav lc-stage-list" aria-label="选择阶段">
            {story.stages.map((s, index) => (
              <button
                key={s.id}
                className={s.id === stage.id ? "active" : ""}
                onClick={() => jumpTo(s.span.from)}
                aria-pressed={s.id === stage.id}
                title={s.spanText}
              >
                <em className={`phase-dot phase-${s.phase}`} aria-hidden="true" />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{s.short}</b>
                <small>{s.spanText}</small>
              </button>
            ))}
          </nav>
        </aside>

        <section className="wb-stage lifecycle-stage" aria-label="生命历程三维场景">
          <nav className="species-switch wb-narrow-only" aria-label="选择故事">
            {LIFE_CYCLE_IDS.map((id) => (
              <button
                key={id}
                className={id === storyId ? "active" : ""}
                aria-pressed={id === storyId}
                onClick={() => navigate(`/museum/life-cycle/${id}`)}
              >
                {lifeCycles[id].title}
              </button>
            ))}
          </nav>
          {stageCanvas}
          <div className="stage-vignette" aria-hidden="true" />
          <div className="timeline" role="group" aria-label="生命历程时间轴">
            <button
              className={`timeline-play${playing ? " active" : ""}`}
              onClick={() => {
                if (!playing && t >= story.total.to - 1e-2) setT(story.total.from);
                setPlaying((value) => !value);
              }}
              aria-pressed={playing}
              aria-label={playing ? "暂停播放" : "播放时间轴"}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <div className="timeline-track">
              <div className="timeline-segments" aria-hidden="true">
                {story.stages.map((s) => (
                  <span
                    key={s.id}
                    className={`timeline-seg phase-${s.phase}${s.id === stage.id ? " active" : ""}`}
                    style={{ left: `${pct(s.span.from)}%`, width: `${pct(s.span.to) - pct(s.span.from)}%` }}
                  >
                    {pct(s.span.to) - pct(s.span.from) > 5 && <i>{s.short}</i>}
                  </span>
                ))}
              </div>
              <input
                type="range"
                min={story.total.from}
                max={story.total.to}
                step={story.unit === "day" ? 0.1 : 0.02}
                value={t}
                onChange={(event) => jumpTo(Number(event.target.value))}
                aria-label="时间轴位置"
                aria-valuetext={`${formatTime(story, t)} · ${stage.name}`}
              />
              <div className="timeline-ticks" aria-hidden="true">
                {ticks.map((tick) => (
                  <span key={tick.at} style={{ left: `${pct(tick.at)}%` }}>
                    {tick.label}
                  </span>
                ))}
              </div>
            </div>
            <output className="timeline-now" aria-live="polite">
              {formatTime(story, t)}
            </output>
          </div>
        </section>

        <aside className="wb-panel wb-dossier cycle-card" aria-label="阶段说明" key={stage.id}>
          <p className="wb-eyebrow">LIFE CYCLE · {story.subtitle}</p>
          <h1 className="lc-title">{story.title}</h1>
          <p className="wb-tagline">{story.intro}</p>
          <div className="lc-stage-head">
            <span>
              STAGE {String(stageIndex + 1).padStart(2, "0")}/{String(story.stages.length).padStart(2, "0")} · {stage.spanText}
            </span>
          </div>
          <h2>{stage.name}</h2>
          <p className="description">{stage.summary}</p>
          <div className="field-note">
            <span>细看</span>
            <p>{stage.detail}</p>
          </div>
          {stage.condition && (
            <p className="cycle-condition">
              <span>条件</span>
              {stage.condition}
            </p>
          )}
          {stage.related.length > 0 && (
            <p className="cycle-related">
              相关展品:
              {stage.related.map((rel, index) => (
                <span key={`${rel.kind}-${rel.id}`}>
                  {index > 0 && " · "}
                  <Link to={relatedPath(rel, story)}>{rel.label}</Link>
                </span>
              ))}
            </p>
          )}
          <Provenance sourceIds={stage.sourceIds} reviewStatus={stage.reviewStatus} />
          <div className="card-actions">
            <button className="motion-toggle" onClick={() => setMotion((value) => !value)} aria-pressed={motion}>
              <span className={motion ? "pause-icon" : "play-icon"} />
              {motion ? "暂停生命动作" : "恢复生命动作"}
            </button>
            <button
              className="next-focus"
              onClick={() => jumpTo(story.stages[(stageIndex + 1) % story.stages.length].span.from)}
            >
              下一阶段 <span>→</span>
            </button>
          </div>
          {story.branches.length > 0 && (
            <div className="cycle-branches">
              {story.branches.map((branch) => (
                <details key={branch.id}>
                  <summary>{branch.title}</summary>
                  <p>{branch.text}</p>
                  <Provenance sourceIds={branch.sourceIds} reviewStatus={branch.reviewStatus} />
                </details>
              ))}
            </div>
          )}
          <p className="lc-next">
            <Link to={`/museum/bees/${story.speciesId}`}>看这只蜂的标本 →</Link>
            <Link to="/museum/honey-workshop">下一站:蜂蜜工坊</Link>
          </p>
        </aside>
      </main>
    </div>
  );
}

export default LifeCycleHall;
