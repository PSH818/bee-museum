# 蜜蜂 3D 底模评估与选型 v1.0

> 更新日期：2026-08-12  
> 对应视觉方向：`docs/advanced-stylized-realism-direction.md`  
> 对应风格帧：`docs/styleframes/worker-bee-macro-art-direction-v1.png`

## 1. 本轮结论

本产品不直接采用免费卡通蜜蜂作为正式视觉主体。

正式底模优先选用 **Western Honey Bee (Worker)**，在此基础上进行比例校正、材质重制、绒毛优化和网页端减面。它目前是候选中最符合“以工蜂为主角、兼顾科普准确性与高级艺术化写实”的方案。

在购买前，先向作者确认动画清单、骨骼结构、翅膀透明材质和 FBX 的可编辑性。确认通过后再采购；本轮没有产生任何付费。

免费模型只承担两种用途：

- 验证网页端加载、旋转、热点标注和动画切换；
- 为镜头、交互节奏和性能预算提供临时占位。

## 2. 评估标准

| 维度 | 权重 | 关键问题 |
| --- | ---: | --- |
| 生物结构与工蜂辨识度 | 30% | 是否像西方蜜蜂工蜂；头、胸、腹、足、翅、触角和复眼比例是否可信 |
| 绑定与动画 | 25% | 是否有可用骨骼；飞行、悬停、降落、爬行等动作能否直接使用或改造 |
| 材质与视觉潜力 | 20% | 是否支持 PBR；绒毛、腹部反射和透明翅是否能达到高级艺术化写实 |
| 网页适配 | 15% | 是否容易转为 GLB；面数、纹理、材质数量与透明排序是否可控 |
| 授权与获取成本 | 10% | 是否允许在网站中使用；是否需要署名；能否合法交付和持续维护 |

## 3. 候选模型对比

| 候选 | 定位 | 已知结构 | 动画/绑定 | 授权与获取 | 综合判断 |
| --- | --- | --- | --- | --- | --- |
| **Western Honey Bee (Worker)** | 正式底模首选 | 42,368 面、35,770 顶点、7 材质、5 张最高 2K 纹理；通过平台几何和 PBR 检查 | 已绑定，11 条动画轨道 | CGTrader Royalty Free；Fab 当前显示约 US$42.99 起，价格以购买页为准 | **A：优先采购前验收**。结构、动作和网页预算最均衡 |
| **Bee Rigged PBR Low-poly** | 正式底模备选 | 无毛版 21,316 面；带毛版 38,366 面、70,565 顶点；4K 身体纹理、2K 绒毛纹理 | 已绑定、标记为 Animated | 原 CGTrader 页面显示 US$39，但目前不可购买；Sketchfab 标记 NoAI | **B：视觉备选**。外观潜力高，但获取状态和毛发性能有风险 |
| **Honey Bee / Sketchfab** | 免费写实候选 | 约 51.7k 三角面、27.4k 顶点、2K 身体与翅膀纹理 | 页面说明完整绑定、1 个飞行循环 | 免费下载页；实际授权与下载包需登录后再次核对 | **B-：可下载后复检**。面数尚可，但动画少、授权证据要随包保存 |
| **Bee / OpenGameArt** | 免费骨骼占位 | `.blend`，约 1.7 MB；作者同时提供绑定与非绑定版 | 有绑定；作者留言称动画后续补充，因此按“无可用动作”评估 | CC0 | **C：管线占位**。造型偏 toon，作者也明确表示并非高度真实 |
| **Bee / Pixabay** | 最轻量交互占位 | GLB，1,387 顶点，带纹理 | 页面标记有动画 | Pixabay Content License | **C：性能验证**。格式最方便，但明显卡通，不进入正式美术链路 |
| **Meshy 蜜蜂模型** | 造型灵感或粗胚 | 多种 AI 生成静态网格 | 官方标签页说明预制模型通常没有骨骼 | 具体模型逐项核对 | **D：不建议做主底模**。科学准确性、拓扑和绑定返工不可预测 |

## 4. 推荐方案

### 4.1 正式制作路径

1. 采购前向作者确认 11 条动画的名称与视频预览。
2. 确认 FBX 中包含骨骼、蒙皮权重、动画和完整纹理引用。
3. 采购后在 Blender 中做生物结构验收，尤其检查：
   - 一对触角；
   - 两只复眼与三只单眼；
   - 两对翅，后翅不应缺失；
   - 三对足，后足花粉筐轮廓适合工蜂；
   - 头、胸、腹三段关系与腹部节段；
   - 口器、足节和翅脉在近景中是否经得起放大。
4. 按高级艺术化写实方向重做或调整材质：
   - 腹部不是纯黑黄条纹，而是带棕黑、琥珀和细微粗糙度变化；
   - 胸部绒毛用纹理、法线和少量几何卡片组合，不使用网页端高成本真实毛发；
   - 翅膀使用低透明度、细微虹彩与法线细节，控制透明排序问题；
   - 复眼保持工蜂比例，避免“大眼萌化”。
5. 导出网页专用 GLB，并制作高低两档：
   - Desktop Hero：约 35k–55k 三角面，2K 主纹理；
   - Mobile / List：约 15k–25k 三角面，1K 主纹理。

### 4.2 零预算过渡路径

如暂时不采购，使用 Pixabay 的 GLB 或 OpenGameArt 的绑定版完成以下交互原型：

- 首屏悬停与轻微呼吸感；
- 拖拽旋转、限制视角、滚轮近景；
- 头部、胸部、腹部、翅膀、后足五个热点；
- “悬停 / 飞行 / 落花 / 采集”动作状态机；
- 桌面与手机的加载降级。

占位模型不用于决定最终配色、比例和镜头距离，避免卡通造型反向影响产品风格。

## 5. 采购前必须确认的问题

发送给模型作者的问题：

1. 11 条动画分别是什么？是否包含 idle、hover、flight loop、takeoff、landing、walk 或 forage？
2. 所有动画是否已烘焙进 FBX，导入 Blender 后无需原始插件即可播放？
3. 两对翅是否为独立可控骨骼或对象？前后翅能否分别调整？
4. 是否包含完整 UV 与 Base Color、Roughness、Metalness、Normal 纹理？
5. 翅膀透明度是否使用常规材质，可否转换到 glTF / GLB？
6. 网站公开部署 GLB 是否属于授权允许的 Incorporated Product？对防止模型文件被单独提取有何要求？

其中第 6 项最重要。CGTrader 对 Royalty Free 的说明要求模型被整合进产品，并避免第三方以独立资源形式提取。纯前端网站的 GLB 天然会传输到浏览器，因此在购买前必须让平台或作者书面确认部署方式，必要时采用压缩、拆分、签名地址或服务端保护。若最终坚持完全静态托管且无法满足许可要求，应改用 CC0、自制或定制买断模型。

## 6. 网页模型验收线

| 指标 | Desktop Hero | Mobile | 不通过时的处理 |
| --- | ---: | ---: | --- |
| 首屏模型下载体积 | ≤ 8 MB | ≤ 4 MB | Draco / Meshopt、纹理 KTX2、删减隐藏几何 |
| 三角面 | 35k–55k | 15k–25k | 减面并保留头、翅、后足轮廓 |
| 材质数量 | ≤ 5 | ≤ 3 | 合并材质与纹理图集 |
| 主纹理 | 2K | 1K | KTX2 / WebP，拆分法线精度 |
| 动画片段 | 4–6 个核心动作 | 2–4 个核心动作 | 只保留首屏真实使用动作 |
| 60 FPS 目标 | 中端独显 / Apple Silicon | 近三年主流手机 30–60 FPS | 降 DPR、关闭景深、换低模 |

## 7. 本地检查状态

- 已建立候选资产目录：`assets/models/candidates/open-game-art-bee/`。
- 当前环境未安装 Blender，无法直接展开 `.blend` 的骨骼层级。
- OpenGameArt 的页面和文件链接可访问，但文件下载连接在当前运行环境被站点重置；没有把不完整文件写入项目。
- 因此，本轮对免费模型的判断基于来源页公开信息；购买或正式采用任何模型后，仍需执行 Blender 导入验收和 GLB 网页压力测试。

## 8. 下一开发步

在未采购正式模型前，开发不等待：先搭建“蜜蜂观察舱”交互骨架，用程序化占位物完成镜头、热点、标签和动画状态。与此同时向首选模型作者确认授权与动画。这样美术资产到位后，只需要替换模型和调整挂点，不推翻页面交互。

## 9. 来源记录

- Western Honey Bee (Worker)：https://www.cgtrader.com/3d-models/animal/insect/western-honey-bee-worker
- Western Honey Bee (Worker) / Fab 分类页：https://www.fab.com/category/3d-model/characters-creatures--insects
- Bee Rigged PBR：https://www.cgtrader.com/3d-models/animals/insect/bee-rigged-pbr
- Bee Rigged PBR / Sketchfab：https://sketchfab.com/3d-models/bee-rigged-pbr-low-poly-6cffc9963636493db31b3ba0efa03f60
- Honey Bee / Sketchfab：https://sketchfab.com/3d-models/honey-bee-97d397a1220748cabd78ee82e88cb115
- Bee / OpenGameArt：https://opengameart.org/content/bee-0
- Bee / Pixabay：https://pixabay.com/3d-models/bee-insect-animal-yellow-black-687/
- CGTrader Royalty Free License：https://help.cgtrader.com/hc/en-us/articles/360015124437-Royalty-Free-License

