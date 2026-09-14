import { Link, useLocation } from "react-router";
import { findHallByPath, halls } from "../data/halls";
import { SiteFooter, SiteHeader, SkipLink, usePageTitle } from "../ui/SiteChrome";

function ComingSoon() {
  const { pathname } = useLocation();
  const hall = findHallByPath(pathname);
  usePageTitle(hall ? `${hall.name}(筹备中)` : "筹备中");
  const openHalls = halls.filter((h) => h.status === "open");

  return (
    <div className="site">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="doc">
        <header className="doc-head">
          <p className="kicker">
            <span /> {hall?.kicker ?? "COMING SOON"}
          </p>
          <h1>{hall?.name ?? "这个展厅"}正在筹备</h1>
          <p className="lede">{hall?.blurb}</p>
          {hall?.milestone && (
            <p className="note">对应开发里程碑 {hall.milestone}。展厅开放后会出现在序厅的展厅目录里。</p>
          )}
        </header>
        <section aria-labelledby="open-title">
          <h2 id="open-title">现在可以参观的</h2>
          <ul className="link-list">
            {openHalls.map((h) => (
              <li key={h.id}>
                <Link to={h.path}>{h.name}</Link> — {h.blurb}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export default ComingSoon;
