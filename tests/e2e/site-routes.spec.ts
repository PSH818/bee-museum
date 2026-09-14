import { expect, test } from "@playwright/test";

// 站点路由冒烟(工作台版,交互方案 v3):
// 首屏即三维工作台;左栏馆藏切蜂种;来源页;筹备页与 404;旧链接重定向。

test("首屏即工作台:三栏就位,标本加载", async ({ page }) => {
  await page.goto("/");
  // 三栏:左馆藏、中画布、右档案卡
  await expect(page.locator(".wb-library")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator(".wb-dossier h1")).toContainText("西方蜜蜂");
  // 馆藏 6 种蜂,当前项展开三职型 chip
  await expect(page.locator(".wb-species-row")).toHaveCount(6);
  await expect(page.locator(".wb-species-list li.active .wb-caste-chips button")).toHaveCount(4);
  await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
});

test("左栏切蜂种与展厅页签", async ({ page }) => {
  await page.goto("/");
  await page.locator(".wb-species-row", { hasText: "欧洲熊蜂" }).click();
  await expect(page).toHaveURL(/\/museum\/bees\/bombus-terrestris/);
  await expect(page.locator(".wb-dossier h1")).toContainText("欧洲熊蜂");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
  // 展厅页签
  await page.getByRole("tab", { name: "展厅" }).click();
  await expect(page.locator(".wb-hall-row")).toHaveCount(4);
  await page.locator(".wb-hall-row", { hasText: "生命历程" }).click();
  await expect(page).toHaveURL(/\/museum\/life-cycle/);
});

test("旧链接重定向与查询参数兼容", async ({ page }) => {
  await page.goto("/museum/world-bees?species=apis-cerana");
  await expect(page).toHaveURL(/species=apis-cerana|apis-cerana/);
  await expect(page.locator(".wb-dossier h1")).toContainText("东方蜜蜂");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
});

test("部位与器官模式:右栏档案卡切换", async ({ page }) => {
  await page.goto("/?focus=head");
  await expect(page.locator(".wb-dossier h1")).not.toContainText("西方蜜蜂 ·");
  await expect(page.locator(".wb-back")).toBeVisible();
  await page.locator(".wb-back").click();
  await expect(page.locator(".wb-dossier h1")).toContainText("西方蜜蜂");
  // 器官直链
  await page.goto("/?organ=organ-corbicula");
  await expect(page.locator(".wb-dossier h1")).toContainText("花粉筐");
});

test("来源页:状态口径、蜂种状态表与来源列表", async ({ page }) => {
  await page.goto("/sources");
  await expect(page).toHaveTitle(/来源与审校 · 蜂之境/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("来源与审校");
  const sourceRows = page.getByRole("table", { name: "来源列表" }).locator("tbody tr");
  expect(await sourceRows.count()).toBeGreaterThanOrEqual(20);
  const speciesRows = page.getByRole("table", { name: "各蜂种内容条目与状态" }).locator("tbody tr");
  await expect(speciesRows).toHaveCount(6);
  await expect(page.getByRole("table", { name: "各蜂种内容条目与状态" }).locator(".review-draft")).toHaveCount(0);
});

test("精致标本模式:仅东方蜜蜂提供,直链、精简工具栏与自动回退", async ({ page }) => {
  // 西方蜜蜂没有精模,工具栏不出现按钮
  await page.goto("/?motion=0");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
  await expect(page.locator(".wb-tools button", { hasText: "精模" })).toHaveCount(0);
  // 东方蜜蜂:点精模 → ?hd=1,精简工具栏(精模/放大/缩小)
  await page.goto("/museum/bees/apis-cerana?motion=0");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
  await page.locator(".wb-tools button", { hasText: "精模" }).click();
  await expect(page).toHaveURL(/hd=1/);
  await page.waitForFunction(() => window.__fineReady === true, undefined, { timeout: 30_000 });
  await expect(page.locator(".wb-tools button")).toHaveCount(3);
  // 点观察部位 → 自动退出精模、回标准并聚焦(精模是纯鉴赏)
  await page.locator(".wb-focus-strip button", { hasText: "头部" }).click();
  await expect(page).toHaveURL(/focus=head/);
  await expect(page).not.toHaveURL(/hd=1/);
});

test("404 页", async ({ page }) => {
  await page.goto("/no/such/page");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("没有展品");
});

test("蜂蜜工坊:旅程六站、直链、站点导航与互链", async ({ page }) => {
  await page.goto("/museum/honey-workshop?motion=0");
  // 三栏:左 6 站列表,默认第一站"采集"
  await expect(page.locator(".fl-item")).toHaveCount(6);
  await expect(page.locator(".wb-dossier h1")).toContainText("采集");
  await expect(page.locator(".wb-stage canvas")).toBeVisible({ timeout: 20_000 });
  // 直链到封盖站:列表选中、右栏切换、终点"下一站"禁用
  await page.goto("/museum/honey-workshop?stage=cap&motion=0");
  await expect(page.locator(".wb-dossier h1")).toContainText("封盖");
  await expect(page.locator(".fl-item.active")).toContainText("封盖");
  await expect(page.locator(".hw-nav-next")).toBeDisabled();
  // 上一站 → 浓缩(URL 与边界说明)
  await page.locator(".hw-nav button").first().click();
  await expect(page).toHaveURL(/stage=condense/);
  await expect(page.locator(".wb-dossier h1")).toContainText("浓缩");
  await expect(page.locator(".hw-boundary")).toContainText("含水量");
  // 分站演示:交哺站两只蜂对头 + 指认标签;扇风站一只
  await page.goto("/museum/honey-workshop?stage=handoff&motion=0");
  await page.waitForFunction(() => window.__hiveBeesCount === 2, undefined, { timeout: 20_000 });
  await expect(page.locator(".hw-tag")).toContainText("交哺");
  await page.goto("/museum/honey-workshop?stage=condense&motion=0");
  await page.waitForFunction(() => window.__hiveBeesCount === 1, undefined, { timeout: 20_000 });
  // 巢房叙事动画:三站有演示格,采集站没有(window.__cellDemo)
  await page.goto("/museum/honey-workshop?stage=condense&motion=0");
  await page.waitForFunction(() => window.__cellDemo === "condense", undefined, { timeout: 20_000 });
  await page.goto("/museum/honey-workshop?stage=gather&motion=0");
  await page.waitForFunction(() => window.__cellDemo === null, undefined, { timeout: 20_000 });
  // 转化站:分子视角小窗(仅此站),可折叠成胶囊
  await page.goto("/museum/honey-workshop?stage=transform&motion=0");
  await expect(page.locator(".hw-mol")).toContainText("分子视角");
  await page.locator(".hw-mol-head button").click();
  await expect(page.locator(".hw-mol")).toHaveCount(0);
  await expect(page.locator(".hw-mol-pill")).toBeVisible();
  await page.goto("/museum/honey-workshop?stage=cap&motion=0");
  await expect(page.locator(".hw-mol, .hw-mol-pill")).toHaveCount(0);
  // 相关展品互链:第一站 → 器官"喙";访花跳转 → 花朵馆演示直链
  await page.goto("/museum/honey-workshop?stage=gather&motion=0");
  await page.locator(".hw-related button", { hasText: "喙" }).click();
  await expect(page).toHaveURL(/organ=organ-proboscis/);
  await page.goto("/museum/honey-workshop?stage=gather&motion=0");
  await page.locator(".hw-related-hero").click();
  await expect(page).toHaveURL(/flower-brassica-napus\?visit=apis-mellifera/);
  // "这瓶蜜"页签:7 张单花蜜卡 + 2 张纠偏卡;?honey= 直链高亮;点花名回花朵馆
  await page.goto("/museum/honey-workshop?panel=honeys&honey=rapeseed&motion=0");
  await expect(page.locator(".hw-honey")).toHaveCount(7);
  await expect(page.locator(".hw-note")).toHaveCount(2);
  await expect(page.locator(".hw-honey.active")).toContainText("油菜蜜");
  await page.locator(".hw-honey.active .hw-honey-head button").click();
  await expect(page).toHaveURL(/flowers\/flower-brassica-napus/);
  // 花朵卡 → 工坊单花蜜的反向互链
  await page.goto("/museum/flowers/flower-lavandula-angustifolia?motion=0");
  await page.locator(".fl-honey-link").click();
  await expect(page).toHaveURL(/honey-workshop\?panel=honeys&honey=lavender/);
  await expect(page.locator(".hw-honey.active")).toContainText("薰衣草蜜");
});

declare global {
  interface Window {
    __hiveBeesCount?: number;
    __cellDemo?: string | null;
  }
}

declare global {
  interface Window {
    __specimenReady?: boolean;
    __fineReady?: boolean;
  }
}

test("底部扩展卡:桌面 6 张;手机 2 张 + 更多折叠", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".wb-card")).toHaveCount(6);
  await expect(page.locator(".wb-more")).toBeHidden();
  // 手机宽度:默认只露主卡,点"更多"展开其余
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".wb-card:visible")).toHaveCount(2);
  await page.locator(".wb-more").click();
  await expect(page.locator(".wb-card:visible")).toHaveCount(6);
  await expect(page.locator(".wb-more")).toHaveText("收起");
  // 独居蜂没有三职型:比较卡消失,仍有 5 张
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/museum/bees/osmia-cornifrons");
  await expect(page.locator(".wb-card")).toHaveCount(5);
  await expect(page.locator(".wb-card", { hasText: "一根巢管里的一年" })).toBeVisible();
});

test("引导讲解:弹卡 → 五站 → 收尾卡,键盘与 URL", async ({ page }) => {
  await page.goto("/?motion=0");
  await page.waitForFunction(() => window.__specimenReady === true, undefined, { timeout: 30_000 });
  await page.getByRole("button", { name: /开始讲解/ }).click();
  await expect(page.getByRole("dialog", { name: /认识一只西方蜜蜂/ })).toBeVisible();
  await page.getByRole("button", { name: "开始", exact: true }).click();
  // 讲解态:两侧变暗、讲解条出现、URL 记站号、目标部位标注点脉冲
  await expect(page.locator(".workbench")).toHaveClass(/touring/);
  await expect(page.locator(".wb-tour-head span")).toContainText("第 1/5 站");
  await expect(page).toHaveURL(/tour=1/);
  await page.getByRole("button", { name: /下一站/ }).click();
  await expect(page.locator(".wb-tour-head span")).toContainText("第 2/5 站");
  await expect(page.locator(".wb-stage")).toHaveAttribute("data-tour-focus", "head");
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/tour=3/);
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/tour=2/);
  // 走到最后一站 → 收尾卡
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: /看完了/ }).click();
  await expect(page.getByRole("dialog", { name: /看完了一只/ })).toBeVisible();
  await page.getByRole("button", { name: "退出", exact: true }).click();
  await expect(page.locator(".workbench")).not.toHaveClass(/touring/);
  await expect(page).not.toHaveURL(/tour=/);
  // 直链进入第 4 站
  await page.goto("/?tour=4&motion=0");
  await expect(page.locator(".wb-tour-head span")).toContainText("第 4/5 站");
  await expect(page.locator(".wb-stage")).toHaveAttribute("data-tour-focus", "abdomen");
});

test("花朵与四季馆:三栏、观察条目联动、未建模占位", async ({ page }) => {
  await page.goto("/museum/flowers?motion=0");
  // 三栏:左列表 / 中舞台 / 右档案卡
  await expect(page.getByRole("heading", { level: 1, name: "油菜" })).toBeVisible();
  await expect(page.locator(".fl-item")).toHaveCount(7);
  await expect(page.locator(".wb-stage canvas")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".fl-bloomcal-row")).toHaveCount(3);
  await expect(page.locator(".fl-bloomcal-row").first()).toContainText("中国东部温带");
  // 点观察条目 → 选中态 + URL 记部位
  await page.locator(".fl-entry-head").nth(1).click();
  await expect(page).toHaveURL(/focus=stamen/);
  await expect(page.locator(".fl-entry.active")).toContainText("花蕊");
  // 重置清掉选中
  await page.getByRole("button", { name: "重置" }).click();
  await expect(page).not.toHaveURL(/focus=/);
  // 未建模占位(七种花已全部建模,此段仅当存在"建模中"徽章时执行)
  if (await page.locator(".fl-badge").count() > 0) {
    const pending = page.locator(".fl-item", { has: page.locator(".fl-badge") }).first();
    const pendingName = await pending.locator("b").textContent();
    await pending.click();
    await expect(page.locator(".fl-stage-placeholder")).toContainText("建模中");
    await expect(page.getByRole("heading", { level: 1, name: pendingName ?? "" })).toBeVisible();
  }
  // 直链带部位参数
  await page.goto("/museum/flowers/flower-brassica-napus?focus=petal&motion=0");
  await expect(page.locator(".fl-entry.active")).toContainText("花冠");
  // 访花演示直链:说明条 + 蜂名 + 证据徽章;motion=0 为落定静格
  await page.goto("/museum/flowers?visit=apis-mellifera&motion=0");
  await expect(page.locator(".fl-visit-bar")).toContainText("西方蜜蜂");
  await page.locator(".fl-visit-bar").getByRole("button", { name: "说明" }).click();
  await expect(page.locator(".fl-visit-bar .fl-evidence")).toBeVisible();
  await page.locator(".fl-visit-bar").getByRole("button", { name: "停止" }).click();
  await expect(page.locator(".fl-visit-bar")).toHaveCount(0);
  await expect(page).not.toHaveURL(/visit=/);
  // 谁来访花关系卡:页签徽章、按蜂分组、证据徽章、点蜂即演示
  await page.goto("/museum/flowers/flower-vaccinium-corymbosum?motion=0");
  await expect(page.locator(".fl-tab-count")).toHaveText("4");
  await page.getByRole("tab", { name: /谁来访花/ }).click();
  await expect(page).toHaveURL(/panel=visitors/);
  await expect(page.locator(".fl-visitor")).toHaveCount(4);
  await expect(page.locator(".fl-rel .fl-evidence").first()).toBeVisible();
  await page
    .locator(".fl-visitor")
    .filter({ has: page.locator(".fl-visitor-head b", { hasText: "角额壁蜂" }) })
    .getByRole("button", { name: "看它访花" })
    .click();
  await expect(page.locator(".fl-visit-bar")).toContainText("角额壁蜂");
  await expect(page).toHaveURL(/visit=osmia-cornifrons/);
  // 花粉筐彩蛋:有粉源/传粉记录的携粉蜂显示提示;仅蜜源记录的不显示
  await page.goto("/museum/flowers/flower-vaccinium-corymbosum?visit=bombus-terrestris&motion=0");
  await expect(page.locator(".fl-visit-phase")).toContainText("花粉筐", { timeout: 20_000 });
  await page.goto("/museum/flowers/flower-medicago-sativa?visit=apis-mellifera&motion=0");
  await expect(page.locator(".fl-visit-phase")).toContainText("正在取蜜", { timeout: 20_000 });
  await expect(page.locator(".fl-visit-phase")).not.toContainText("花粉筐");
  // 地域×季节筛选:直链、列表降灰、关系过滤、空态清除
  await page.goto("/museum/flowers/flower-vaccinium-corymbosum?region=region-china-east&season=spring&panel=visitors&motion=0");
  // chips 渲染两处(左栏 + 窄屏条),断言限定左栏
  await expect(page.locator(".fl-filters .fl-filter-row button.active")).toHaveCount(2);
  await expect(page.locator(".fl-item.dim")).toHaveCount(2);
  await expect(page.locator(".fl-visitor")).toHaveCount(3);
  await page.locator(".fl-filters .fl-filter-row button", { hasText: "夏" }).click();
  await expect(page.locator(".fl-visitors-empty")).toBeVisible();
  await page.locator(".fl-clear-filter").click();
  await expect(page.locator(".fl-visitor")).toHaveCount(4);
  await expect(page).not.toHaveURL(/region=/);
  // 窄屏(手机):左栏与常驻筛选条都隐藏,筛选收进工具栏按钮弹出的抽屉
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".wb-library")).toBeHidden();
  await expect(page.locator(".fl-filters-narrow")).toBeHidden();
  await expect(page.locator(".wb-tools .fl-glyph").first()).toBeVisible(); // 曾被手机规则藏掉图标、压成空胶囊
  await page.locator(".wb-tools .fl-tool-filter").click();
  await page.locator(".fl-drawer button", { hasText: "北美温带" }).click();
  await page.locator(".fl-drawer .fl-filter-row button", { hasText: "春" }).click();
  await expect(page).toHaveURL(/region=region-north-america-east/);
  // 反馈链:抽屉内即时计数;关抽屉后花名条降灰重排、状态签可一键清除
  await expect(page.locator(".fl-drawer-count")).toContainText("种在开");
  await page.locator(".fl-drawer .fl-drawer-done").click();
  await expect(page.locator(".fl-drawer")).toHaveCount(0);
  await expect(page.locator(".fl-tool-filter .wb-badge")).toHaveText("2"); // 生效筛选数徽章
  await expect(page.locator(".species-switch button.dim").first()).toBeAttached();
  await expect(page.locator(".fl-filter-tag")).toContainText("北美温带");
  await page.locator(".fl-filter-tag").click();
  await expect(page).not.toHaveURL(/region=/);
  await expect(page.locator(".fl-filter-tag")).toHaveCount(0);
  // 平板宽度:常驻筛选条仍在舞台顶部第二行
  await page.setViewportSize({ width: 900, height: 700 });
  await expect(page.locator(".fl-filters-narrow")).toBeVisible();
  // 不应季横幅:筛北美·春时紫花苜蓿不在花期,提示并可跳到应季的花
  await page.goto("/museum/flowers/flower-medicago-sativa?region=region-north-america-east&season=spring&motion=0");
  await expect(page.locator(".fl-offseason")).toContainText("不在花期");
  await page.locator(".fl-offseason button").click();
  await expect(page).not.toHaveURL(/medicago/);
  await expect(page.locator(".fl-offseason")).toHaveCount(0);
});
