import { Link } from "react-router";
import { SiteFooter, SiteHeader, SkipLink, usePageTitle } from "../ui/SiteChrome";

function About() {
  usePageTitle("关于本项目");
  return (
    <div className="site">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="doc">
        <header className="doc-head">
          <p className="kicker">
            <span /> ABOUT
          </p>
          <h1>关于蜂之境</h1>
          <p className="lede">
            一座面向大众与青少年的互动式线上蜜蜂博物馆。它不是蜂蜜商城,也不是单纯的 3D 模型浏览器,
            而是由数字标本、生态场景、过程模拟和有来源的科普内容共同构成的学习产品。
          </p>
        </header>

        <section aria-labelledby="idea-title">
          <h2 id="idea-title">想做成什么样</h2>
          <p>
            以"蜜蜂本身"为绝对主角。把蜜蜂的身体、花朵的结构、生命周期和酿蜜过程做成可观察、可拆解、可比较、可交互的数字展品——
            像拿着放大镜看标本一样理解结构,像走进生态现场一样理解关系,像参与实验一样理解过程。
          </p>
        </section>

        <section aria-labelledby="principles-title">
          <h2 id="principles-title">内容原则</h2>
          <ul>
            <li>每一条知识点都标注来源;来源不明的不展出。</li>
            <li>科普口径谨慎:数字给范围、不同资料有分歧的写明分歧、不确定的用"据报道""一般认为"限定。</li>
            <li>三维模型是"艺术化写实":省略或近似之处在器官卡的模型说明里如实注明,不冒充解剖学精确。</li>
            <li>不做任何蜂蜜商品导购、真伪鉴别或健康功效宣称。</li>
          </ul>
        </section>

        <section aria-labelledby="status-title">
          <h2 id="status-title">现在做到哪了</h2>
          <table className="data-table" aria-label="开发进度">
            <thead>
              <tr>
                <th>阶段</th>
                <th>内容</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>M0–M1</td><td>基础架构、西方蜜蜂工蜂数字标本与观察器</td><td>已完成</td></tr>
              <tr><td>M2</td><td>6 种蜂、三职型、比较台、资源释放</td><td>已完成</td></tr>
              <tr><td>内容审查</td><td>182 条展出内容通过 AI 对抗式审查(<Link to="/sources">详情</Link>)</td><td>已完成</td></tr>
              <tr><td>M3</td><td>花朵与四季馆:7 种蜜源花、3 个地域、蜂花关系与访花演示</td><td>已完成</td></tr>
              <tr><td>M4</td><td>生命历程馆:工蜂一生与壁蜂周年两条可拖动时间轴</td><td>已完成</td></tr>
              <tr><td>M5</td><td>蜂蜜工坊:一滴花蜜的旅程六站、七种单花蜜与两张纠偏卡</td><td>已完成</td></tr>
            </tbody>
          </table>
        </section>

        <section aria-labelledby="tech-title">
          <h2 id="tech-title">技术</h2>
          <p>
            纯前端静态站点:React + TypeScript + Vite,三维部分使用 Three.js / React Three Fiber。
            标本在 Blender 中参数化生成、烘焙后以 GLB 加载,分高低两档精度按设备切换。
            内容数据用 Zod 做结构校验,发布前有门禁:任何仍是草稿的条目都会阻断构建。
            视觉回归测试固定相机与画质截取标本基线,防止模型与灯光在迭代中悄悄走样。
          </p>
        </section>

        <section aria-labelledby="credit-title">
          <h2 id="credit-title">原创与致谢</h2>
          <p>
            <b>本馆原创:</b>全部三维模型——六种蜂的程序化标本、七种花、蜂巢巢脾,以及东方蜜蜂三职型的
            高保真精模——均在 Blender 中从零建模,未使用任何外部模型、扫描数据、照片贴图或 AI 生成图像;
            站点代码、交互设计与"纸面标本"视觉风格同为本项目原创。中文科普文案为本馆撰写
            (AI 起草、三视角对抗式审查),其中的事实均逐条注明出处。
          </p>
          <p>
            <b>站在开源社区的肩膀上:</b>React、Three.js、React Three Fiber、drei、React Router、
            Zod、Vite(均为 MIT 协议),模型压缩用 glTF-Transform 与 meshoptimizer(MIT),
            测试用 Playwright(Apache-2.0)与 Vitest(MIT);字体为 Noto Serif SC(与思源宋体同源)与
            Manrope(SIL OFL 1.1,经 Fontsource 自托管,不向第三方发起请求)。
          </p>
          <p>
            <b>资料来源:</b>全部科普事实参考公开来源(维基百科、机构资料与学术论文)独立改写,
            未复制原文;逐条出处与审校状态见<Link to="/sources">来源与审校</Link>页。
          </p>
          <p>
            <b>参照与启发:</b>"三维标本 + 器官热点 + 档案讲解"的观察交互逻辑参考了{" "}
            <a href="https://github.com/thebuggeddev/anatomy" target="_blank" rel="noreferrer">
              Anatomy
            </a>
            (thebuggeddev,基于 Three.js 的交互式 3D 人体解剖浏览器);程序化建模路线受{" "}
            <a href="https://github.com/xr843/insect-world" target="_blank" rel="noreferrer">
              insect-world
            </a>
            (xr843,浏览器内参数化生成 63 种昆虫几何的交互图鉴)启发——本馆曾因模型来源停滞,
            是它证明了"程序化生成昆虫模型"可行,由此确定了以 AI 编码助手驱动 Blender
            参数化建模的路线。在此一并致谢;两者的代码、模型与资源均未被复用,
            本馆全部实现为独立创作。三栏工作台、时间轴等其余交互属于数字博物馆的通用模式。
          </p>
        </section>

        <section aria-labelledby="not-title">
          <h2 id="not-title">首期明确不做</h2>
          <ul>
            <li>用户账号、云端存档与社区功能。</li>
            <li>电商、蜂蜜购买或品牌导购。</li>
            <li>开放世界自由飞行、多人联机与复杂生态数值模拟。</li>
            <li>一次性覆盖全球所有蜂种与全部地域。</li>
          </ul>
        </section>
      </main>
      <SiteFooter lastReviewedOn="2026-08-25" />
    </div>
  );
}

export default About;
