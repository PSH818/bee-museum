import { expect, test } from "@playwright/test";

// 花朵馆视觉基线(M3 第 6 步):七种花整株 + 两张访花静格。
// motion=0 关闭风摆与飞行动画;镜头 rig 首帧吸附(__cameraSettled),画面确定。
const FLOWER_IDS = [
  "flower-brassica-napus",
  "flower-robinia-pseudoacacia",
  "flower-helianthus-annuus",
  "flower-vaccinium-corymbosum",
  "flower-trifolium-repens",
  "flower-lavandula-angustifolia",
  "flower-medicago-sativa",
] as const;

for (const id of FLOWER_IDS) {
  test(`花朵基线 · ${id}`, async ({ page }) => {
    await page.goto(`/museum/flowers/${id}?motion=0`);
    await page.waitForFunction(() => window.__cameraSettled === true, undefined, {
      timeout: 30_000,
    });
    // PMREM 环境贴图与前几帧渲染稳定
    await page.waitForTimeout(1500);
    await expect(page.locator(".wb-stage canvas")).toHaveScreenshot(`${id}.png`);
  });
}

// 访花静格:蓝莓×熊蜂(倒挂 + 花粉筐)与油菜×蜜蜂(站立取蜜)
const VISITS = [
  { flower: "flower-vaccinium-corymbosum", bee: "bombus-terrestris", name: "visit-blueberry-bombus" },
  { flower: "flower-brassica-napus", bee: "apis-mellifera", name: "visit-rapeseed-mellifera" },
] as const;

for (const v of VISITS) {
  test(`访花静格基线 · ${v.name}`, async ({ page }) => {
    await page.goto(`/museum/flowers/${v.flower}?visit=${v.bee}&motion=0&focus=nectar`);
    await page.waitForFunction(
      () => document.querySelector(".fl-visit-phase")?.textContent?.includes("取蜜") === true,
      undefined,
      { timeout: 30_000 },
    );
    await page.waitForFunction(() => window.__cameraSettled === true, undefined, {
      timeout: 30_000,
    });
    // 蜂落定为静格;再等环境贴图与花粉团稳定。
    // 这里不用 toHaveScreenshot:它要求连续两帧逐位一致,访花重场景在
    // 冷启动/高负载下 GPU 读回慢(ReadPixels 停顿),稳定性循环会超时;
    // 静格本身是确定的,单帧捕获 + 同容差比对足够。
    await page.waitForTimeout(2500);
    const shot = await page.locator(".wb-stage canvas").screenshot();
    expect(shot).toMatchSnapshot(`${v.name}.png`);
  });
}

declare global {
  interface Window {
    __cameraSettled?: boolean;
  }
}
