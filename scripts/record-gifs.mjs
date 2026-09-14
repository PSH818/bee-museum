// README 功能演示 GIF 录制:Playwright 截帧序列 → gifenc 合成。
// 用法:node scripts/record-gifs.mjs [场景名...](缺省录全部)
// 场景在 SCENES 里定义;输出 docs/media/<名>.gif(约 500×?,10fps 等效)。
import { chromium } from "playwright";
import gifenc from "gifenc";
const { GIFEncoder, quantize, applyPalette } = gifenc;
import { PNG } from "playwright-core/lib/utilsBundle";
import { writeFileSync, statSync } from "node:fs";

const BASE = "http://localhost:4300";
const OUT = "docs/media";

/** 每场景:url、就绪条件、录制期间的动作脚本、帧数与间隔、裁剪区 */
const SCENES = {
  specimen: {
    url: "/museum/bees/apis-cerana",
    ready: (p) => p.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 40000 }),
    clip: { x: 322, y: 88, width: 1100, height: 730 },
    frames: 36,
    intervalMs: 280,
    async act(p) {
      await p.waitForTimeout(2200);
      // 拖动旋转标本,然后点一个热点看器官
      const stage = p.locator(".wb-stage canvas");
      const box = await stage.boundingBox();
      await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await p.mouse.down();
      await p.mouse.move(box.x + box.width / 2 + 200, box.y + box.height / 2 - 40, { steps: 30 });
      await p.mouse.up();
      await p.waitForTimeout(1200);
      await p.locator(".wb-focus-strip button", { hasText: "头部" }).click();
    },
  },
  fine: {
    url: "/museum/bees/apis-cerana?motion=1",
    ready: (p) => p.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 40000 }),
    clip: { x: 322, y: 88, width: 1100, height: 730 },
    frames: 34,
    intervalMs: 300,
    async act(p) {
      await p.waitForTimeout(1500);
      await p.locator(".wb-tools button", { hasText: "精模" }).click();
      await p.waitForFunction(() => window.__fineReady === true, undefined, { timeout: 30000 });
    },
  },
  visit: {
    url: "/museum/flowers/flower-vaccinium-corymbosum?visit=bombus-terrestris",
    ready: (p) => p.waitForSelector(".fl-visit-bar", { timeout: 40000 }),
    clip: { x: 322, y: 88, width: 1100, height: 730 },
    frames: 44,
    intervalMs: 320,
    async act() {},
  },
  workshop: {
    url: "/museum/honey-workshop?stage=handoff",
    ready: (p) => p.waitForSelector(".wb-stage canvas", { timeout: 40000 }),
    clip: { x: 322, y: 88, width: 1100, height: 730 },
    frames: 40,
    intervalMs: 300,
    async act(p) {
      await p.waitForTimeout(4200);
      // 交哺看两轮,然后切到转化站看分子窗
      await p.waitForTimeout(4000);
      await p.locator(".fl-item", { hasText: "转化" }).click();
    },
  },
};

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENES);
const browser = await chromium.launch();

for (const name of names) {
  const scene = SCENES[name];
  if (!scene) {
    console.error("未知场景:", name);
    continue;
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
  await page.goto(BASE + scene.url);
  await scene.ready(page);
  await page.waitForTimeout(1200);

  const frames = [];
  const actDone = (async () => {
    try {
      await scene.act(page);
    } catch (e) {
      console.error(name, "动作失败:", String(e).slice(0, 120));
    }
  })();
  for (let i = 0; i < scene.frames; i++) {
    const buf = await page.locator(".wb-stage").screenshot().catch(() => null);
    if (buf) frames.push(PNG.sync.read(buf));
    await page.waitForTimeout(scene.intervalMs);
  }
  await actDone;
  await page.close();

  // 缩到 720 宽(最近邻),再量化合成 GIF
  const scale = 720 / frames[0].width;
  const w = 720;
  const h = Math.round(frames[0].height * scale);
  const gif = GIFEncoder();
  for (const f of frames) {
    const rgba = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      const sy = Math.min(f.height - 1, Math.round(y / scale));
      for (let x = 0; x < w; x++) {
        const sx = Math.min(f.width - 1, Math.round(x / scale));
        const si = (sy * f.width + sx) * 4;
        const di = (y * w + x) * 4;
        rgba[di] = f.data[si];
        rgba[di + 1] = f.data[si + 1];
        rgba[di + 2] = f.data[si + 2];
        rgba[di + 3] = 255;
      }
    }
    const palette = quantize(rgba, 256);
    const index = applyPalette(rgba, palette);
    gif.writeFrame(index, w, h, { palette, delay: scene.intervalMs });
  }
  gif.finish();
  const out = `${OUT}/${name}.gif`;
  writeFileSync(out, gif.bytes());
  console.log(`✓ ${out} ${frames.length} 帧 ${(statSync(out).size / 1048576).toFixed(1)}MB`);
}
await browser.close();
