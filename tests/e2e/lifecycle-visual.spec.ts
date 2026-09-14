import { expect, test } from "@playwright/test";

// 生命历程馆:固定时间轴位置的视觉基线 + 时间轴交互冒烟
const BASELINES = [
  { name: "cycle-mellifera-larva", url: "/museum/life-cycle/cycle-apis-mellifera-worker?vr=1&t=6" },
  { name: "cycle-mellifera-pupa", url: "/museum/life-cycle/cycle-apis-mellifera-worker?vr=1&t=15" },
  { name: "cycle-mellifera-forager", url: "/museum/life-cycle/cycle-apis-mellifera-worker?vr=1&t=50" },
  { name: "cycle-osmia-nest", url: "/museum/life-cycle/cycle-osmia-cornifrons?vr=1&t=0.7" },
  { name: "cycle-osmia-cocoon", url: "/museum/life-cycle/cycle-osmia-cornifrons?vr=1&t=4" },
];

for (const { name, url } of BASELINES) {
  test(`生命历程基线 · ${name}`, async ({ page }) => {
    await page.goto(url);
    await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
    await page.waitForTimeout(1500);
    await expect(page.locator("canvas")).toHaveScreenshot(`${name}.png`);
  });
}

test("时间轴:阶段跳转、拖动与故事切换", async ({ page }) => {
  await page.goto("/museum/life-cycle");
  await expect(page).toHaveURL(/cycle-apis-mellifera-worker/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("工蜂");
  await expect(page.locator(".cycle-card h2")).toHaveText("卵");

  // 左侧阶段列表跳转
  await page.locator(".stage-nav button", { hasText: "采集" }).click();
  await expect(page.locator(".cycle-card h2")).toHaveText("外勤采集");
  const slider = page.getByRole("slider", { name: "时间轴位置" });
  expect(Number(await slider.inputValue())).toBeGreaterThanOrEqual(41);

  // 键盘操控滑块回到蛹期
  await slider.fill("15");
  await expect(page.locator(".cycle-card h2")).toHaveText("封盖与化蛹");
  await expect(page).toHaveURL(/t=15/);

  // 切换到独居蜂故事
  await page.locator(".lc-story-row", { hasText: "巢管" }).click();
  await expect(page).toHaveURL(/cycle-osmia-cornifrons/);
  await expect(page.locator(".cycle-card h2")).toHaveText("春天出巢");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
});

declare global {
  interface Window {
    __specimenReady?: boolean;
  }
}
