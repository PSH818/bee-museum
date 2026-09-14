import { expect, test } from "@playwright/test";

// 视觉回归基线(前端方案 §15.3):固定相机、固定种子、固定画质,
// 正面 / 侧面 / 背面 / 器官特写各一张。只截 canvas,避免字体渲染差异。
const VIEWS = ["front", "side", "back", "macro"] as const;

for (const view of VIEWS) {
  test(`工蜂标本基线 · ${view}`, async ({ page }) => {
    await page.goto(`/?vr=${view}`);
    await page.waitForFunction(() => window.__specimenReady === true, undefined, {
      timeout: 30_000,
    });
    // PMREM 环境贴图与前几帧渲染稳定
    await page.waitForTimeout(1500);
    await expect(page.locator("canvas")).toHaveScreenshot(`bee-${view}.png`);
  });
}

// 职型基线:蜂王/雄蜂走程序化标本(精模仅工蜂,混合管线 §7.5)
for (const caste of ["queen", "drone"] as const) {
  test(`职型基线 · ${caste}(侧面)`, async ({ page }) => {
    await page.goto(`/?vr=side&caste=${caste}`);
    await page.waitForFunction(() => window.__specimenReady === true, undefined, {
      timeout: 30_000,
    });
    await page.waitForTimeout(1500);
    await expect(page.locator("canvas")).toHaveScreenshot(`bee-${caste}-side.png`);
  });
}

// 蜂种基线:东方蜜蜂工蜂(物种工厂产出的第一个新蜂种)
test("蜂种基线 · 东方蜜蜂(侧面)", async ({ page }) => {
  await page.goto("/?vr=side&species=apis-cerana");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, {
    timeout: 30_000,
  });
  await page.waitForTimeout(1500);
  await expect(page.locator("canvas")).toHaveScreenshot("bee-cerana-side.png");
});

test("蜂种基线 · 欧洲熊蜂(侧面)", async ({ page }) => {
  await page.goto("/?vr=side&species=bombus-terrestris");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, {
    timeout: 30_000,
  });
  await page.waitForTimeout(1500);
  await expect(page.locator("canvas")).toHaveScreenshot("bee-bombus-side.png");
});

// 东方蜜蜂三职型(蜂王/雄蜂)与其比较台
for (const caste of ["queen", "drone"] as const) {
  test(`职型基线 · 东方蜜蜂 ${caste}(侧面)`, async ({ page }) => {
    await page.goto(`/?vr=side&species=apis-cerana&caste=${caste}`);
    await page.waitForFunction(() => window.__specimenReady === true, undefined, {
      timeout: 30_000,
    });
    await page.waitForTimeout(1500);
    await expect(page.locator("canvas")).toHaveScreenshot(`bee-cerana-${caste}-side.png`);
  });
}
test("比较台基线 · 东方蜜蜂三职型", async ({ page }) => {
  await page.goto("/?vr=compare&species=apis-cerana");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, {
    timeout: 30_000,
  });
  await page.waitForTimeout(2000);
  await expect(page.locator("canvas")).toHaveScreenshot("bee-cerana-compare.png");
});

// 独居蜂三种(壁蜂/切叶蜂/木蜂):物种工厂第二批产出
for (const [species, label] of [
  ["osmia-cornifrons", "角额壁蜂"],
  ["megachile-rotundata", "苜蓿切叶蜂"],
  ["xylocopa-violacea", "紫木蜂"],
] as const) {
  test(`蜂种基线 · ${label}(侧面)`, async ({ page }) => {
    await page.goto(`/?vr=side&species=${species}`);
    await page.waitForFunction(() => window.__specimenReady === true, undefined, {
      timeout: 30_000,
    });
    await page.waitForTimeout(1500);
    await expect(page.locator("canvas")).toHaveScreenshot(`bee-${species}-side.png`);
  });
}

// 比较台基线:三职型同台、真实体长比例(产品方案 §8.2)
test("比较台基线 · 三职型同台", async ({ page }) => {
  await page.goto("/?vr=compare");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, {
    timeout: 30_000,
  });
  await page.waitForTimeout(2000);
  await expect(page.locator("canvas")).toHaveScreenshot("bee-compare.png");
});

// 聚焦态基线:上一次相机锚点缩放回归正是因为基线只拍整体视角才漏网。
// motion=0 停掉动作,镜头收敛后会吸附到唯一终点,画面可复现。
// ?vr=focus-head:demand 冻结渲染 + 锚点公式定位相机(无插值)。
// 曾用实时循环 + 等待收敛信号,Playwright 连续捕帧在该模式下不稳定。
test("工蜂标本基线 · focus-head(聚焦态)", async ({ page }) => {
  await page.goto("/?vr=focus-head");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, {
    timeout: 30_000,
  });
  await page.waitForTimeout(1500);
  await expect(page.locator("canvas")).toHaveScreenshot("bee-focus-head.png");
});

// 工具基线(交互方案 v3 §4.3):单独显示(幽灵材质)与图层(无绒毛)
test("工具基线 · 单独显示头部(侧面)", async ({ page }) => {
  await page.goto("/?vr=side&focus=head&isolate=1");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
  await page.waitForTimeout(1500);
  await expect(page.locator("canvas")).toHaveScreenshot("bee-side-isolate-head.png");
});

test("工具基线 · 隐藏绒毛(侧面)", async ({ page }) => {
  await page.goto("/?vr=side&hide=fur");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
  await page.waitForTimeout(1500);
  await expect(page.locator("canvas")).toHaveScreenshot("bee-side-nofur.png");
});

// 资源释放(前端方案 §15.2):连续重载标本,GL 资源数量不得持续上升
test("资源释放:连续重载标本 5 次,几何体与纹理数量不增长", async ({ page }) => {
  await page.goto("/?motion=0");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, {
    timeout: 30_000,
  });
  await page.waitForTimeout(600);
  const before = await page.evaluate(() => window.__beeDebug!.glInfo());
  for (let round = 0; round < 5; round += 1) {
    const generation = await page.evaluate(
      () => window.__specimenGeneration ?? 0,
    );
    await page.evaluate(() => window.__beeDebug!.reloadSpecimen());
    await page.waitForFunction(
      (g) => (window.__specimenGeneration ?? 0) > g,
      generation,
      { timeout: 30_000 },
    );
  }
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => window.__beeDebug!.glInfo());
  expect(after.geometries, "几何体数量在重载后持续上升,存在泄漏").toBeLessThanOrEqual(
    before.geometries,
  );
  expect(after.textures, "纹理数量在重载后持续上升,存在泄漏").toBeLessThanOrEqual(
    before.textures,
  );
});

test("冒烟:页面加载出观察舞台与文案", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("蜜蜂");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, {
    timeout: 30_000,
  });
});

declare global {
  interface Window {
    __specimenReady?: boolean;
    __specimenGeneration?: number;
    __cameraSettled?: boolean;
    __beeDebug?: {
      glInfo: () => { geometries: number; textures: number };
      reloadSpecimen: () => void;
    };
  }
}
