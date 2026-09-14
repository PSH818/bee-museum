import { expect, test } from "@playwright/test";

// 蜂蜜工坊视觉基线(M5 第 6 步):六站演示各一张 + "这瓶蜜"页签一张。
// motion=0:镜头首帧吸附、蜂全静格、翅定格小张角;__hiveReady 后再等渲染稳定。
// 与花朵馆访花静格同一取法:单帧 canvas.screenshot() + toMatchSnapshot
// (toHaveScreenshot 的稳定性循环在高负载下会超时,教训见 flowers-visual)。
const STAGES = ["gather", "carry", "handoff", "transform", "condense", "cap"] as const;

for (const stage of STAGES) {
  test(`工坊基线 · ${stage}`, async ({ page }) => {
    await page.goto(`/museum/honey-workshop?stage=${stage}&motion=0`);
    await page.waitForFunction(() => window.__hiveReady === true, undefined, { timeout: 30_000 });
    await page.waitForTimeout(2000);
    const shot = await page.locator(".wb-stage canvas").screenshot();
    expect(shot).toMatchSnapshot(`hive-${stage}.png`);
  });
}

test("工坊基线 · 这瓶蜜页签", async ({ page }) => {
  await page.goto("/museum/honey-workshop?panel=honeys&honey=black-locust&motion=0");
  await page.waitForSelector(".hw-honey.active");
  await page.waitForTimeout(600);
  const shot = await page.locator(".wb-dossier").screenshot();
  expect(shot).toMatchSnapshot("hive-honeys-panel.png");
});

declare global {
  interface Window {
    __hiveReady?: boolean;
  }
}
