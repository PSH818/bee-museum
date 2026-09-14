import { Link } from "react-router";
import { asset } from "../lib/asset";
import { halls } from "../data/halls";
import { BEE_SPECIES_IDS, beeSpecies, speciesCastes } from "../data/bees/species-index";
import { speciesContent } from "../data/bees/species-content";
import { SiteFooter, SiteHeader, SkipLink, usePageTitle } from "../ui/SiteChrome";

const SPECIES_TAGLINE: Record<string, string> = {
  "apis-mellifera": "全球养蜂业的主角,工蜂、蜂王、雄蜂三种身体方案。",
};

function Home() {
  usePageTitle("序厅");
  const openHalls = halls.filter((hall) => hall.status === "open");
  const plannedHalls = halls.filter((hall) => hall.status === "planned");

  return (
    <div className="site">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="home">
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="kicker">
              <span /> 线上蜜蜂科普博物馆 · 序厅
            </p>
            <h1>
              在它飞向花朵之前,
              <br />
              先看清一只蜜蜂。
            </h1>
            <p className="lede">
              这里没有玻璃柜。每一件标本都是可以旋转、靠近、拆开来看的三维模型;
              每一句说明都标注了来源和审查状态。先从世界蜜蜂馆开始。
            </p>
            <div className="home-actions">
              <Link className="button-primary" to="/museum/world-bees">
                进入世界蜜蜂馆
              </Link>
              <Link className="button-ghost" to="/sources">
                内容是怎么把关的 →
              </Link>
            </div>
          </div>
          <figure className="home-hero-figure">
            <img
              src={asset("/images/hero-specimen-front.png")}
              alt="西方蜜蜂工蜂数字标本正面观:黄褐相间的腹部、透明翅膀与三对足"
              width={1280}
              height={800}
              loading="eager"
            />
            <figcaption>西方蜜蜂 · 工蜂 · 数字标本正面观</figcaption>
          </figure>
        </section>

        <section className="halls" aria-labelledby="halls-title">
          <div className="section-head">
            <h2 id="halls-title">展厅</h2>
            <p>
              已开放 {openHalls.length} 个,筹备中 {plannedHalls.length} 个。筹备中的展厅会按里程碑陆续上线。
            </p>
          </div>
          <div className="hall-grid">
            {halls.map((hall) => (
              <Link
                key={hall.id}
                to={hall.path}
                className={`hall-card ${hall.status}`}
                aria-label={`${hall.name}${hall.status === "planned" ? "(筹备中)" : ""}`}
              >
                <span className="hall-kicker">{hall.kicker}</span>
                <h3>{hall.name}</h3>
                <p>{hall.blurb}</p>
                <span className="hall-status">
                  {hall.status === "open" ? "已开放 →" : `筹备中 · ${hall.milestone}`}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="species" aria-labelledby="species-title">
          <div className="section-head">
            <h2 id="species-title">馆藏蜂种</h2>
            <p>首期 6 种,覆盖社会性蜜蜂、熊蜂与三类独居蜂。</p>
          </div>
          <ul className="species-grid">
            {BEE_SPECIES_IDS.map((id) => {
              const record = beeSpecies[id];
              const casteCount = speciesCastes[id].length;
              return (
                <li key={id}>
                  <Link to={`/museum/bees/${id}`} className="species-card">
                    <p className="latin">{record.scientificName}</p>
                    <h3>{record.name}</h3>
                    <p>{SPECIES_TAGLINE[id] ?? speciesContent[id].hero}</p>
                    <span className="species-meta">
                      {record.family.split(" ")[0]} · 工蜂/雌蜂体长约 {record.workerBodyLengthMm.min}–
                      {record.workerBodyLengthMm.max} mm
                      {casteCount > 1 && ` · ${casteCount} 种职型`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="honesty" aria-labelledby="honesty-title">
          <h2 id="honesty-title">关于内容的一句实话</h2>
          <p>
            本馆的说明文字由 AI 起草,并经三个互不通信的 AI 审查视角(事实核查、反驳、合规)多轮对抗式审查,
            任一视角否决即回炉重写。这能挡住大部分错误,但<b>不等于专家审校</b>——每张卡片上的状态徽章都如实标注了这一点。
            如果你是蜂类学研究者或一线养蜂人,愿意帮我们核校内容,来源页列出了全部依据。
          </p>
          <Link className="button-ghost" to="/sources">
            查看来源与审校记录 →
          </Link>
        </section>
      </main>
      <SiteFooter lastReviewedOn="2026-08-25" />
    </div>
  );
}

export default Home;
