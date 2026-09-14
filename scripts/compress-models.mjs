// M6 · GLB 压缩(meshopt + 量化):node scripts/compress-models.mjs [文件名...|--all]
// 约定:不 prune(锚点是无网格的空节点,修剪会删掉它们);压缩前后节点名集合必须一致。
// 原件已备份于 models-backup/。
// ⚠ 标准蜂标本(bee-hero*)禁止压缩:顶点色 + 程序化部件动画与 meshopt/量化不兼容,
//   压缩后条纹变暗棕、绒毛不可见(2026-09-11 事故,已回滚);--all 自动跳过。
//   花/巢脾/精模(纯材质色)已验证安全。
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { weld, quantize, reorder } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import { readdirSync, statSync } from "node:fs";

const DIR = "public/models";
const args = process.argv.slice(2);
const files = args.includes("--all")
  ? readdirSync(DIR).filter((f) => f.endsWith(".glb") && !f.startsWith("bee-hero"))
  : args;

await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

let before = 0;
let after = 0;
for (const file of files) {
  const path = `${DIR}/${file}`;
  const sizeBefore = statSync(path).size;
  const doc = await io.read(path);
  const namesBefore = doc.getRoot().listNodes().map((n) => n.getName()).filter(Boolean);

  await doc.transform(
    weld(),
    quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }),
    reorder({ encoder: MeshoptEncoder }),
  );
  doc
    .createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });

  // quantize 会注入无名变换父节点(无害);只要求原有命名节点(锚点/部件)零丢失
  const namesAfter = new Set(doc.getRoot().listNodes().map((n) => n.getName()));
  const lost = namesBefore.filter((n) => !namesAfter.has(n));
  if (lost.length > 0) {
    console.error(`✗ ${file}: 丢失命名节点 ${lost.join(",")},跳过写回!`);
    process.exitCode = 1;
    continue;
  }
  await io.write(path, doc);
  const sizeAfter = statSync(path).size;
  before += sizeBefore;
  after += sizeAfter;
  console.log(
    `✓ ${file}: ${(sizeBefore / 1024).toFixed(0)}KB → ${(sizeAfter / 1024).toFixed(0)}KB (${((1 - sizeAfter / sizeBefore) * 100).toFixed(0)}% ↓)`,
  );
}
if (files.length > 1) {
  console.log(
    `合计: ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB`,
  );
}
