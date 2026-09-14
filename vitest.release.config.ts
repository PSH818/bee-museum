import { defineConfig } from "vitest/config";

// 正式发布门禁:draft 内容存在即失败(产品方案 §9.2)。
// 日常 `npm test` 不包含它;`npm run build:release` 会先跑它。
export default defineConfig({
  test: {
    include: ["tests/release/**/*.test.ts"],
    environment: "node",
  },
});
