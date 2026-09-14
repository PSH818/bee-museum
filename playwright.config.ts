import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  // 全量运行时偶发 canvas 未创建(单跑均过,根因待查,trace 在重试时收集)
  retries: 1,
  expect: {
    // frozen frameloop => renders are near-deterministic on one machine;
    // keep the tolerance tight so small geometry/material drift still fails
    toHaveScreenshot: { maxDiffPixelRatio: 0.004 },
    // 访花静格用单帧捕获(toMatchSnapshot),同一容差
    toMatchSnapshot: { maxDiffPixelRatio: 0.004 },
    // 全量运行时 GPU 与开发服务器负载高,交互断言(URL 防抖、镜头收敛)需要更宽裕的等待
    timeout: 12_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4183",
    viewport: { width: 1280, height: 800 },
    trace: "on-first-retry",
    // 套件内带 WebGL 画布的页面已超过 Chromium 默认 16 个活动上下文的上限,
    // 旧上下文被强制丢弃会让新画布偶发创建失败 → 放宽上限
    launchOptions: { args: ["--max-active-webgl-contexts=64"] },
    deviceScaleFactor: 1,
  },
  webServer: {
    command: "npm run dev -- --port 4183 --strictPort",
    url: "http://127.0.0.1:4183",
    // 4183 is reserved for tests; never reuse a possibly-stale process
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
