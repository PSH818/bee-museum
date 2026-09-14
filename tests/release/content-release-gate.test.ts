import { expect, it } from "vitest";
import { validateContent } from "../../src/data/validate";

// 发布门禁:正式展出的内容必须至少 reviewed(产品方案 §9.2)。
// 在内容完成人工审校之前,这个测试会如实失败并列出全部草稿条目——
// 这是有意为之:它阻止的是 `npm run build:release`,不影响日常构建。
it("正式发布门禁:所有展出内容至少 ai-reviewed,无草稿", () => {
  const result = validateContent({ releaseGate: true });
  expect(result.errors, "存在未审校内容,禁止正式发布").toEqual([]);
});
