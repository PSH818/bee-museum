import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import * as THREE from "three";
import {
  westernHoneyBeeCastes,
  type BeeFocusId,
  type BeeFocusItem,
} from "../data/bees/western-honeybee-worker";
import type { BeeCaste } from "../three/bees/types";
import { WesternHoneyBeeViewer } from "../three/viewer/WesternHoneyBeeViewer";
import { CompareStage } from "../three/viewer/CompareStage";
import { compareRowsBySpecies } from "../data/bees/western-honeybee-compare";
import { speciesContent } from "../data/bees/species-content";
import {
  BEE_SPECIES_IDS,
  beeSpecies,
  casteLabelOverrides,
  speciesCastes,
  type BeeSpeciesId,
} from "../data/bees/species-index";
import { BeeGlyph, usePageTitle } from "../ui/SiteChrome";
import { Provenance } from "../ui/Provenance";

const FOCUS_IDS: readonly BeeFocusId[] = ["whole", "head", "wing", "abdomen", "leg"];
const CASTE_IDS: readonly BeeCaste[] = ["worker", "queen", "drone"];

/**
 * 世界蜜蜂馆 / 身体与职型馆:标本观察器页面。
 * 路由:/museum/world-bees(默认西方蜜蜂)与 /museum/bees/:speciesId。
 * 展品状态体现在 URL 中(前端方案 §12.1):?caste= &focus= &organ= &compare=1
 * 测试专用:?vr=front|side|back|macro|focus-head|compare 固定相机、冻结帧循环、隐藏全部界面;?motion=0 初始暂停动作。
 */
function SpecimenHall() {
  const params = useParams<{ speciesId?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  // visual-regression mode:fixed camera, fixed quality, no motion, no decorative overlays
  const VR_VIEW = searchParams.get("vr");

  // 蜂种(产品方案 §5.1):路径参数优先,其次 ?species=(兼容旧直链)
  const [species, setSpecies] = useState<BeeSpeciesId>(() => {
    const fromPath = params.speciesId;
    const fromQuery = searchParams.get("species");
    if (BEE_SPECIES_IDS.includes(fromPath as BeeSpeciesId)) return fromPath as BeeSpeciesId;
    if (BEE_SPECIES_IDS.includes(fromQuery as BeeSpeciesId)) return fromQuery as BeeSpeciesId;
    return "apis-mellifera";
  });
  // 比较台(产品方案 §8.2):?compare=1 或 ?vr=compare 直接进入
  const [compare, setCompare] = useState(
    searchParams.get("compare") === "1" || VR_VIEW === "compare",
  );
  const [caste, setCaste] = useState<BeeCaste>(() => {
    const initial = searchParams.get("caste");
    return CASTE_IDS.includes(initial as BeeCaste) ? (initial as BeeCaste) : "worker";
  });
  const [focus, setFocus] = useState<BeeFocusId>(() => {
    const initial = searchParams.get("focus");
    return FOCUS_IDS.includes(initial as BeeFocusId) ? (initial as BeeFocusId) : "whole";
  });
  // ?motion=0:初始暂停生命动作(测试与低动态偏好场景)
  const [motion, setMotion] = useState(!VR_VIEW && searchParams.get("motion") !== "0");
  const [sound, setSound] = useState(false);
  const [organId, setOrganId] = useState<string | null>(() => {
    const initial = searchParams.get("organ");
    return Object.values(speciesContent).some((c) => c.organs.some((organ) => organ.id === initial))
      ? initial
      : null;
  });

  const speciesRecord = beeSpecies[species];
  const availableCastes = speciesCastes[species];
  const presentation = westernHoneyBeeCastes[caste];
  const content = speciesContent[species];
  const focusList = content.focus(caste);
  const casteLabel = (id: BeeCaste) =>
    casteLabelOverrides[species]?.[id] ?? westernHoneyBeeCastes[id].name;
  const current = focusList.find((item) => item.id === focus) ?? focusList[0];
  // 器官条目按物种与职型适配(如雄蜂无螫针/花粉筐,熊蜂螫针无倒钩)
  const organsForCaste = content.organs.filter((organ) => organ.castes.includes(caste));
  const currentOrgan = organsForCaste.find((organ) => organ.id === organId) ?? null;

  usePageTitle(
    compare
      ? `${speciesRecord.name} · 职型比较`
      : `${speciesRecord.name} · ${casteLabel(caste)}标本`,
  );

  // 展品状态 → URL(可分享、刷新恢复、课堂投屏)。测试模式下不改写,保证基线 URL 稳定。
  useEffect(() => {
    if (VR_VIEW) return;
    const next = new URLSearchParams();
    if (caste !== "worker") next.set("caste", caste);
    if (compare) next.set("compare", "1");
    else {
      if (focus !== "whole") next.set("focus", focus);
      if (organId) next.set("organ", organId);
    }
    if (searchParams.get("motion") === "0" && !motion) next.set("motion", "0");
    const search = next.toString();
    const target = `/museum/bees/${species}${search ? `?${search}` : ""}`;
    if (location.pathname + location.search !== target) navigate(target, { replace: true });
    // searchParams 仅用于读取 motion 初值,不作为依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [species, caste, focus, compare, organId, motion, VR_VIEW, location.pathname, location.search, navigate]);

  const changeFocus = (next: BeeFocusId) => {
    setFocus(next);
    setOrganId(null); // 手动切部位时收起器官卡
  };
  const changeCaste = (next: BeeCaste) => {
    setCompare(false);
    setCaste(next);
    setFocus("whole");
    setOrganId(null);
  };
  const enterCompare = () => {
    setCompare(true);
    setOrganId(null);
  };
  const changeSpecies = (next: BeeSpeciesId) => {
    setSpecies(next);
    setCaste("worker");
    setCompare(false);
    setFocus("whole");
    setOrganId(null);
  };

  return (
    <main className="observatory-shell">
      {!VR_VIEW && (
        <div className="ambient-field" aria-hidden="true">
          <span className="sun-haze" />
          {Array.from({ length: 18 }, (_, index) => (
            <i key={index} style={{ "--particle": index } as CSSProperties} />
          ))}
        </div>
      )}

      {!VR_VIEW && (
        <header className="topbar">
          <Link className="wordmark" to="/" aria-label="回到序厅">
            <BeeGlyph />
            <span>
              <b>蜂之境</b>
              <small>HALL 01 · WORLD BEES</small>
            </span>
          </Link>
          <div className="chapter-mark">
            <span>观察标本</span>
            <b>
              {compare
                ? `${speciesRecord.name} · 三职型比较`
                : `${speciesRecord.name} · ${casteLabel(caste)}标本`}
            </b>
          </div>
          <nav className="top-actions" aria-label="页面操作">
            <button
              className={sound ? "active" : ""}
              onClick={() => setSound((value) => !value)}
              aria-pressed={sound}
            >
              {sound ? "环境声 开" : "环境声 关"}
            </button>
            <Link className="about-button" to="/sources">
              来源与审校
            </Link>
            <Link className="about-button" to="/about">
              关于本项目
            </Link>
          </nav>
        </header>
      )}

      {!VR_VIEW && (
        <section className="hero-copy">
          <p className="kicker">
            <span /> 近距离观察 · 世界蜜蜂馆
          </p>
          <h1>
            在它飞向花朵之前，
            <br />
            先看清一只蜜蜂。
          </h1>
          <p>
            这不是标本柜里的静止图鉴。
            {compare ? "三种职型并排在同一比例尺下,差异一目了然。" : content.hero || presentation.hero}
          </p>
        </section>
      )}

      <section className="bee-stage" aria-label="可交互蜜蜂三维观察区">
        {!VR_VIEW && (
          <nav className="species-switch" aria-label="选择蜂种">
            {BEE_SPECIES_IDS.map((id) => (
              <button
                key={id}
                className={species === id ? "active" : ""}
                onClick={() => changeSpecies(id)}
                aria-pressed={species === id}
                title={beeSpecies[id].scientificName}
              >
                {beeSpecies[id].name}
              </button>
            ))}
          </nav>
        )}
        {!VR_VIEW && (availableCastes.length > 1 || species === "apis-mellifera") && (
          <nav className="caste-switch" aria-label="选择职型或比较">
            {availableCastes.map((id) => (
              <button
                key={id}
                className={!compare && caste === id ? "active" : ""}
                onClick={() => changeCaste(id)}
                aria-pressed={!compare && caste === id}
                title={westernHoneyBeeCastes[id].role}
              >
                {casteLabel(id)}
              </button>
            ))}
            {availableCastes.length > 1 && (
              <button
                className={compare ? "active" : ""}
                onClick={enterCompare}
                aria-pressed={compare}
                title="三职型同台,真实体长比例"
              >
                对比
              </button>
            )}
          </nav>
        )}
        <Suspense fallback={<div className="loading-mark">正在唤醒观察标本…</div>}>
          <Canvas
            shadows="basic"
            frameloop={VR_VIEW ? "demand" : "always"}
            dpr={VR_VIEW ? 1 : [1, 1.7]}
            camera={{ position: [0, 0.1, 7.4], fov: 34 }}
            gl={{
              antialias: true,
              alpha: true,
              toneMapping: THREE.ACESFilmicToneMapping,
            }}
          >
            {compare ? (
              <CompareStage species={species} motion={motion} interactive={!VR_VIEW} />
            ) : (
              <WesternHoneyBeeViewer
                species={species}
                caste={caste}
                focus={focus}
                onFocus={setFocus}
                motion={motion}
                organs={organsForCaste}
                selectedOrganId={organId}
                onSelectOrgan={setOrganId}
                fixedView={VR_VIEW}
              />
            )}
          </Canvas>
        </Suspense>
        {!VR_VIEW && <div className="stage-vignette" aria-hidden="true" />}
        {!VR_VIEW && !compare && currentOrgan && (
          <aside className="organ-card" key={currentOrgan.id} aria-label="器官说明">
            <button className="organ-close" onClick={() => setOrganId(null)} aria-label="关闭器官说明">
              ×
            </button>
            {currentOrgan.latinName && <p className="latin">{currentOrgan.latinName}</p>}
            <h3>{currentOrgan.name}</h3>
            <p className="organ-summary">{currentOrgan.summary}</p>
            <p className="organ-function">
              <span>功能</span>
              {currentOrgan.functionNote}
            </p>
            {currentOrgan.modelNote && <p className="organ-model-note">{currentOrgan.modelNote}</p>}
            <Provenance sourceIds={currentOrgan.sourceIds} reviewStatus={currentOrgan.reviewStatus} />
          </aside>
        )}
      </section>

      {!VR_VIEW && !compare && (
        <aside className="focus-nav" aria-label="选择观察部位">
          {focusList.map((item) => (
            <button
              key={item.id}
              className={focus === item.id ? "active" : ""}
              onClick={() => changeFocus(item.id)}
              aria-pressed={focus === item.id}
            >
              <FocusGlyph id={item.id} />
              <span>{item.index}</span>
              <b>{item.short}</b>
              <i />
            </button>
          ))}
        </aside>
      )}

      {!VR_VIEW && compare && (
        <article className="observation-card compare-card">
          <div className="observation-index">COMPARISON / CASTES</div>
          <p className="latin">{speciesRecord.scientificName} · worker × queen × drone</p>
          <h2>同一群体,三种身体方案</h2>
          <div className="compare-table" role="table" aria-label="三职型对照表">
            <div className="compare-row compare-head" role="row">
              <span role="columnheader">维度</span>
              <span role="columnheader">工蜂</span>
              <span role="columnheader">蜂王</span>
              <span role="columnheader">雄蜂</span>
            </div>
            {(compareRowsBySpecies[species] ?? []).map((row) => (
              <div className="compare-row" role="row" key={row.id}>
                <span role="rowheader">{row.dimension}</span>
                <span role="cell">{row.values.worker}</span>
                <span role="cell">{row.values.queen}</span>
                <span role="cell">{row.values.drone}</span>
              </div>
            ))}
          </div>
          <p className="compare-note">
            {species === "apis-mellifera"
              ? "标本按真实体长比例缩放展示。"
              : "职型体长待补来源,标本按模型原比例展示。"}
          </p>
          <Provenance
            sourceIds={[...new Set((compareRowsBySpecies[species] ?? []).flatMap((row) => row.sourceIds))]}
            reviewStatus={
              (compareRowsBySpecies[species] ?? []).every((row) => row.reviewStatus !== "draft")
                ? "ai-reviewed"
                : "draft"
            }
          />
        </article>
      )}

      {!VR_VIEW && !compare && (
        <article className="observation-card" key={current.id}>
          <div className="observation-index">OBSERVATION / {current.index}</div>
          <p className="latin">{current.latin}</p>
          <h2>{current.title}</h2>
          <p className="description">{current.description}</p>
          <div className="field-note">
            <span>观察笔记</span>
            <p>{current.fact}</p>
          </div>
          <Provenance sourceIds={current.sourceIds} reviewStatus={current.reviewStatus} />
          <div className="card-actions">
            <button
              className="motion-toggle"
              onClick={() => setMotion((value) => !value)}
              aria-pressed={motion}
            >
              <span className={motion ? "pause-icon" : "play-icon"} />
              {motion ? "暂停生命动作" : "恢复生命动作"}
            </button>
            <button className="next-focus" onClick={() => changeFocus(nextFocus(focusList, focus))}>
              下一个部位 <span>→</span>
            </button>
          </div>
        </article>
      )}

      {!VR_VIEW && (
        <footer className="experience-footer">
          <span>NEXT HALL</span>
          <i />
          <p>
            <Link to="/museum/flowers">下一站：花朵与四季馆</Link>
          </p>
        </footer>
      )}
    </main>
  );
}

function nextFocus(focusList: BeeFocusItem[], current: BeeFocusId): BeeFocusId {
  const currentIndex = focusList.findIndex((item) => item.id === current);
  return focusList[(currentIndex + 1) % focusList.length].id;
}

/** 左侧部位列表的剪影图标(线描,继承文字颜色) */
function FocusGlyph({ id }: { id: BeeFocusId }) {
  const paths: Record<BeeFocusId, string> = {
    whole:
      "M7 13c0-3 2.5-5 5-5s5 2 5 5-2.5 5-5 5-5-2-5-5ZM12 8c2-3 6-3 7-1M12 8C10 5 6 5 5 7M9 18l-1.5 2.5M12 18v3M15 18l1.5 2.5",
    head: "M8 13a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0ZM10 9.5 7 5M14.5 9.5 17.5 5M10.5 13.5h4",
    wing: "M5 15C7 7 16 5 19 6.5c.8 4-3 10-9 10-2.4 0-4.2-.5-5-1.5ZM8 14c3-3 7-5 9.5-6M8.5 15.5c3.5-1.5 6.5-3 9-5.5",
    abdomen: "M6 13c0-3.5 3-6 6-6s6 2.5 6 6-3 6-6 6-6-2.5-6-6ZM7 10.5h10M6.5 13.5h11M8 16.5h8",
    leg: "M6 6l4 3.5L9 14l4.5 2 1 4M13.5 16l3.5.5M9 14l-3.5 1",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="focus-glyph">
      <path d={paths[id]} />
    </svg>
  );
}

export default SpecimenHall;
