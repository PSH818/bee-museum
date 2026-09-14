import { useEffect } from "react";
import { Link, useLocation } from "react-router";

/** 页面标题:`<页名> · 蜂之境` */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · 蜂之境`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

export function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      跳到主要内容
    </a>
  );
}

/** 全站一级导航页签(交互方案 v3 §2):标本 / 生命历程 / 花朵四季 / 蜂蜜工坊 / 来源 */
const NAV_TABS: Array<{ to: string; label: string; match: (path: string) => boolean }> = [
  {
    to: "/",
    label: "标本",
    match: (p) => p === "/" || p.startsWith("/museum/bees") || p.startsWith("/museum/world-bees"),
  },
  { to: "/museum/life-cycle", label: "生命历程", match: (p) => p.startsWith("/museum/life-cycle") },
  { to: "/museum/flowers", label: "花朵四季", match: (p) => p.startsWith("/museum/flowers") },
  { to: "/museum/honey-workshop", label: "蜂蜜工坊", match: (p) => p.startsWith("/museum/honey-workshop") },
  { to: "/sources", label: "来源", match: (p) => p.startsWith("/sources") },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const { pathname } = useLocation();
  return (
    <header className={`site-header${compact ? " compact" : ""}`}>
      <Link className="wordmark" to="/" aria-label="回到标本工作台">
        <BeeGlyph />
        <span>
          <b>蜂之境</b>
          <small>ONLINE BEE MUSEUM</small>
        </span>
      </Link>
      <nav className="site-nav" aria-label="站点导航">
        {NAV_TABS.map((tab) => (
          <Link key={tab.to} to={tab.to} className={tab.match(pathname) ? "active" : ""}>
            {tab.label}
          </Link>
        ))}
      </nav>
      <nav className="site-nav site-nav-aux" aria-label="辅助导航">
        <Link to="/about" className={pathname.startsWith("/about") ? "active" : ""}>
          关于
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter({ lastReviewedOn }: { lastReviewedOn?: string }) {
  return (
    <footer className="site-footer">
      <p>
        蜂之境 · 线上蜜蜂科普博物馆 · 纯前端静态站点
        {lastReviewedOn && <> · 内容最后审查 {lastReviewedOn}</>}
      </p>
      <p className="site-footer-note">
        展出文案由 AI 起草,并通过事实核查 / 反驳 / 合规三视角的 AI 对抗式审查;
        <b>尚未经过蜂类学专家核校</b>。发现错误请以来源页所列文献为准。
      </p>
      <nav aria-label="页脚导航">
        <Link to="/sources">来源与审校</Link>
        <Link to="/about">关于本项目</Link>
      </nav>
    </footer>
  );
}

export function BeeGlyph() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path d="M15 20c-6-8-11-3-8 4 2 5 8 4 12 2M29 20c6-8 11-3 8 4-2 5-8 4-12 2" />
      <ellipse cx="22" cy="24" rx="7" ry="11" />
      <path d="M16 22h12M16 27h12M20 13l-3-5M24 13l3-5" />
    </svg>
  );
}
