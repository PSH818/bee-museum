# 高级艺术化写实：蜜蜂视觉方向稿与 3D 实施标准

> 状态：V1 视觉方向稿  
> 日期：2026-08-12  
> 方向图：[worker-bee-macro-art-direction-v1.png](./styleframes/worker-bee-macro-art-direction-v1.png)

## 1. 定稿结论

产品视觉从“明亮花田科普插画”调整为“以工蜂为主角的高级艺术化写实微距世界”。

方向图用于统一以下事项：

- 蜜蜂在画面中的主体尺度。
- 深绿色微距环境与暖色轮廓光。
- 绒毛、复眼、翅脉、腹部与花粉的材质层次。
- 浅景深和低干扰背景。
- 页面左侧的极简纪录片式界面留白。

方向图不是科学结构图，也不能直接替代 3D 模型参考。模型制作仍需以昆虫学资料与真实工蜂多角度照片为依据。

## 2. 视觉目标

### 应当呈现

- 一只工蜂占据主要视觉面积，花朵与环境为它服务。
- 轮廓、比例和关键结构足够可信。
- 绒毛明显但不逐根模拟。
- 翅膀透明、轻薄、有清晰翅脉。
- 复眼具有细节但不过度放大。
- 花粉附着可以看见，但不堆成夸张球体。
- 画面安静、靠近、略带未知感。
- 微距镜头和环境声音共同营造沉浸，而不是依靠大标题。

### 必须避免

- 卡通吉祥物与可爱表情。
- 塑料玩具般的光滑材质。
- 熊蜂式过度蓬松和圆胖体型。
- 胡蜂式细腰和锐利轮廓。
- 复眼大到接近雄蜂特征。
- 黄黑高饱和条纹。
- 明亮旅游宣传片式花田。
- 蜂巢六边形 UI 装饰泛滥。
- 3D 模型悬空自转配左右信息栏。

## 3. 工蜂科学结构基线

后续模型必须单独复核，不从方向图直接照抄：

- 身体分为头、胸、腹三部分。
- 一对分节触角。
- 两只复眼和三个单眼的位置关系。
- 三对足，全部连接胸部。
- 两对翅，前翅大于后翅，并由胸部连接。
- 工蜂后足具备携粉相关结构。
- 口器适合取食花蜜，并能在采集镜头中展开。
- 腹部比例与条带不能做成胡蜂细腰。
- 工蜂复眼不能使用雄蜂式极大比例。

AI 方向图中任何足部遮挡、翅脉、花粉团和花部细节都只作气氛参考。

## 4. 3D 模型标准

| 项目 | 桌面端目标 | 移动端策略 |
| --- | --- | --- |
| 三角面 | 6 万～10 万 | 使用简化 LOD，约 2 万～4 万 |
| 基础贴图 | 2K PBR | 1K～2K 按设备选择 |
| 复眼 | 法线／高度与粗糙度表现小眼结构 | 降低法线强度和采样成本 |
| 绒毛 | 烘焙细节 + 轮廓少量毛发卡 | 关闭多数毛发卡，仅保留烘焙细节 |
| 翅膀 | 透明薄膜材质 + 翅脉贴图 | 简化透明排序与高光 |
| 花粉 | 贴图、少量实例颗粒 | 只保留贴图和少量颗粒 |
| 文件格式 | GLB + Meshopt／Draco | 同一资源的 LOD 或独立轻量 GLB |
| 压缩后体积 | 5～10 MB | 3～6 MB 优先 |

## 5. 材质拆分

### 头部与复眼

- 复眼基色接近深褐黑，不做纯镜面黑球。
- 使用法线贴图表现细小单元，避免真实几何堆叠。
- 粗糙度保持中高，只在轮廓与光源方向出现克制高光。
- 头部短毛与复眼边界需要清晰。

### 胸部绒毛

- 绒毛是识别质感的重点。
- 主要体积由模型和烘焙法线承担。
- 毛发卡只布置在背部轮廓、头胸连接和侧面逆光区域。
- 避免均匀、过长或像毛绒玩具的毛发。

### 腹部

- 保留细毛、分节和带状颜色变化。
- 色彩为深褐、灰黑与克制琥珀，不使用纯黄纯黑。
- 粗糙度高于翅膀和复眼。

### 翅膀

- 透明度不应让翅膀消失。
- 翅脉清晰但不过度发亮。
- 逆光提供窄而温暖的边缘高光。
- 飞行状态可使用动画模糊近似，不依赖昂贵实时运动模糊。

### 足与花粉

- 足部关节在特写时应有明确剪影。
- 后足携粉结构必须经过参考资料校验。
- 花粉只在采集后逐渐出现，不作为模型常驻装饰。

## 6. 镜头与灯光

### 默认镜头

- 镜头高度与蜜蜂近似齐平。
- 三分之四侧面观察，能同时看到头部、胸部、腹部和翅膀。
- 蜜蜂占桌面画面宽度约 35%～50%。
- 允许用户有限角度环绕，不允许倒转到失去情境的任意视角。

### 灯光

- 主光模拟清晨或林缘自然光。
- 背光用于显示绒毛和翅膀轮廓。
- 环境光维持暗部结构，不把蜜蜂照成黑色剪影。
- 不使用蓝紫色科幻补光或影棚产品灯效果。

### 景深

- 默认焦点在头部与前胸。
- 用户选择翅膀、后足或腹部时平滑移焦。
- 移动端可关闭实时景深，以多层背景模糊替代。

## 7. 首屏界面规则

首屏只显示：

- 产品小型标识。
- 一句引导：“靠近一点，看看它如何感知这个世界。”
- 主行动：“开始观察”。
- 声音开关。
- 操作提示。

进入观察后才出现能力入口：

- 它如何看。
- 它如何闻。
- 它如何飞。
- 它如何采集。

界面表现为细线、短字幕和半透明深色层，不使用大卡片、胶囊导航和手账纸张。

## 8. 首个可运行样片范围

```text
黑暗微距环境中出现工蜂
→ 工蜂落在油菜花上
→ 用户有限角度观察
→ 镜头聚焦复眼，进入感知模式
→ 镜头聚焦触角，观察轻微摆动
→ 口器展开并采集花蜜
→ 花粉逐渐附着到体毛和后足
→ 工蜂整理花粉并准备起飞
```

首个样片暂不开发：

- 四季花历。
- 完整蜂蜜图鉴。
- 蜂花手记。
- 蜂王浆专题。
- 完整蜂群与蜂巢仿真。

上述内容保留为后续章节，但不能分散首个样片对工蜂主体的投入。

## 9. 动画清单

| 动画 | 最低要求 | 优先级 |
| --- | --- | --- |
| Idle | 腹部轻微起伏、触角异步摆动、足部微调 | P0 |
| Landing | 减速、前足接触、其余足稳定、收翅 | P0 |
| Feeding | 头部贴近、口器展开、触角持续微动 | P0 |
| Pollen grooming | 前／中足整理，花粉向后足聚集的简化表达 | P0 |
| Takeoff | 抬胸、翅膀预振、足离开花朵 | P0 |
| Flight loop | 身体轻微俯仰，翅膀高速振动 | P0 |
| Look response | 用户靠近时头部与触角产生轻微响应 | P1 |

动画不能只由身体整体平移替代。足部接触、翅膀状态和身体重心是可信度重点。

## 10. 下一步进入模型选型的门槛

基础模型至少需要满足：

- 可确认授权允许网站使用与修改。
- 工蜂体型，不是熊蜂、胡蜂或雄蜂。
- 关键结构可以拆分或重新绑定。
- 足、触角、口器和翅膀拓扑足以支持动画。
- UV 可用，材质可以替换。
- 能导出 GLB，并可以生成移动端 LOD。

如果开源模型不能同时满足结构与动画要求，优先选择拓扑可修改的中等精度模型，而不是只能展示、无法绑定的高精度扫描模型。

## 11. 风格方向图提示词记录

生成方式：Codex 内置图像生成工具。

### 首次生成

```text
Use case: stylized-concept
Asset type: cinematic visual style keyframe for the hero scene of an immersive honeybee science website
Primary request: an advanced stylized-realistic macro view of one worker honeybee landing on a blooming rapeseed flower, making the bee the unmistakable protagonist
Scene/backdrop: flower-height micro-world among Brassica napus blossoms; only a few yellow four-petaled flowers and green stems near the focal plane; deep olive and forest-green background dissolving into soft natural bokeh, with a few subtle airborne pollen motes
Subject: one anatomically plausible worker honeybee, Apis mellifera, shown full-body in a clean three-quarter side view as it grips one rapeseed flower; clearly readable head, thorax, segmented abdomen, two antennae, six articulated legs, overlapping forewing and hindwing pairs, compound eyes, proboscis reaching toward the flower, and a modest golden pollen load on the hind-leg pollen baskets
Style/medium: premium high-end 3D concept render with advanced stylized realism; scientifically grounded proportions; tactile but deliberately simplified body fuzz; detailed compound-eye surface and translucent veined wings; not fully photorealistic, not cartoon, not a plastic toy
Composition/framing: cinematic 16:9 macro composition; bee fills about 45 percent of the frame and sits slightly right of center; eye-level with the bee; entire bee remains inside frame; shallow depth of field; generous darker low-detail negative space on the left for minimal interface copy; strong foreground-to-background depth suitable as a 3D art-direction reference
Lighting/mood: quiet early-morning natural backlight, warm rim light catching fuzz and wing edges, restrained highlights, subtle volumetric haze, intimate documentary mood, mysterious and immersive rather than cheerful advertising
Color palette: deep forest green, olive, muted rapeseed yellow, warm amber, soft cream wing highlights; restrained saturation and cinematic contrast
Materials/textures: fine short thorax fuzz, subtly banded abdomen with natural roughness, translucent wing membranes with accurate-looking vein network, faceted dark compound eyes, small pollen grains on hairs and hind legs
Constraints: exactly one bee; no text, letters, logo, watermark, UI, honey jar, honeycomb, beekeeper, hive, extra insects, fantasy anatomy, oversized flower, excessive particles; do not crop wings, legs, or antennae; flower has four petals rather than sunflower-like petals
Avoid: cartoon character, cute mascot, bright travel-poster flower field, clinical laboratory, anatomy dashboard, glossy plastic insect, giant bumblebee, wasp-like waist, duplicated legs, missing legs, extra wings, deformed antennae, neon colors, busy background
```

### 校正编辑

```text
Use case: precise-object-edit
Input images: Image 1: edit target and approved composition/style reference
Primary request: correct only the honeybee anatomy so the subject reads clearly as a worker honeybee rather than a drone
Required change: make the visible compound eye moderately smaller and more laterally placed, with a proportion appropriate for an Apis mellifera worker; keep a clear furry head area between the eyes; keep exactly two segmented antennae; preserve six articulated legs and the overlapping two pairs of wings in anatomically plausible positions
Invariants: keep the same bee pose, flower contact, proboscis action, modest pollen load, full-body framing, flower arrangement, dark negative space on the left, macro lens, shallow depth of field, warm rim lighting, deep green palette, premium advanced stylized-realistic 3D material treatment, and all other scene details unchanged
Constraints: no text, logo, watermark, UI, extra insects, extra legs, missing legs, extra antennae, cropped appendages, cartoon styling, or glossy plastic look
```

