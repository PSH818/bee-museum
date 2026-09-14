import { Canvas } from "@react-three/fiber";
import { asset } from "../lib/asset";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import * as THREE from "three";
import {
  westernHoneyBeeCastes,
  type BeeFocusId,
  type BeeFocusItem,
} from "../data/bees/western-honeybee-worker";
import type { BeeCaste } from "../three/bees/types";
import { WesternHoneyBeeViewer } from "../three/viewer/WesternHoneyBeeViewer";
import { FineSpecimenStage } from "../three/viewer/FineSpecimenStage";
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
import { lifeCycles } from "../data/life-cycles";
import { halls } from "../data/halls";
import type { OrganEntry, ReviewStatus } from "../data/schemas/content";
import { REVIEW_STATUS_LABEL } from "../data/schemas/content";
import { SiteHeader, SkipLink, usePageTitle } from "../ui/SiteChrome";
import { Provenance } from "../ui/Provenance";

const FOCUS_IDS: readonly BeeFocusId[] = ["whole", "head", "wing", "abdomen", "leg"];
const CASTE_IDS: readonly BeeCaste[] = ["worker", "queen", "drone"];
const LAYER_IDS = ["fur", "wings", "pollen"] as const;
const LAYER_DEFS: Array<{ id: (typeof LAYER_IDS)[number]; label: string }> = [
  { id: "fur", label: "绒毛" },
  { id: "wings", label: "翅" },
  { id: "pollen", label: "花粉团" },
];
const VIEW_OPTIONS: Array<[string, string | null]> = [
  ["默认", null],
  ["正面", "front"],
  ["侧面", "side"],
  ["背面", "back"],
  ["微距", "macro"],
];
/** 精模带花粉团的蜂种(仅工蜂) */
const POLLEN_BEARING = new Set(["apis-mellifera", "apis-cerana", "bombus-terrestris"]);
/** 独立精致标本(纯鉴赏模式;方案 2026-09-11 定):目前只有东方蜜蜂三职型 */
const FINE_MODELS: Partial<Record<BeeSpeciesId, Partial<Record<BeeCaste, string>>>> = {
  "apis-cerana": {
    worker: asset("/models/bee-fine-cerana-worker.glb"),
    queen: asset("/models/bee-fine-cerana-queen.glb"),
    drone: asset("/models/bee-fine-cerana-drone.glb"),
  },
};

/** 展厅页签里列出的馆(标本馆自身除外) */
const LIBRARY_HALL_IDS = ["life-cycle", "flowers", "honey-workshop", "sources"];

/**
 * 标本工作台(交互方案 v3):首屏即三维标本。
 * 三栏:左 馆藏(蜂种/展厅) · 中 三维舞台 · 右 档案卡(整体/部位/器官/比较四模式)。
 * 路由:`/`(默认西方蜜蜂工蜂)与 /museum/bees/:speciesId;?caste= &focus= &organ= &compare=1 &hide=。
 * 测试专用:?vr= 固定相机、冻结帧循环、隐藏全部界面(沿用原标本馆的舞台容器,基线不变)。
 */
function Workbench() {
  const params = useParams<{ speciesId?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const VR_VIEW = searchParams.get("vr");

  const [species, setSpecies] = useState<BeeSpeciesId>(() => {
    const fromPath = params.speciesId;
    const fromQuery = searchParams.get("species");
    if (BEE_SPECIES_IDS.includes(fromPath as BeeSpeciesId)) return fromPath as BeeSpeciesId;
    if (BEE_SPECIES_IDS.includes(fromQuery as BeeSpeciesId)) return fromQuery as BeeSpeciesId;
    return "apis-mellifera";
  });
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
  const [motion, setMotion] = useState(!VR_VIEW && searchParams.get("motion") !== "0");
  const [organId, setOrganId] = useState<string | null>(() => {
    const initial = searchParams.get("organ");
    return Object.values(speciesContent).some((c) => c.organs.some((organ) => organ.id === initial))
      ? initial
      : null;
  });
  // 隐藏图层(?hide=fur,wings,pollen)
  const [hiddenLayers, setHiddenLayers] = useState<readonly string[]>(() =>
    (searchParams.get("hide") ?? "")
      .split(",")
      .filter((layer): layer is (typeof LAYER_IDS)[number] =>
        (LAYER_IDS as readonly string[]).includes(layer),
      ),
  );
  // 工具竖栏状态(交互方案 v3 §4.3)
  const [isolate, setIsolate] = useState(searchParams.get("isolate") === "1");
  const [view, setView] = useState<string | null>(() => {
    const initial = searchParams.get("view");
    return initial && ["front", "side", "back", "macro"].includes(initial) ? initial : null;
  });
  const [viewRequest, setViewRequest] = useState<{ view: string; seq: number } | null>(() =>
    view ? { view, seq: 1 } : null,
  );
  const [zoomRequest, setZoomRequest] = useState<{ dir: 1 | -1; seq: number } | null>(null);
  // 精致标本鉴赏模式(?hd=1):无热点/图层,聚焦或器官操作自动退出
  const [fine, setFine] = useState(searchParams.get("hd") === "1");
  const [fineZoom, setFineZoom] = useState<{ dir: 1 | -1; seq: number } | null>(null);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [rigNudge, setRigNudge] = useState(0);
  const [rigHalt, setRigHalt] = useState(() => (searchParams.get("view") ? 1 : 0));
  const [openPanel, setOpenPanel] = useState<"view" | "layers" | null>(null);
  // 小屏:点标注点直接进器官模式(浮卡在小屏上遮挡)
  const [smallScreen, setSmallScreen] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const onChange = () => setSmallScreen(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  // 首屏海报先行(交互方案 v3 §4 冷启动):三维就绪前铺默认机位的静态海报,就绪后 300 ms 淡出
  const [ready, setReady] = useState(false);
  const [posterGone, setPosterGone] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const handle = window.setTimeout(() => setPosterGone(true), 400);
    return () => window.clearTimeout(handle);
  }, [ready]);
  const posterEligible =
    species === "apis-mellifera" && caste === "worker" && !compare && !organId && focus === "whole";
  // 引导讲解(交互方案 v3 §4.7):?tour=N 直接进入第 N 站
  const [tour, setTour] = useState<{ phase: "intro" | "run" | "outro"; step: number } | null>(() => {
    const raw = Number(searchParams.get("tour"));
    return Number.isInteger(raw) && raw >= 1 && raw <= 5 ? { phase: "run", step: raw - 1 } : null;
  });
  const [tourAuto, setTourAuto] = useState(false);
  const [tourIsolate, setTourIsolate] = useState(true);
  const preTour = useRef<{ focus: BeeFocusId; organId: string | null; isolate: boolean } | null>(null);
  // 底部扩展卡:手机默认 2 张 + "更多",展开状态记在会话内
  const [moreOpen, setMoreOpen] = useState(() => {
    try {
      return sessionStorage.getItem("wb-more-open") === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem("wb-more-open", moreOpen ? "1" : "0");
    } catch {
      /* 隐私模式等无存储时忽略 */
    }
  }, [moreOpen]);
  // 小屏进入器官模式后,把档案卡滚进视口
  useEffect(() => {
    if (!smallScreen || !organId) return;
    document.querySelector(".wb-dossier")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [smallScreen, organId]);

  const speciesRecord = beeSpecies[species];
  const availableCastes = speciesCastes[species];
  const content = speciesContent[species];
  const focusList = content.focus(caste);
  const casteLabel = (id: BeeCaste) =>
    casteLabelOverrides[species]?.[id] ?? westernHoneyBeeCastes[id].name;
  const current = focusList.find((item) => item.id === focus) ?? focusList[0];
  const organsForCaste = content.organs.filter((organ) => organ.castes.includes(caste));
  const pollenAvailable = caste === "worker" && POLLEN_BEARING.has(species);
  const currentOrgan = organsForCaste.find((organ) => organ.id === organId) ?? null;
  const fineUrl = FINE_MODELS[species]?.[caste] ?? null;
  const fineActive = fine && !compare && Boolean(fineUrl);
  useEffect(() => {
    // 精模是纯鉴赏:任何聚焦/器官/比较操作都退出精模,回标准标本
    if (fine && (organId || focus !== "whole" || compare)) setFine(false);
  }, [fine, organId, focus, compare]);
  const enterFine = () => {
    setFocus("whole");
    setOrganId(null);
    setIsolate(false);
    setOpenPanel(null);
    setFine(true);
  };
  // 讲解站 → 部位;器官直链/选中时,镜头与隔离都以器官所属部位为目标
  const touring = tour?.phase === "run" && !compare;
  const stations = focusList;
  const station = touring ? stations[Math.min(tour.step, stations.length - 1)] : null;
  const effectiveFocus: BeeFocusId = station
    ? station.id
    : currentOrgan
      ? (currentOrgan.focusId as BeeFocusId)
      : focus;
  const effectiveIsolate = touring ? tourIsolate : isolate;
  const story = useMemo(
    () => Object.values(lifeCycles).find((cycle) => cycle.speciesId === species),
    [species],
  );

  usePageTitle(
    compare ? `${speciesRecord.name} · 职型比较` : `${speciesRecord.name} · ${casteLabel(caste)}标本`,
  );

  // 该蜂种的展出条目数与整体审校状态(来源卡)
  const speciesReview = useMemo(() => {
    const statuses: ReviewStatus[] = [
      speciesRecord.reviewStatus,
      ...availableCastes.flatMap((c) => content.focus(c).map((item) => item.reviewStatus)),
      ...content.organs.map((organ) => organ.reviewStatus),
      ...(compareRowsBySpecies[species] ?? []).map((row) => row.reviewStatus),
    ];
    const order: ReviewStatus[] = ["draft", "ai-reviewed", "reviewed", "verified"];
    const lowest = statuses.reduce<ReviewStatus>(
      (min, st) => (order.indexOf(st) < order.indexOf(min) ? st : min),
      "verified",
    );
    return { count: statuses.length, lowest };
  }, [species, speciesRecord, availableCastes, content]);

  // 展品状态 → URL;全默认时回到 `/`
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
    if (hiddenLayers.length > 0) next.set("hide", hiddenLayers.join(","));
    if (isolate && !compare && (organId || focus !== "whole")) next.set("isolate", "1");
    if (view) next.set("view", view);
    if (fineActive) next.set("hd", "1");
    if (touring && tour) next.set("tour", String(tour.step + 1));
    const search = next.toString();
    const target =
      species === "apis-mellifera" && !search
        ? "/"
        : `/museum/bees/${species}${search ? `?${search}` : ""}`;
    if (location.pathname + location.search !== target) navigate(target, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [species, caste, focus, compare, organId, motion, hiddenLayers, isolate, view, touring, tour, fineActive, VR_VIEW, location.pathname, location.search, navigate]);

  const changeFocus = (next: BeeFocusId) => {
    setFocus(next);
    setOrganId(null);
  };
  const changeCaste = (next: BeeCaste) => {
    if (tour) {
      preTour.current = null;
      setTour(null);
      setTourAuto(false);
    }
    setCompare(false);
    setCaste(next);
    setFocus("whole");
    setOrganId(null);
  };
  const changeSpecies = (next: BeeSpeciesId) => {
    if (tour) {
      preTour.current = null;
      setTour(null);
      setTourAuto(false);
    }
    setSpecies(next);
    setCaste("worker");
    setCompare(false);
    setFocus("whole");
    setOrganId(null);
    setIsolate(false);
  };
  const applyView = (next: string | null) => {
    setView(next);
    setOpenPanel(null);
    if (next) {
      setViewRequest((request) => ({ view: next, seq: (request?.seq ?? 0) + 1 }));
      setRigHalt((seq) => seq + 1);
    } else {
      setRigNudge((seq) => seq + 1);
      setZoomedIn(false);
    }
  };
  const toggleZoom = () => {
    setZoomRequest((request) => ({ dir: zoomedIn ? -1 : 1, seq: (request?.seq ?? 0) + 1 }));
    setZoomedIn((value) => !value);
    setRigHalt((seq) => seq + 1);
  };
  const toggleLayer = (layer: string) => {
    setHiddenLayers((prev) =>
      prev.includes(layer) ? prev.filter((id) => id !== layer) : [...prev, layer],
    );
  };
  const startTour = () => {
    if (compare) return;
    setOpenPanel(null);
    setTour({ phase: "intro", step: 0 });
  };
  const beginTour = () => {
    preTour.current = { focus, organId, isolate };
    setOrganId(null);
    setOpenPanel(null);
    setTour({ phase: "run", step: 0 });
  };
  const tourNext = () =>
    setTour((current) => {
      if (!current) return current;
      if (current.step + 1 < stations.length) return { phase: "run", step: current.step + 1 };
      return { phase: "outro", step: current.step };
    });
  const tourPrev = () =>
    setTour((current) => (current && current.step > 0 ? { phase: "run", step: current.step - 1 } : current));
  const exitTour = () => {
    const saved = preTour.current;
    if (saved) {
      setFocus(saved.focus);
      setOrganId(saved.organId);
      setIsolate(saved.isolate);
    } else {
      setFocus("whole");
    }
    preTour.current = null;
    setTour(null);
    setTourAuto(false);
    setRigNudge((seq) => seq + 1);
  };
  // 讲解态键盘:← → 切站,Esc 退出
  useEffect(() => {
    if (!tour) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") exitTour();
      if (tour.phase !== "run") return;
      if (event.key === "ArrowRight") tourNext();
      if (event.key === "ArrowLeft") tourPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour, stations.length]);
  // 自动播放:每站 12 s
  useEffect(() => {
    if (!touring || !tourAuto) return;
    const handle = window.setTimeout(tourNext, 12_000);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touring, tourAuto, tour?.step]);
  // 切蜂种/职型/进比较台时结束讲解
  useEffect(() => {
    if (tour && compare) exitTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compare]);
  const resetAll = () => {
    setFocus("whole");
    setOrganId(null);
    setIsolate(false);
    setHiddenLayers([]);
    setView(null);
    setZoomedIn(false);
    setOpenPanel(null);
    setRigNudge((seq) => seq + 1);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const enterCompare = () => {
    setCompare(true);
    setOrganId(null);
  };
  const exitCompare = () => setCompare(false);

  const stageCanvas = (
    <Suspense fallback={<div className="loading-mark">正在唤醒观察标本…</div>}>
      <Canvas
        shadows="basic"
        frameloop={VR_VIEW ? "demand" : "always"}
        dpr={VR_VIEW ? 1 : [1, 1.7]}
        camera={{ position: [0, 0.1, 7.4], fov: 34 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        {compare ? (
          <CompareStage species={species} motion={motion} interactive={!VR_VIEW} />
        ) : fineActive && fineUrl ? (
          <FineSpecimenStage url={fineUrl} motion={motion} zoomRequest={fineZoom} />
        ) : (
          <WesternHoneyBeeViewer
            species={species}
            caste={caste}
            focus={effectiveFocus}
            onFocus={setFocus}
            motion={motion}
            organs={organsForCaste}
            onSelectOrgan={touring ? () => undefined : setOrganId}
            fixedView={VR_VIEW}
            hiddenLayers={hiddenLayers}
            isolate={effectiveIsolate}
            selectedOrganId={touring ? null : organId}
            viewRequest={viewRequest}
            zoomRequest={zoomRequest}
            rigNudge={rigNudge}
            rigHalt={rigHalt}
            hotspotMode={smallScreen ? "direct" : "popover"}
            onReady={setReady}
          />
        )}
      </Canvas>
    </Suspense>
  );

  // 测试模式:沿用原标本馆的舞台容器与尺寸,保证视觉基线不变
  if (VR_VIEW) {
    return (
      <main className="observatory-shell">
        <section className="bee-stage" aria-label="可交互蜜蜂三维观察区">
          {stageCanvas}
        </section>
      </main>
    );
  }

  return (
    <div className={`workbench${touring ? " touring" : ""}`}>
      <SkipLink />
      <SiteHeader />
      <main id="main" className="wb-body">
        <WorkbenchLibrary
          species={species}
          caste={caste}
          compare={compare}
          casteLabel={casteLabel}
          onSelectSpecies={changeSpecies}
          onSelectCaste={changeCaste}
          onCompare={enterCompare}
        />

        <section
          className="wb-stage"
          aria-label="可交互蜜蜂三维观察区"
          data-tour-focus={station ? station.id : undefined}
        >
          {/* 窄屏(左栏隐藏时)的蜂种/职型切换 */}
          <nav className="species-switch wb-narrow-only" aria-label="选择蜂种">
            {BEE_SPECIES_IDS.map((id) => (
              <button
                key={id}
                className={species === id ? "active" : ""}
                onClick={() => changeSpecies(id)}
                aria-pressed={species === id}
              >
                {beeSpecies[id].name}
              </button>
            ))}
          </nav>
          {availableCastes.length > 1 && (
            <nav className="caste-switch wb-narrow-only" aria-label="选择职型或比较">
              {availableCastes.map((id) => (
                <button
                  key={id}
                  className={!compare && caste === id ? "active" : ""}
                  onClick={() => changeCaste(id)}
                  aria-pressed={!compare && caste === id}
                >
                  {casteLabel(id)}
                </button>
              ))}
              <button className={compare ? "active" : ""} onClick={enterCompare} aria-pressed={compare}>
                对比
              </button>
            </nav>
          )}

          {!compare && !touring && fineActive && (
            <div className="wb-tools" role="toolbar" aria-label="观察工具(精致标本)">
              <button className="active" aria-pressed="true" onClick={() => setFine(false)}>
                <ToolIcon id="fine" />
                <span>精模</span>
              </button>
              <button aria-label="放大" onClick={() => setFineZoom({ dir: 1, seq: Date.now() })}>
                <span className="fl-glyph" aria-hidden="true">＋</span>
                <span>放大</span>
              </button>
              <button aria-label="缩小" onClick={() => setFineZoom({ dir: -1, seq: Date.now() + 1 })}>
                <span className="fl-glyph" aria-hidden="true">－</span>
                <span>缩小</span>
              </button>
            </div>
          )}
          {!compare && !touring && !fineActive && (
            <div className="wb-tools" role="toolbar" aria-label="观察工具">
              <div className="wb-tool-wrap">
                <button
                  className={view ? "active" : ""}
                  aria-expanded={openPanel === "view"}
                  onClick={() => setOpenPanel((panel) => (panel === "view" ? null : "view"))}
                >
                  <ToolIcon id="view" />
                  <span>视角</span>
                </button>
                {openPanel === "view" && (
                  <div className="wb-popover" role="menu" aria-label="选择机位">
                    {VIEW_OPTIONS.map(([label, value]) => (
                      <button
                        key={label}
                        role="menuitem"
                        className={view === value ? "active" : ""}
                        onClick={() => applyView(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className={zoomedIn ? "active" : ""} aria-pressed={zoomedIn} onClick={toggleZoom}>
                <ToolIcon id="zoom" />
                <span>{zoomedIn ? "还原" : "放大"}</span>
              </button>
              <button
                className={isolate ? "active" : ""}
                aria-pressed={isolate}
                disabled={effectiveFocus === "whole"}
                title={effectiveFocus === "whole" ? "先点一个部位或圆点" : "只显示当前部位"}
                onClick={() => setIsolate((value) => !value)}
              >
                <ToolIcon id="isolate" />
                <span>单独显示</span>
              </button>
              <div className="wb-tool-wrap">
                <button
                  className={hiddenLayers.length > 0 ? "active" : ""}
                  aria-expanded={openPanel === "layers"}
                  onClick={() => setOpenPanel((panel) => (panel === "layers" ? null : "layers"))}
                >
                  <ToolIcon id="layers" />
                  <span>图层</span>
                  {hiddenLayers.length > 0 && <i className="wb-badge">{hiddenLayers.length}</i>}
                </button>
                {openPanel === "layers" && (
                  <div className="wb-popover wb-layer-panel" aria-label="图层开关">
                    {LAYER_DEFS.map((layer) => {
                      const unavailable = layer.id === "pollen" && !pollenAvailable;
                      const visible = !hiddenLayers.includes(layer.id);
                      return (
                        <label key={layer.id} className={unavailable ? "disabled" : ""}>
                          <input
                            type="checkbox"
                            checked={visible && !unavailable}
                            disabled={unavailable}
                            onChange={() => toggleLayer(layer.id)}
                          />
                          <span>{layer.label}</span>
                          {unavailable && <i>这只蜂不携带花粉团</i>}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              {availableCastes.length > 1 && (
                <button onClick={enterCompare}>
                  <ToolIcon id="compare" />
                  <span>比较</span>
                </button>
              )}
              {fineUrl && (
                <button onClick={enterFine} title="独立制作的高保真标本,纯鉴赏">
                  <ToolIcon id="fine" />
                  <span>精模</span>
                </button>
              )}
              <button onClick={resetAll}>
                <ToolIcon id="reset" />
                <span>重置</span>
              </button>
            </div>
          )}
          {stageCanvas}
          {!posterGone && !fineActive && (
            <div className={`wb-poster${ready ? " out" : ""}`} aria-hidden="true">
              {posterEligible && <img src={asset("/images/poster-default.png")} alt="" />}
              {!ready && <span className="wb-poster-note">正在唤醒标本…</span>}
            </div>
          )}
          <div className="stage-vignette" aria-hidden="true" />
          <div className="stage-caption" aria-hidden="true">
            3D SPECIMEN · {compare ? "同一比例尺" : fineActive ? "精致标本 · 纯鉴赏" : "点圆点看器官"}
          </div>

          {touring && station && tour && (
            <TourBar
              step={tour.step}
              total={stations.length}
              station={station}
              isolate={tourIsolate}
              auto={tourAuto}
              onPrev={tourPrev}
              onNext={tourNext}
              onExit={exitTour}
              onToggleIsolate={() => setTourIsolate((value) => !value)}
              onToggleAuto={() => setTourAuto((value) => !value)}
            />
          )}
          {!compare && !touring && (
            <nav className="wb-focus-strip" aria-label="选择观察部位">
              {focusList.map((item) => (
                <button
                  key={item.id}
                  className={focus === item.id ? "active" : ""}
                  onClick={() => changeFocus(item.id)}
                  aria-pressed={focus === item.id}
                  title={item.title}
                >
                  <FocusGlyph id={item.id} />
                  <b>{item.short}</b>
                </button>
              ))}
            </nav>
          )}
        </section>

        <SpecimenDossier
          species={species}
          speciesRecord={speciesRecord}
          caste={caste}
          casteLabel={casteLabel}
          compare={compare}
          focus={focus}
          current={current}
          focusList={focusList}
          organsForCaste={organsForCaste}
          currentOrgan={currentOrgan}
          motion={motion}
          storyId={story?.id ?? null}
          multiCaste={availableCastes.length > 1}
          onBackToWhole={() => changeFocus("whole")}
          onSelectOrgan={setOrganId}
          onNextFocus={() => changeFocus(nextInList(focusList, focus))}
          onToggleMotion={() => setMotion((value) => !value)}
          onCompare={enterCompare}
          onExitCompare={exitCompare}
          onStartTour={startTour}
        />
      </main>
      {tour?.phase === "intro" && (
        <TourModal
          kicker="导览"
          title={`认识一只${speciesRecord.name}${casteLabel(caste)}`}
          text="跟着 5 站,从整体到头、翅、腹、足,把这件标本看一遍。随时可以拖动模型;按 → 进入下一站,Esc 退出。"
          meta={`${stations.length} 站 · 约 2 分钟`}
          onClose={exitTour}
          actions={[
            { label: "稍后", onClick: exitTour },
            { label: "开始", onClick: beginTour, primary: true },
          ]}
        />
      )}
      {tour?.phase === "outro" && (
        <TourModal
          kicker="导览结束"
          title={`看完了一只${speciesRecord.name}${casteLabel(caste)}`}
          text="接着看什么?"
          meta={`${stations.length} 站已走完`}
          onClose={exitTour}
          actions={[
            ...(availableCastes.length > 1
              ? [{ label: "三职型比较", onClick: () => { exitTour(); enterCompare(); } }]
              : []),
            ...(story ? [{ label: story.title, to: `/museum/life-cycle/${story.id}` }] : []),
            { label: "退出", onClick: exitTour, primary: true },
          ]}
        />
      )}
      <ExtensionCards
        species={species}
        multiCaste={availableCastes.length > 1}
        storyId={story?.id ?? null}
        review={speciesReview}
        moreOpen={moreOpen}
        onToggleMore={() => setMoreOpen((value) => !value)}
        onMacro={() => {
          applyView("macro");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onCompare={() => {
          enterCompare();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSizeDifference={() => {
          changeFocus("head");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}

function nextInList(focusList: BeeFocusItem[], current: BeeFocusId): BeeFocusId {
  const index = focusList.findIndex((item) => item.id === current);
  return focusList[(index + 1) % focusList.length].id;
}

// ---------------------------------------------------------------- 左栏 · 馆藏

function WorkbenchLibrary({
  species,
  caste,
  compare,
  casteLabel,
  onSelectSpecies,
  onSelectCaste,
  onCompare,
}: {
  species: BeeSpeciesId;
  caste: BeeCaste;
  compare: boolean;
  casteLabel: (id: BeeCaste) => string;
  onSelectSpecies: (id: BeeSpeciesId) => void;
  onSelectCaste: (id: BeeCaste) => void;
  onCompare: () => void;
}) {
  const [tab, setTab] = useState<"species" | "halls">("species");
  const libraryHalls = LIBRARY_HALL_IDS.map((id) => halls.find((hall) => hall.id === id)).filter(
    (hall): hall is NonNullable<typeof hall> => Boolean(hall),
  );

  return (
    <aside className="wb-panel wb-library" aria-label="馆藏">
      <div className="wb-panel-head">
        <span className="wb-kicker">馆藏 · COLLECTION</span>
        <div className="wb-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "species"} className={tab === "species" ? "active" : ""} onClick={() => setTab("species")}>
            蜂种
          </button>
          <button role="tab" aria-selected={tab === "halls"} className={tab === "halls" ? "active" : ""} onClick={() => setTab("halls")}>
            展厅
          </button>
        </div>
      </div>

      {tab === "species" ? (
        <ul className="wb-species-list">
          {BEE_SPECIES_IDS.map((id) => {
            const record = beeSpecies[id];
            const active = id === species;
            const castes = speciesCastes[id];
            return (
              <li key={id} className={active ? "active" : ""}>
                <button className="wb-species-row" onClick={() => onSelectSpecies(id)} aria-pressed={active}>
                  <img src={asset(`/images/thumbs/${id}.png`)} alt="" width={56} height={56} loading="lazy" />
                  <span>
                    <b>{record.name}</b>
                    <i>{record.family.split(" ")[0]} · {record.scientificName}</i>
                  </span>
                </button>
                {active && castes.length > 1 && (
                  <div className="wb-caste-chips" role="group" aria-label="选择职型或比较">
                    {castes.map((c) => (
                      <button
                        key={c}
                        className={!compare && caste === c ? "active" : ""}
                        onClick={() => onSelectCaste(c)}
                        aria-pressed={!compare && caste === c}
                      >
                        {casteLabel(c)}
                      </button>
                    ))}
                    <button className={compare ? "active" : ""} onClick={onCompare} aria-pressed={compare}>
                      对比
                    </button>
                  </div>
                )}
                {active && castes.length === 1 && (
                  <div className="wb-caste-chips" aria-hidden="true">
                    <button className="active" disabled>
                      {casteLabel("worker")}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="wb-hall-list">
          {libraryHalls.map((hall) => (
            <li key={hall.id}>
              <Link to={hall.path} className="wb-hall-row">
                <b>
                  {hall.name}
                  {hall.status === "planned" && <em>筹备中</em>}
                </b>
                <span>{hall.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------- 引导讲解

function TourBar({
  step,
  total,
  station,
  isolate,
  auto,
  onPrev,
  onNext,
  onExit,
  onToggleIsolate,
  onToggleAuto,
}: {
  step: number;
  total: number;
  station: BeeFocusItem;
  isolate: boolean;
  auto: boolean;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
  onToggleIsolate: () => void;
  onToggleAuto: () => void;
}) {
  const touchStart = useRef<number | null>(null);
  return (
    <div
      className="wb-tour-bar"
      role="dialog"
      aria-label="讲解"
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (start === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? start) - start;
        if (delta < -50) onNext();
        if (delta > 50) onPrev();
      }}
    >
      <div className="wb-tour-head" aria-live="polite">
        <span>
          第 {step + 1}/{total} 站 · {station.short}
        </span>
        <b>{station.title}</b>
      </div>
      <p>{station.description}</p>
      <details className="wb-tour-more">
        <summary>多看一眼</summary>
        <p>{station.fact}</p>
        <Provenance sourceIds={station.sourceIds} reviewStatus={station.reviewStatus} />
      </details>
      <div className="wb-tour-controls">
        <button onClick={onPrev} disabled={step === 0}>
          ← 上一站
        </button>
        <ol className="wb-tour-dots" aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <li key={index} className={index === step ? "active" : index < step ? "done" : ""} />
          ))}
        </ol>
        <button className="primary" onClick={onNext}>
          {step === total - 1 ? "看完了 →" : "下一站 →"}
        </button>
      </div>
      <div className="wb-tour-aux">
        <label>
          <input type="checkbox" checked={isolate} onChange={onToggleIsolate} /> 只看这一部位
        </label>
        <label>
          <input type="checkbox" checked={auto} onChange={onToggleAuto} /> 自动播放
        </label>
        <button className="wb-tour-exit" onClick={onExit}>
          退出讲解
        </button>
      </div>
    </div>
  );
}

function TourModal({
  kicker,
  title,
  text,
  meta,
  actions,
  onClose,
}: {
  kicker: string;
  title: string;
  text: string;
  meta: string;
  actions: Array<{ label: string; primary?: boolean } & ({ onClick: () => void } | { to: string })>;
  onClose: () => void;
}) {
  return (
    <div className="wb-modal-backdrop" onClick={onClose}>
      <div
        className="wb-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wb-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="wb-eyebrow">{kicker}</p>
        <h2 id="wb-modal-title">{title}</h2>
        <p className="wb-modal-text">{text}</p>
        <p className="wb-modal-meta">{meta}</p>
        <div className="wb-modal-actions">
          {actions.map((action) =>
            "to" in action ? (
              <Link key={action.label} className={action.primary ? "primary" : ""} to={action.to}>
                {action.label}
              </Link>
            ) : (
              <button key={action.label} className={action.primary ? "primary" : ""} onClick={action.onClick}>
                {action.label}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 底部 · 扩展卡

interface ExtensionCard {
  id: string;
  kicker: string;
  title: string;
  text: string;
  image?: string;
  action: { label: string } & ({ to: string } | { onClick: () => void });
  planned?: boolean;
  /** 手机默认可见(其余收进"更多") */
  primary?: boolean;
  badge?: ReviewStatus;
}

/** 底部扩展卡(交互方案 v3 §4.6):随蜂种变化的知识网络入口 */
function ExtensionCards({
  species,
  multiCaste,
  storyId,
  review,
  moreOpen,
  onToggleMore,
  onMacro,
  onCompare,
  onSizeDifference,
}: {
  species: BeeSpeciesId;
  multiCaste: boolean;
  storyId: string | null;
  review: { count: number; lowest: ReviewStatus };
  moreOpen: boolean;
  onToggleMore: () => void;
  onMacro: () => void;
  onCompare: () => void;
  onSizeDifference: () => void;
}) {
  const record = beeSpecies[species];
  const fallbackStory = lifeCycles["cycle-apis-mellifera-worker"];
  const storyCard = storyId ? lifeCycles[storyId] : fallbackStory;
  const cards: ExtensionCard[] = [
    {
      id: "macro",
      kicker: "MICRO VIEW · 微距",
      title: "贴近看绒毛与翅钩",
      text: "把镜头推到毫米尺度,看清分叉的体毛、翅膜上的脉络与前后翅的钩连。",
      image: species === "apis-mellifera" ? asset("/images/cards/macro-apis-mellifera.png") : asset(`/images/thumbs/${species}.png`),
      action: { label: "看微距", onClick: onMacro },
    },
    ...(multiCaste
      ? [
          {
            id: "compare",
            kicker: "COMPARE · 三职型",
            title: "工蜂 × 蜂王 × 雄蜂",
            text: "同一群体的三种身体方案,按真实体长比例并排。",
            image: asset(`/images/cards/compare-${species}.png`),
            action: { label: "打开比较台", onClick: onCompare },
            primary: true,
          } satisfies ExtensionCard,
        ]
      : species === "bombus-terrestris"
        ? [
            {
              id: "size",
              kicker: "SIZE RANGE · 体型差异",
              title: "同一巢里,大小相差数倍",
              text: "熊蜂工蜂的体型差异极大:胸部大小可差约 3 倍,体重可差近十倍。",
              image: asset("/images/cards/size-bombus-terrestris.png"),
              action: { label: "看差异", onClick: onSizeDifference },
              primary: true,
            } satisfies ExtensionCard,
          ]
        : []),
    {
      id: "cycle",
      kicker: "LIFE CYCLE · 生命历程",
      title: storyCard.title,
      text: storyId ? storyCard.subtitle : `${record.name}暂无专属时间线,先看西方蜜蜂工蜂的一生。`,
      image: asset(`/images/cards/${storyCard.id}.png`),
      action: { label: "播放一生", to: `/museum/life-cycle/${storyCard.id}` },
      primary: true,
    },
    {
      id: "flowers",
      kicker: "FLOWERS · 花朵与四季",
      title: "它访哪些花",
      text: "7 种蜜源花的结构与 3 个地域的春夏花期;点一只蜂,看它落到花上。",
      action: { label: "走进花田", to: "/museum/flowers" },
    },
    {
      id: "sources",
      kicker: "SOURCES · 来源与审校",
      title: `${review.count} 条内容的依据`,
      text: "每句话来自哪里、经过了怎样的审查、还有哪些没做到。",
      badge: review.lowest,
      action: { label: "查看依据", to: "/sources" },
    },
    {
      id: "honey",
      kicker: "HONEY · 蜂蜜工坊",
      title: "一滴花蜜的旅程",
      text: "采集、携带、交接、转化、浓缩、封盖——六站走完一格蜜。",
      action: { label: "走进工坊", to: "/museum/honey-workshop" },
    },
  ];
  const hiddenCount = cards.filter((card) => !card.primary).length;

  return (
    <section className={`wb-extensions${moreOpen ? " open" : ""}`} aria-label="延伸探索">
      {cards.map((card) => (
        <article key={card.id} className={`wb-card${card.planned ? " planned" : ""}${card.primary ? " primary" : " extra"}`}>
          <p className="wb-card-kicker">{card.kicker}</p>
          <h3>{card.title}</h3>
          {card.image ? (
            <img src={card.image} alt="" loading="lazy" />
          ) : card.badge ? (
            <div className="wb-card-figure">
              <span className={`review-badge review-${card.badge}`}>{REVIEW_STATUS_LABEL[card.badge]}</span>
            </div>
          ) : (
            <div className="wb-card-figure placeholder" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          )}
          <p>{card.text}</p>
          {"to" in card.action ? (
            <Link className="wb-card-action" to={card.action.to}>
              {card.action.label} <span>→</span>
            </Link>
          ) : (
            <button className="wb-card-action" onClick={card.action.onClick}>
              {card.action.label} <span>→</span>
            </button>
          )}
        </article>
      ))}
      <button
        className="wb-more"
        onClick={onToggleMore}
        aria-expanded={moreOpen}
        aria-controls="wb-extensions"
      >
        {moreOpen ? "收起" : `更多 (${hiddenCount})`}
      </button>
    </section>
  );
}

// ---------------------------------------------------------------- 右栏 · 档案卡

function SpecimenDossier({
  species,
  speciesRecord,
  caste,
  casteLabel,
  compare,
  focus,
  current,
  focusList,
  organsForCaste,
  currentOrgan,
  motion,
  storyId,
  multiCaste,
  onBackToWhole,
  onSelectOrgan,
  onNextFocus,
  onToggleMotion,
  onCompare,
  onExitCompare,
  onStartTour,
}: {
  species: BeeSpeciesId;
  speciesRecord: (typeof beeSpecies)[BeeSpeciesId];
  caste: BeeCaste;
  casteLabel: (id: BeeCaste) => string;
  compare: boolean;
  focus: BeeFocusId;
  current: BeeFocusItem;
  focusList: BeeFocusItem[];
  organsForCaste: OrganEntry[];
  currentOrgan: OrganEntry | null;
  motion: boolean;
  storyId: string | null;
  multiCaste: boolean;
  onBackToWhole: () => void;
  onSelectOrgan: (id: string | null) => void;
  onNextFocus: () => void;
  onToggleMotion: () => void;
  onCompare: () => void;
  onExitCompare: () => void;
  onStartTour: () => void;
}) {
  const presentation = westernHoneyBeeCastes[caste];
  const wholeEntry = focusList.find((item) => item.id === "whole") ?? focusList[0];
  const motionToggle = (
    <button className="motion-toggle" onClick={onToggleMotion} aria-pressed={motion}>
      <span className={motion ? "pause-icon" : "play-icon"} />
      {motion ? "暂停生命动作" : "恢复生命动作"}
    </button>
  );

  // ---- 比较模式 ----
  if (compare) {
    const rows = compareRowsBySpecies[species] ?? [];
    return (
      <aside className="wb-panel wb-dossier" aria-label="展品档案">
        <button className="wb-back" onClick={onExitCompare}>
          ← 回到标本
        </button>
        <p className="wb-eyebrow">COMPARISON · CASTES</p>
        <p className="latin">{speciesRecord.scientificName} · worker × queen × drone</p>
        <h1>同一群体,三种身体方案</h1>
        <div className="compare-table" role="table" aria-label="三职型对照表">
          <div className="compare-row compare-head" role="row">
            <span role="columnheader">维度</span>
            <span role="columnheader">工蜂</span>
            <span role="columnheader">蜂王</span>
            <span role="columnheader">雄蜂</span>
          </div>
          {rows.map((row) => (
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
          sourceIds={[...new Set(rows.flatMap((row) => row.sourceIds))]}
          reviewStatus={rows.every((row) => row.reviewStatus !== "draft") ? "ai-reviewed" : "draft"}
        />
        <div className="card-actions">{motionToggle}</div>
      </aside>
    );
  }

  // ---- 器官模式 ----
  if (currentOrgan) {
    const index = organsForCaste.indexOf(currentOrgan);
    const next = organsForCaste[(index + 1) % organsForCaste.length];
    return (
      <aside className="wb-panel wb-dossier" aria-label="器官说明" key={currentOrgan.id}>
        <button className="wb-back" onClick={() => onSelectOrgan(null)}>
          ← 回到{focus === "whole" ? "整体" : "部位"}
        </button>
        <p className="wb-eyebrow">
          ORGAN / {String(index + 1).padStart(2, "0")} · {organsForCaste.length} 个器官
        </p>
        {currentOrgan.latinName && <p className="latin">{currentOrgan.latinName}</p>}
        <h1>{currentOrgan.name}</h1>
        <p className="description">{currentOrgan.summary}</p>
        <p className="organ-function">
          <span>功能</span>
          {currentOrgan.functionNote}
        </p>
        {currentOrgan.modelNote && <p className="organ-model-note">{currentOrgan.modelNote}</p>}
        <Provenance sourceIds={currentOrgan.sourceIds} reviewStatus={currentOrgan.reviewStatus} />
        <div className="card-actions">
          {motionToggle}
          <button className="next-focus" onClick={() => onSelectOrgan(next.id)}>
            下一个器官 <span>→</span>
          </button>
        </div>
      </aside>
    );
  }

  // ---- 部位模式 ----
  if (focus !== "whole") {
    return (
      <aside className="wb-panel wb-dossier" aria-label="观察条目" key={current.id}>
        <button className="wb-back" onClick={onBackToWhole}>
          ← 回到整体
        </button>
        <p className="wb-eyebrow">OBSERVATION / {current.index}</p>
        <p className="latin">{current.latin}</p>
        <h1>{current.title}</h1>
        <p className="description">{current.description}</p>
        <div className="field-note">
          <span>观察笔记</span>
          <p>{current.fact}</p>
        </div>
        <Provenance sourceIds={current.sourceIds} reviewStatus={current.reviewStatus} />
        <div className="card-actions">
          {motionToggle}
          <button className="next-focus" onClick={onNextFocus}>
            下一个部位 <span>→</span>
          </button>
        </div>
      </aside>
    );
  }

  // ---- 整体模式 ----
  const factRows: Array<{ label: string; value: string; tone: string }> = [
    {
      label: casteLabelOverrides[species] ? "雌蜂体长" : "工蜂体长",
      value: `约 ${speciesRecord.workerBodyLengthMm.min}–${speciesRecord.workerBodyLengthMm.max} mm`,
      tone: "whole",
    },
    { label: "科属", value: speciesRecord.family, tone: "head" },
    { label: "分布", value: speciesRecord.distribution, tone: "wing" },
    { label: "社会结构", value: speciesRecord.socialStructure, tone: "abdomen" },
    { label: "筑巢", value: speciesRecord.nesting, tone: "leg" },
  ];
  return (
    <aside className="wb-panel wb-dossier" aria-label="展品档案" key={`${species}-${caste}`}>
      <p className="wb-eyebrow">THE SPECIMEN · {speciesRecord.englishName.toUpperCase()}</p>
      <h1>
        {speciesRecord.name}
        <small> · {casteLabel(caste)}</small>
      </h1>
      <p className="latin">
        {speciesRecord.scientificName} · {presentation.english}
      </p>
      <p className="wb-tagline">{speciesContent[species].hero || presentation.hero}</p>
      <p className="description">{wholeEntry.description}</p>
      <dl className="wb-facts">
        {factRows.map((row) => (
          <div key={row.label} className={`wb-fact tone-${row.tone}`}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="field-note">
        <span>你知道吗</span>
        <p>{wholeEntry.fact}</p>
      </div>
      <Provenance sourceIds={wholeEntry.sourceIds} reviewStatus={wholeEntry.reviewStatus} />
      <button className="button-primary wb-tour-start" onClick={onStartTour}>
        开始讲解 <span>→</span>
      </button>
      <div className="wb-actions">
        {storyId && (
          <Link className="button-ghost" to={`/museum/life-cycle/${storyId}`}>
            看它的生命历程
          </Link>
        )}
        {multiCaste && (
          <button className="button-ghost" onClick={onCompare}>
            职型比较
          </button>
        )}
      </div>
      <div className="card-actions">{motionToggle}</div>
    </aside>
  );
}

/** 工具竖栏图标(线描,继承文字颜色) */
function ToolIcon({ id }: { id: "view" | "zoom" | "isolate" | "layers" | "compare" | "reset" | "fine" }) {
  const paths: Record<string, string> = {
    view: "M12 5C7 5 3.5 9 2.5 12 3.5 15 7 19 12 19s8.5-4 9.5-7C20.5 9 17 5 12 5ZM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    zoom: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.5 15.5 20 20M8 10.5h5M10.5 8v5",
    isolate: "M9 9.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM4 4h3M4 4v3M20 4h-3M20 4v3M4 20h3M4 20v-3M20 20h-3M20 20v-3",
    layers: "M12 4 4 8.5l8 4.5 8-4.5L12 4ZM5 12.5l7 4 7-4M6.5 16l5.5 3 5.5-3",
    compare: "M5 6h6v12H5zM13 6h6v12h-6zM8 10v4M16 10v4",
    reset: "M5 12a7 7 0 1 1 2 5M5 12V7.5M5 12h4.5",
    fine: "M12 4 6.5 9 12 20l5.5-11L12 4ZM6.5 9h11M12 4l-2.2 5L12 20l2.2-11L12 4",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="wb-tool-glyph">
      <path d={paths[id]} />
    </svg>
  );
}

/** 部位剪影图标(线描,继承文字颜色) */
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

export default Workbench;
