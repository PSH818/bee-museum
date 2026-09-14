import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import NotFound from "./pages/NotFound";
import "./styles.css";
import "./styles/site.css";
import "./styles/lifecycle.css";
import "./styles/workbench.css";

// 标本馆携带 Three.js / R3F 与模型加载逻辑,按路由懒加载:
// 序厅、来源页等信息页不下载三维运行时(前端方案 §13.2:初始路由不携带全馆资产)
const Workbench = lazy(() => import("./pages/Workbench"));
const LifeCycleHall = lazy(() => import("./pages/LifeCycleHall"));
const FlowersHall = lazy(() => import("./pages/FlowersHall"));
const HoneyWorkshopHall = lazy(() => import("./pages/HoneyWorkshopHall"));
// 来源页汇总全站内容数据集(182 条 + 98 条来源),关于页纯静态:
// 一并懒加载,首屏入口不再携带内容数据(M6 子步 2)
const Sources = lazy(() => import("./pages/Sources"));
const About = lazy(() => import("./pages/About"));

function HallLoading() {
  return (
    <div className="hall-loading" role="status">
      正在打开展厅…
    </div>
  );
}

/** 路由切换后回到页顶(标本馆为整屏布局,不受影响) */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const workbench = (
  <Suspense fallback={<HallLoading />}>
    <Workbench />
  </Suspense>
);

/** 旧的世界蜜蜂馆链接 → 工作台,保留查询参数(vr/species/caste 等) */
function WorldBeesRedirect() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "/", search }} replace />;
}
const lifeCycleHall = (
  <Suspense fallback={<HallLoading />}>
    <LifeCycleHall />
  </Suspense>
);
const flowersHall = (
  <Suspense fallback={<HallLoading />}>
    <FlowersHall />
  </Suspense>
);
const honeyWorkshopHall = (
  <Suspense fallback={<HallLoading />}>
    <HoneyWorkshopHall />
  </Suspense>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={workbench} />
        <Route path="/museum/world-bees" element={<WorldBeesRedirect />} />
        <Route path="/museum/bees/:speciesId" element={workbench} />
        <Route path="/museum/flowers" element={flowersHall} />
        <Route path="/museum/flowers/:flowerId" element={flowersHall} />
        <Route path="/museum/life-cycle" element={lifeCycleHall} />
        <Route path="/museum/life-cycle/:storyId" element={lifeCycleHall} />
        <Route path="/museum/honey-workshop" element={honeyWorkshopHall} />
        <Route
          path="/sources"
          element={
            <Suspense fallback={<HallLoading />}>
              <Sources />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<HallLoading />}>
              <About />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
