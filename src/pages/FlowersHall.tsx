import { useEffect, useMemo, useRef, useState } from "react";
import { asset } from "../lib/asset";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { flowers, FLOWER_IDS } from "../data/flowers";
import { regions, REGION_IDS } from "../data/regions";
import { beeFlowerRelations } from "../data/relations/bee-flower";
import { beeSpecies } from "../data/bees/species-index";
import {
  EVIDENCE_LABEL,
  FLOWER_FORM_LABEL,
  monthInRange,
  RELATION_LABEL,
  SEASON_LABEL,
  type FlowerFocusId,
  type FlowerSpecies,
} from "../data/schemas/content";
import { sourceRecordById } from "../data/sources/records";
import { Provenance } from "../ui/Provenance";
import { SiteHeader, SkipLink, usePageTitle } from "../ui/SiteChrome";
import {
  FlowerViewer,
  preloadFlowerModel,
  type FlowerHotspot,
  type FlowerViewRequest,
  type FlowerZoomRequest,
} from "../three/flowers/FlowerViewer";
import type { FlightStyle, VisitPhase } from "../three/flowers/BeeVisit";

/** 已完成建模的花朵 → GLB 与聚焦距离(cm);未收录的显示"建模中"占位 */
const FLOWER_MODELS: Record<string, { url: string; near?: Record<string, number> }> = {
  "flower-brassica-napus": { url: asset("/models/flower-brassica.glb") },
  "flower-vaccinium-corymbosum": {
    url: asset("/models/flower-vaccinium.glb"),
    near: { center: 7, petal: 3.5, stamen: 3.2, nectar: 4, stem: 15 },
  },
  "flower-trifolium-repens": {
    url: asset("/models/flower-trifolium.glb"),
    near: { center: 6, petal: 3.2, stamen: 3, nectar: 3, stem: 12 },
  },
  "flower-lavandula-angustifolia": {
    url: asset("/models/flower-lavandula.glb"),
    near: { center: 7, petal: 2.8, stamen: 2.6, nectar: 2.6, stem: 16 },
  },
  "flower-medicago-sativa": {
    url: asset("/models/flower-medicago.glb"),
    near: { center: 6, petal: 3, stamen: 2.8, nectar: 2.8, stem: 13 },
  },
  "flower-robinia-pseudoacacia": {
    url: asset("/models/flower-robinia.glb"),
    near: { center: 6.5, petal: 4.5, stamen: 4.5, nectar: 4.5, stem: 18 },
  },
  "flower-helianthus-annuus": {
    url: asset("/models/flower-helianthus.glb"),
    // 花盘直径 ~12cm:聚焦距离要比油菜远得多
    near: { center: 22, petal: 9, stamen: 7, nectar: 7, stem: 24 },
  },
};
const DEFAULT_FLOWER = "flower-brassica-napus";

/** 蜂种 → 飞行性格:熊蜂/木蜂笨重低频,壁蜂/切叶蜂短促直线,蜜蜂属轻快(基准) */
const BEE_FLIGHT: Record<string, FlightStyle> = {
  "apis-mellifera": "nimble",
  "apis-cerana": "nimble",
  "bombus-terrestris": "heavy",
  "xylocopa-violacea": "heavy",
  "osmia-cornifrons": "darting",
  "megachile-rotundata": "darting",
};

/** 后足有花粉筐的蜂(与标本馆 POLLEN_BEARING 口径一致);切叶蜂/壁蜂为腹部集粉,模型无花粉筐节点 */
const POLLEN_BEARING = new Set(["apis-mellifera", "apis-cerana", "bombus-terrestris"]);

/** 各花的花粉颜色(彩蛋:花粉团颜色随花而变) */
const POLLEN_COLORS: Record<string, string> = {
  "flower-brassica-napus": "#e8c231",
  "flower-robinia-pseudoacacia": "#c9b578",
  "flower-helianthus-annuus": "#e39a1c",
  "flower-vaccinium-corymbosum": "#c9ab6e",
  "flower-trifolium-repens": "#8a6b3a",
  "flower-lavandula-angustifolia": "#8d93b8",
  "flower-medicago-sativa": "#b9a76a",
};

/** 花期色带的填充色(纯色花瓣色) */
const BLOOM_BAND_COLORS: Record<string, string> = {
  "flower-brassica-napus": "#e9bd25",
  "flower-robinia-pseudoacacia": "#ded4b8",
  "flower-helianthus-annuus": "#e8a01d",
  "flower-vaccinium-corymbosum": "#e3cfd2",
  "flower-trifolium-repens": "#ddd8bd",
  "flower-lavandula-angustifolia": "#9b7fd4",
  "flower-medicago-sativa": "#7b4fa8",
};

/** 列表花色圆标:用各花花瓣色,给纯文字行一个视觉锚点 */
import { FLOWER_SWATCHES } from "../data/flowers/swatches";
import { honeyVarieties } from "../data/honey";

/** 访花演示可用的蜂精模(与标本馆同一批 GLB,尺度一致) */
const BEE_VISIT_MODELS: Record<string, string> = {
  "apis-mellifera": asset("/models/bee-hero.glb"),
  "apis-cerana": asset("/models/bee-hero-cerana.glb"),
  "bombus-terrestris": asset("/models/bee-hero-bombus.glb"),
  "osmia-cornifrons": asset("/models/bee-hero-osmia.glb"),
  "megachile-rotundata": asset("/models/bee-hero-megachile.glb"),
  "xylocopa-violacea": asset("/models/bee-hero-xylocopa.glb"),
};

const VISIT_PHASE_TEXT: Record<VisitPhase, string> = {
  enter: "飞来了,正绕着花打转",
  hover: "在花前悬停",
  land: "正在降落",
  probe: "落在花上,正在取蜜",
  takeoff: "起飞了",
  done: "飞走了",
};

const HOTSPOT_IDS = ["center", "petal", "stamen", "nectar", "stem"] as const;
type HotspotId = (typeof HOTSPOT_IDS)[number];
const ENTRY_BY_HOTSPOT: Partial<Record<HotspotId, FlowerFocusId>> = {
  petal: "corolla",
  stamen: "stamen",
  stem: "inflorescence",
};
const HOTSPOT_BY_ENTRY: Partial<Record<FlowerFocusId, HotspotId>> = {
  corolla: "petal",
  stamen: "stamen",
  inflorescence: "stem",
};

const VIEW_OPTIONS: [string, string][] = [
  ["整株", "whole"],
  ["主花", "center"],
  ["花蕊", "stamen"],
  ["茎基", "stem"],
];

function firstSentence(text: string) {
  const lead = text.split(/[。;;]/)[0];
  return lead ? lead + "。" : text;
}

function hotspotsFor(flower: FlowerSpecies): FlowerHotspot[] {
  const entry = (id: FlowerFocusId) => flower.entries.find((e) => e.id === id);
  const corolla = entry("corolla");
  const stamen = entry("stamen");
  const inflorescence = entry("inflorescence");
  return [
    {
      id: "center",
      anchor: "anchor_flowerCenter",
      css: "flcenter",
      name: "整朵花",
      latin: flower.scientificName,
      lead: firstSentence(flower.summary),
    },
    ...(corolla
      ? [{
          id: "petal",
          anchor: "anchor_petalFocus",
          css: "flpetal",
          name: "花冠",
          latin: corolla.latin,
          lead: firstSentence(corolla.description),
        }]
      : []),
    ...(stamen
      ? [{
          id: "stamen",
          anchor: "anchor_stamenFocus",
          css: "flstamen",
          name: "花蕊",
          latin: stamen.latin,
          lead: firstSentence(stamen.description),
        }]
      : []),
    {
      id: "nectar",
      anchor: "anchor_nectarEntrance",
      css: "flnectar",
      name: "花蜜入口",
      lead: firstSentence(flower.nectar),
    },
    ...(inflorescence
      ? [{
          id: "stem",
          anchor: "anchor_stemBase",
          css: "flstem",
          name: "花序",
          latin: inflorescence.latin,
          lead: firstSentence(inflorescence.description),
        }]
      : []),
  ];
}

function FlowersHall() {
  usePageTitle("花朵与四季");
  const navigate = useNavigate();
  const params = useParams<{ flowerId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const flowerId = params.flowerId && flowers[params.flowerId] ? params.flowerId : DEFAULT_FLOWER;
  const flower = flowers[flowerId];
  const modelEntry = FLOWER_MODELS[flowerId] ?? null;
  const modelUrl = modelEntry?.url ?? null;
  const motion = searchParams.get("motion") !== "0";

  const initialFocus = (() => {
    const f = searchParams.get("focus");
    return f && (HOTSPOT_IDS as readonly string[]).includes(f) ? (f as HotspotId) : null;
  })();

  const [selected, setSelected] = useState<HotspotId | null>(initialFocus);
  const [focus, setFocus] = useState<{ id: string; seq: number }>({
    id: initialFocus ?? "whole",
    seq: 0,
  });
  const [viewRequest, setViewRequest] = useState<FlowerViewRequest | null>(null);
  const [zoomRequest, setZoomRequest] = useState<FlowerZoomRequest | null>(null);
  const [openPanel, setOpenPanel] = useState<"view" | "visit" | null>(null);
  const [dossierTab, setDossierTab] = useState<"dossier" | "visitors">(
    searchParams.get("panel") === "visitors" ? "visitors" : "dossier",
  );
  // 地域 × 季节筛选(M3 第 5 步):null = 全部
  const [regionSel, setRegionSel] = useState<string | null>(() => {
    const r = searchParams.get("region");
    return r && regions[r] ? r : null;
  });
  const [seasonSel, setSeasonSel] = useState<"spring" | "summer" | null>(() => {
    const v = searchParams.get("season");
    return v === "spring" || v === "summer" ? v : null;
  });

  // URL 同步:?region=&season=
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (regionSel) next.set("region", regionSel);
    else next.delete("region");
    if (seasonSel) next.set("season", seasonSel);
    else next.delete("season");
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionSel, seasonSel]);

  /** 某花在当前筛选下是否"应季开花":地域看有无花期记录,季节看月份是否重叠 */
  const flowerInFilter = (item: FlowerSpecies): boolean => {
    const regionIds = regionSel ? [regionSel] : REGION_IDS;
    return regionIds.some((rid) => {
      const range = item.bloom[rid];
      if (!range) return false;
      if (!seasonSel) return true;
      const seasonRange = regions[rid].seasons[seasonSel];
      if (!seasonRange) return false;
      for (let m = 1; m <= 12; m++) {
        if (monthInRange(m, range) && monthInRange(m, seasonRange)) return true;
      }
      return false;
    });
  };
  const seqRef = useRef(1);
  const smallScreen = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
    [],
  );
  // 手机端筛选抽屉(方案 B:舞台不再常驻筛选条,工具栏"筛选"按钮弹出)
  const [filterOpen, setFilterOpen] = useState(false);
  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filterOpen]);
  const activeFilterCount = (regionSel ? 1 : 0) + (seasonSel ? 1 : 0);
  // 筛选反馈链:在开的花数、生效筛选的文字签、当前花是否不应季(横幅与跳转用)
  const inFilterIds = FLOWER_IDS.filter((id) => flowerInFilter(flowers[id]));
  const filterLabel = [
    regionSel ? regions[regionSel].name : null,
    seasonSel ? `${SEASON_LABEL[seasonSel]}季` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const clearFilters = () => {
    setRegionSel(null);
    setSeasonSel(null);
  };

  const hotspots = useMemo(() => hotspotsFor(flower), [flower]);

  // 访花演示:只列该花有关系记录且有精模的蜂(诚实原则)
  const visitors = useMemo(() => {
    const seen = new Set<string>();
    const list: { beeId: string; name: string; relation: (typeof beeFlowerRelations)[number] }[] = [];
    for (const rel of beeFlowerRelations) {
      if (rel.flowerId !== flowerId || seen.has(rel.beeId)) continue;
      if (!BEE_VISIT_MODELS[rel.beeId]) continue;
      seen.add(rel.beeId);
      list.push({ beeId: rel.beeId, name: beeSpecies[rel.beeId as keyof typeof beeSpecies]?.name ?? rel.beeId, relation: rel });
    }
    return list;
  }, [flowerId]);

  // 谁来访花:当前花的全部关系按蜂分组(诚实原则:只展示有来源的记载);随地域/季节筛选
  const { visitorGroups, filteredOutCount } = useMemo(() => {
    const map = new Map<string, typeof beeFlowerRelations>();
    let filteredOut = 0;
    for (const rel of beeFlowerRelations) {
      if (rel.flowerId !== flowerId) continue;
      if ((regionSel && rel.regionId !== regionSel) || (seasonSel && rel.season !== seasonSel)) {
        filteredOut += 1;
        continue;
      }
      const list = map.get(rel.beeId) ?? [];
      list.push(rel);
      map.set(rel.beeId, list);
    }
    return {
      visitorGroups: Array.from(map.entries()).map(([beeId, rels]) => ({
        beeId,
        name: beeSpecies[beeId as keyof typeof beeSpecies]?.name ?? beeId,
        latin: beeSpecies[beeId as keyof typeof beeSpecies]?.scientificName ?? "",
        rels,
      })),
      filteredOutCount: filteredOut,
    };
  }, [flowerId, regionSel, seasonSel]);

  const initialVisit = (() => {
    const v = searchParams.get("visit");
    return v && visitors.some((x) => x.beeId === v) ? v : null;
  })();
  const [visit, setVisit] = useState<{ beeId: string; seq: number } | null>(
    initialVisit ? { beeId: initialVisit, seq: 1 } : null,
  );
  const [visitPhase, setVisitPhase] = useState<VisitPhase | null>(null);
  const [visitNoteOpen, setVisitNoteOpen] = useState(false);
  // 演示说明条选用的关系:优先当前筛选(地域+季节 > 地域 > 季节),都不匹配时退回第一条
  const visitor = useMemo(() => {
    if (!visit) return null;
    const base = visitors.find((x) => x.beeId === visit.beeId);
    if (!base) return null;
    const rels = beeFlowerRelations.filter(
      (rel) => rel.flowerId === flowerId && rel.beeId === visit.beeId,
    );
    const relation =
      rels.find((r) => (!regionSel || r.regionId === regionSel) && (!seasonSel || r.season === seasonSel)) ??
      rels.find((r) => !regionSel || r.regionId === regionSel) ??
      rels.find((r) => !seasonSel || r.season === seasonSel) ??
      base.relation;
    return { ...base, relation };
  }, [visit, visitors, flowerId, regionSel, seasonSel]);

  // 花粉筐彩蛋:携粉蜂 × 该蜂在这朵花上有"粉源/传粉"类型的记录才亮
  const visitPollen = useMemo(() => {
    if (!visit || !POLLEN_BEARING.has(visit.beeId)) return null;
    const collects = beeFlowerRelations.some(
      (rel) =>
        rel.flowerId === flowerId &&
        rel.beeId === visit.beeId &&
        (rel.relation === "pollen" || rel.relation === "pollination"),
    );
    return collects ? { color: POLLEN_COLORS[flowerId] ?? "#e8c231" } : null;
  }, [visit, flowerId]);

  const startVisit = (beeId: string) => {
    setOpenPanel(null);
    setVisitPhase(null);
    setVisitNoteOpen(false);
    setDossierTab("visitors");
    setVisit({ beeId, seq: seqRef.current++ });
    // 镜头一次性带到主花中景,不锁定
    setViewRequest({ view: "center", seq: seqRef.current++ });
  };
  const stopVisit = () => {
    setVisit(null);
    setVisitPhase(null);
  };

  // URL 同步:?panel=visitors
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (dossierTab === "visitors") next.set("panel", "visitors");
    else next.delete("panel");
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossierTab]);

  // URL 同步:?visit=<beeId>
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (visit) next.set("visit", visit.beeId);
    else next.delete("visit");
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit?.beeId]);

  // URL 同步:?focus= 只记选中的部位
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (selected) next.set("focus", selected);
    else next.delete("focus");
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // 切换花朵时回到整株(只在 flowerId 真正变化时清;URL 直链的选中部位要保留)
  const prevFlowerRef = useRef(flowerId);
  useEffect(() => {
    if (prevFlowerRef.current === flowerId) return;
    prevFlowerRef.current = flowerId;
    setSelected(null);
    setFocus({ id: "whole", seq: seqRef.current++ });
    setViewRequest(null);
    setVisit(null);
    setVisitPhase(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowerId]);

  useEffect(() => {
    if (modelUrl) preloadFlowerModel(modelUrl);
  }, [modelUrl]);

  const openHotspot = (id: string | null) => {
    if (!id) return;
    const hid = id as HotspotId;
    setSelected(hid);
    setFocus({ id: hid, seq: seqRef.current++ });
  };

  const selectedEntryId = selected ? ENTRY_BY_HOTSPOT[selected] ?? null : null;

  // 这朵花对应的单花蜜(蜂蜜工坊互链)
  const flowerHoney = honeyVarieties.find((v) => v.flowerId === flowerId) ?? null;
  const bloomCal = REGION_IDS.map((regionId) => ({
    regionId,
    name: regions[regionId].name,
    range: flower.bloom[regionId] ?? null,
    seasonRange: seasonSel ? regions[regionId].seasons[seasonSel] : null,
  }));

  const reset = () => {
    setSelected(null);
    setOpenPanel(null);
    setFocus({ id: "whole", seq: seqRef.current++ });
  };

  // 筛选 chips 渲染两处:宽屏在左栏顶部;窄屏(左栏隐藏)移到舞台顶部第二行
  const filterChips = (
    <>
      <div className="fl-filter-row">
        <button className={regionSel === null ? "active" : ""} onClick={() => setRegionSel(null)}>
          全部地域
        </button>
        {REGION_IDS.map((rid) => (
          <button
            key={rid}
            className={regionSel === rid ? "active" : ""}
            onClick={() => setRegionSel((cur) => (cur === rid ? null : rid))}
          >
            {regions[rid].name}
          </button>
        ))}
      </div>
      <div className="fl-filter-row">
        <button className={seasonSel === null ? "active" : ""} onClick={() => setSeasonSel(null)}>
          全部季节
        </button>
        {(["spring", "summer"] as const).map((sn) => (
          <button
            key={sn}
            className={seasonSel === sn ? "active" : ""}
            onClick={() => setSeasonSel((cur) => (cur === sn ? null : sn))}
          >
            {SEASON_LABEL[sn]}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className="workbench flowers">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="wb-body">
        <aside className="wb-panel wb-library" aria-label="花朵列表">
          <p className="wb-eyebrow">FLORA · 花朵与四季</p>
          <div className="fl-filters" role="group" aria-label="地域与季节筛选">
            {filterChips}
          </div>
          <nav className="fl-list" aria-label="选择花朵">
            {[...FLOWER_IDS]
              .sort((a, b) => Number(flowerInFilter(flowers[b])) - Number(flowerInFilter(flowers[a])))
              .map((id) => {
              const item = flowers[id];
              const modeled = Boolean(FLOWER_MODELS[id]);
              const inFilter = flowerInFilter(item);
              const localBloom = regionSel ? item.bloom[regionSel] : null;
              return (
                <button
                  key={id}
                  className={`fl-item${id === flowerId ? " active" : ""}${inFilter ? "" : " dim"}`}
                  aria-pressed={id === flowerId}
                  onClick={() => navigate(`/museum/flowers/${id}`)}
                >
                  <span className="fl-swatch" aria-hidden="true" style={{ background: FLOWER_SWATCHES[id] }} />
                  <span className="fl-item-text">
                    <b>{item.name}</b>
                    <span className="fl-sub">
                      <i className="latin">{item.scientificName}</i>
                      <span aria-hidden="true">·</span>
                      {FLOWER_FORM_LABEL[item.form]}
                      {localBloom && (
                        <em className="fl-bloom-tag">
                          {inFilter ? `${localBloom.from}–${localBloom.to} 月` : "不应季"}
                        </em>
                      )}
                      {regionSel && !localBloom && <em className="fl-bloom-tag none">该地无记录</em>}
                      {!modeled && <em className="fl-badge">建模中</em>}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
          <p className="fl-note muted">
            首期七种蜜源植物;三维模型逐种上线,其余先以档案卡呈现。
          </p>
        </aside>

        <section className="wb-stage" aria-label="可交互花朵三维观察区">
          <nav className="species-switch wb-narrow-only" aria-label="选择花朵">
            {[...FLOWER_IDS]
              .sort((a, b) => Number(flowerInFilter(flowers[b])) - Number(flowerInFilter(flowers[a])))
              .map((id) => (
                <button
                  key={id}
                  className={
                    (id === flowerId ? "active" : "") +
                    (activeFilterCount > 0 && !flowerInFilter(flowers[id]) ? " dim" : "")
                  }
                  aria-pressed={id === flowerId}
                  onClick={() => navigate(`/museum/flowers/${id}`)}
                >
                  {flowers[id].name}
                </button>
              ))}
          </nav>
          {activeFilterCount > 0 && (
            <button
              className="fl-filter-tag"
              onClick={clearFilters}
              aria-label={`清除筛选:${filterLabel}`}
            >
              {filterLabel}
              <i aria-hidden="true">✕</i>
            </button>
          )}
          <div className="fl-filters-narrow wb-narrow-only" role="group" aria-label="地域与季节筛选">
            {filterChips}
          </div>
          {filterOpen && (
            <>
              <div className="fl-drawer-scrim" onClick={() => setFilterOpen(false)} />
              <div className="fl-drawer" role="dialog" aria-modal="true" aria-label="地域与季节筛选">
                <p className="fl-drawer-title">
                  筛选
                  <span className="fl-drawer-count" role="status">
                    {activeFilterCount === 0
                      ? "选地域与季节,看哪些花在开"
                      : inFilterIds.length === 0
                        ? "该组合下没有花在开"
                        : `七种花中 ${inFilterIds.length} 种在开`}
                  </span>
                </p>
                {filterChips}
                <div className="fl-drawer-actions">
                  <button className="fl-drawer-clear" disabled={activeFilterCount === 0} onClick={clearFilters}>
                    清除
                  </button>
                  <button
                    className="fl-drawer-done"
                    onClick={() => {
                      setFilterOpen(false);
                      // "看这 N 种花":当前花不应季时,顺势跳到第一种应季的花
                      if (activeFilterCount > 0 && !flowerInFilter(flower) && inFilterIds[0]) {
                        navigate(`/museum/flowers/${inFilterIds[0]}`);
                      }
                    }}
                  >
                    {activeFilterCount > 0 && inFilterIds.length > 0
                      ? `看这 ${inFilterIds.length} 种花`
                      : "完成"}
                  </button>
                </div>
              </div>
            </>
          )}

          {modelUrl ? (
            <>
              <div className="wb-tools" role="toolbar" aria-label="观察工具">
                <div className="wb-tool-wrap">
                  <button
                    aria-expanded={openPanel === "view"}
                    onClick={() => setOpenPanel((p) => (p === "view" ? null : "view"))}
                  >
                    <span className="fl-glyph" aria-hidden="true">◇</span>
                    <span>视角</span>
                  </button>
                  {openPanel === "view" && (
                    <div className="wb-popover" role="menu" aria-label="选择机位">
                      {VIEW_OPTIONS.map(([label, value]) => (
                        <button
                          key={value}
                          role="menuitem"
                          onClick={() => {
                            setViewRequest({ view: value, seq: seqRef.current++ });
                            setOpenPanel(null);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  aria-label="放大"
                  onClick={() => setZoomRequest({ dir: 1, seq: seqRef.current++ })}
                >
                  <span className="fl-glyph" aria-hidden="true">＋</span>
                  <span>放大</span>
                </button>
                <button
                  aria-label="缩小"
                  onClick={() => setZoomRequest({ dir: -1, seq: seqRef.current++ })}
                >
                  <span className="fl-glyph" aria-hidden="true">－</span>
                  <span>缩小</span>
                </button>
                {visitors.length > 0 && (
                  <div className="wb-tool-wrap">
                    <button
                      className={visit ? "active" : ""}
                      aria-expanded={openPanel === "visit"}
                      onClick={() => setOpenPanel((p) => (p === "visit" ? null : "visit"))}
                    >
                      <span className="fl-glyph" aria-hidden="true">🐝</span>
                      <span>访花</span>
                    </button>
                    {openPanel === "visit" && (
                      <div className="wb-popover" role="menu" aria-label="选择访花的蜂">
                        {visitors.map((v) => (
                          <button key={v.beeId} role="menuitem" onClick={() => startVisit(v.beeId)}>
                            {v.name}
                          </button>
                        ))}
                        <p className="fl-visit-footnote">只列有来源记载的访花蜂</p>
                      </div>
                    )}
                  </div>
                )}
                <button
                  className="fl-tool-filter"
                  aria-haspopup="dialog"
                  aria-expanded={filterOpen}
                  onClick={() => setFilterOpen(true)}
                >
                  <span className="fl-glyph" aria-hidden="true">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 5h16l-6.2 7.6v5.2l-3.6-1.9v-3.3L4 5z" />
                    </svg>
                  </span>
                  <span>筛选</span>
                  {activeFilterCount > 0 && <i className="wb-badge">{activeFilterCount}</i>}
                </button>
                <button onClick={reset}>
                  <span className="fl-glyph" aria-hidden="true">↺</span>
                  <span>重置</span>
                </button>
              </div>
              <FlowerViewer
                modelUrl={modelUrl}
                motion={motion}
                hotspots={hotspots}
                focus={focus.id}
                focusSeq={focus.seq}
                selected={selected}
                onSelect={openHotspot}
                viewRequest={viewRequest}
                zoomRequest={zoomRequest}
                hotspotMode={smallScreen ? "direct" : "popover"}
                nearDistances={modelEntry?.near}
                visit={
                  visit
                    ? {
                        beeUrl: BEE_VISIT_MODELS[visit.beeId],
                        seq: visit.seq,
                        flight: BEE_FLIGHT[visit.beeId] ?? "nimble",
                        pollen: visitPollen,
                      }
                    : null
                }
                onVisitPhase={setVisitPhase}
              />
              {visitor && (
                <div className="fl-visit-bar slim" role="status" aria-live="polite">
                  {visitNoteOpen && (
                    <div className="fl-visit-detail">
                      <p>
                        {regions[visitor.relation.regionId]?.name} · {SEASON_LABEL[visitor.relation.season]}{" "}
                        <span className={`fl-evidence fl-evidence-${visitor.relation.evidence}`}>
                          {EVIDENCE_LABEL[visitor.relation.evidence]}
                        </span>
                      </p>
                      <p>{visitor.relation.note}</p>
                    </div>
                  )}
                  <div className="fl-visit-row">
                    <b>{visitor.name}</b>
                    {visitPhase && (
                      <span className="fl-visit-phase">
                        {VISIT_PHASE_TEXT[visitPhase]}
                        {visitPollen && (visitPhase === "probe" || visitPhase === "takeoff") &&
                          "——看它后足的花粉筐"}
                      </span>
                    )}
                    <button
                      type="button"
                      aria-expanded={visitNoteOpen}
                      onClick={() => setVisitNoteOpen((v) => !v)}
                    >
                      {visitNoteOpen ? "收起" : "说明"}
                    </button>
                    {visitPhase === "done" && (
                      <button type="button" onClick={() => startVisit(visitor.beeId)}>
                        再看一次
                      </button>
                    )}
                    <button type="button" onClick={stopVisit}>
                      停止
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="fl-stage-placeholder" role="status">
              <b>{flower.name}</b>
              <p>三维模型建模中——先看右侧档案卡,模型完成后即上线。</p>
            </div>
          )}
          <div className="stage-vignette" aria-hidden="true" />
        </section>

        <aside className="wb-panel wb-dossier flower-card" aria-label="花朵档案" key={flowerId}>
          <p className="wb-eyebrow">FLORA · {flower.family}</p>
          <h1 className="fl-title">{flower.name}</h1>
          <p className="latin">
            {flower.scientificName} · {flower.englishName}
          </p>

          {activeFilterCount > 0 && !flowerInFilter(flower) && (
            <div className="fl-offseason" role="note">
              <span>
                {regionSel && !flower.bloom[regionSel]
                  ? `${regions[regionSel].name}无${flower.name}的花期记录`
                  : `${filterLabel}里,${flower.name}不在花期`}
              </span>
              {inFilterIds[0] && (
                <button onClick={() => navigate(`/museum/flowers/${inFilterIds[0]}`)}>
                  看应季的花
                </button>
              )}
            </div>
          )}

          <div className="fl-tabs" role="tablist" aria-label="档案页签">
            <button
              role="tab"
              aria-selected={dossierTab === "dossier"}
              className={dossierTab === "dossier" ? "active" : ""}
              onClick={() => setDossierTab("dossier")}
            >
              花朵档案
            </button>
            <button
              role="tab"
              aria-selected={dossierTab === "visitors"}
              className={dossierTab === "visitors" ? "active" : ""}
              onClick={() => setDossierTab("visitors")}
            >
              谁来访花
              <em className="fl-tab-count">{visitorGroups.length}</em>
            </button>
          </div>

          {dossierTab === "dossier" && (<>
          <dl className="fl-meta">
            <div>
              <dt>花型</dt>
              <dd>{FLOWER_FORM_LABEL[flower.form]}</dd>
            </div>
            {flower.corollaDepthMm && (
              <div>
                <dt>花冠长</dt>
                <dd>
                  {flower.corollaDepthMm.min}–{flower.corollaDepthMm.max} 毫米
                </dd>
              </div>
            )}
          </dl>

          <div className="fl-bloomcal" role="img" aria-label="各地域花期(一年十二个月)">
            <div className="fl-bloomcal-months" aria-hidden="true">
              <i />
              {Array.from({ length: 12 }, (_, m) => (
                <span key={m}>{m + 1}</span>
              ))}
            </div>
            {bloomCal.map((row) => (
              <div
                key={row.regionId}
                className={
                  "fl-bloomcal-row" +
                  (regionSel && regionSel !== row.regionId ? " dim" : "") +
                  (regionSel === row.regionId ? " current" : "")
                }
              >
                <i>{row.name}</i>
                {row.range ? (
                  <span className="fl-bloomcal-strip">
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = i + 1;
                      const on = monthInRange(m, row.range!);
                      const inSeason = row.seasonRange ? monthInRange(m, row.seasonRange) : false;
                      return (
                        <em
                          key={m}
                          className={(on ? "on" : "") + (inSeason ? " season" : "")}
                          style={on ? { background: BLOOM_BAND_COLORS[flowerId] } : undefined}
                          title={`${m} 月${on ? "·开花" : ""}`}
                        />
                      );
                    })}
                  </span>
                ) : (
                  <span className="fl-bloomcal-none">该地域无花期记录</span>
                )}
              </div>
            ))}
          </div>

          <p className={`fl-summary${selected === "center" ? " active" : ""}`}>{flower.summary}</p>

          <div className={`fl-block${selected === "nectar" ? " active" : ""}`}>
            <p>
              <b>蜜</b> {flower.nectar}
            </p>
            <p>
              <b>粉</b> {flower.pollen}
            </p>
            {flowerHoney && (
              <button
                className="fl-honey-link"
                onClick={() =>
                  navigate(
                    `/museum/honey-workshop?panel=honeys&honey=${flowerHoney.id.replace("honey-", "")}`,
                  )
                }
              >
                这朵花的单花蜜:{flowerHoney.name} →
              </button>
            )}
          </div>

          <section aria-label="观察条目">
            {flower.entries.map((entry) => (
              <article
                key={entry.id}
                className={`fl-entry${selectedEntryId === entry.id ? " active" : ""}`}
              >
                <button
                  type="button"
                  className="fl-entry-head"
                  onClick={() => openHotspot(HOTSPOT_BY_ENTRY[entry.id] ?? "center")}
                >
                  <span className="fl-index">{entry.index}</span>
                  <span>
                    <b>
                      {entry.short} · {entry.title}
                    </b>
                    <i className="latin">{entry.latin}</i>
                  </span>
                </button>
                <p>{entry.description}</p>
                <p className="fl-fact">{entry.fact}</p>
              </article>
            ))}
          </section>

          <Provenance sourceIds={flower.sourceIds} reviewStatus={flower.reviewStatus} />
          </>)}

          {dossierTab === "visitors" && (
          <section className="fl-visitors" aria-label="谁来访花">
            <p className="fl-visitors-lead">
              {regionSel || seasonSel
                ? `当前筛选(${regionSel ? regions[regionSel].name : "全部地域"} · ${seasonSel ? SEASON_LABEL[seasonSel] : "全部季节"})下有 ${visitorGroups.length} 种蜂的记载。`
                : `这朵花有 ${visitorGroups.length} 种蜂留下了有来源的访花记载。点"看它访花"看三维演示。`}
            </p>
            {visitorGroups.length === 0 && (
              <p className="fl-note muted fl-visitors-empty">
                该地域·季节组合下暂无有来源的访花记载。
                <button
                  type="button"
                  className="fl-clear-filter"
                  onClick={() => {
                    setRegionSel(null);
                    setSeasonSel(null);
                  }}
                >
                  清除筛选
                </button>
              </p>
            )}
            {visitorGroups.map((group) => (
              <article key={group.beeId} className="fl-visitor">
                <header className="fl-visitor-head">
                  <span>
                    <b>{group.name}</b>
                    <i className="latin">{group.latin}</i>
                  </span>
                  {modelUrl && BEE_VISIT_MODELS[group.beeId] && (
                    <button
                      type="button"
                      className={visit?.beeId === group.beeId ? "active" : ""}
                      onClick={() => startVisit(group.beeId)}
                    >
                      {visit?.beeId === group.beeId ? "正在访花" : "看它访花"}
                    </button>
                  )}
                </header>
                {group.rels.map((rel) => (
                  <div key={rel.id} className="fl-rel">
                    <p className="fl-rel-meta">
                      <span className="fl-rel-scope">
                        {regions[rel.regionId]?.name ?? rel.regionId} · {SEASON_LABEL[rel.season]}
                      </span>
                      <span className={"fl-rel-type fl-rel-" + rel.relation}>{RELATION_LABEL[rel.relation]}</span>
                      <span className={"fl-evidence fl-evidence-" + rel.evidence}>{EVIDENCE_LABEL[rel.evidence]}</span>
                    </p>
                    <p className="fl-rel-note">{rel.note}</p>
                    <p className="fl-rel-sources">
                      来源:
                      {rel.sourceIds.map((id, i) => {
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
                  </div>
                ))}
              </article>
            ))}
            <p className="fl-note muted">
              只列有来源记载的蜂;未列出的蜂种表示本馆尚未找到可靠的访花记载。证据分级见来源页。
              {filteredOutCount > 0 && ` 另有 ${filteredOutCount} 条其他地域·季节的记载被当前筛选隐藏。`}
            </p>
          </section>
          )}
        </aside>
      </main>
    </div>
  );
}

export default FlowersHall;
