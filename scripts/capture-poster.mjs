// 重摄标本馆加载海报 public/images/poster-default.png
// 海报是 .wb-stage 加载完成态的静态替身:默认工蜂视图变样(工具栏/职型栏/圆点/文案)后必须重摄,
// 否则开场几秒会闪现过期界面(2026-09 曾因此让已删除的黄便签提示条"复活")。
// 用法:node scripts/capture-poster.mjs [页面地址]
//   默认抓线上 https://psh818.github.io/bee-museum/;本地核对可传 http://localhost:4173/bee-museum/
//   (本地 preview 记得 GHPAGES=1 构建与预览,否则 base 不对)
import { chromium } from "playwright";

const url = (process.argv[2] ?? "https://psh818.github.io/bee-museum/") + "?motion=0";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await p.goto(url, { timeout: 60000 });
await p.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 120000 });
// 等旧海报节点从 DOM 摘除(ready 后 400ms 卸载),避免把旧图翻拍进新图
await p.waitForSelector(".wb-poster", { state: "detached", timeout: 15000 });
await p.waitForTimeout(800);
const stage = p.locator(".wb-stage");
await stage.screenshot({ path: "public/images/poster-default.png" });
console.log("已重摄 public/images/poster-default.png,来源:", url);
await b.close();
