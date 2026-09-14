import { Link } from "react-router";
import { SiteFooter, SiteHeader, SkipLink, usePageTitle } from "../ui/SiteChrome";

function NotFound() {
  usePageTitle("找不到这一页");
  return (
    <div className="site">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="doc">
        <header className="doc-head">
          <p className="kicker">
            <span /> 404
          </p>
          <h1>这里没有展品</h1>
          <p className="lede">
            链接可能已经变了。回到<Link to="/">序厅</Link>,或直接进入
            <Link to="/museum/world-bees">世界蜜蜂馆</Link>。
          </p>
        </header>
      </main>
      <SiteFooter />
    </div>
  );
}

export default NotFound;
