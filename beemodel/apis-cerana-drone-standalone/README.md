# 东方蜜蜂雄蜂 · 独立 Blender 模型

制作日期：2026-09-08。物种：东方蜜蜂 `Apis cerana`；类型：雄蜂，成年雄性。

独立保存的静态科普展示模型。没有改动网站、现有工蜂、蜂王或旧雄蜂资源。建模脚本复用项目内基础工具，但雄蜂的头眼、胸腹和触角等重新构造；本目录可以独立生成模型，不依赖其他模型目录。

## 交付文件

- `apis-cerana-drone.blend`：Blender 5.1.2 可编辑工程，含分件模型、程序化材质、摄影棚、灯光及三个相机。
- `apis-cerana-drone.glb`：完整精度模型，不含地面、摄影灯光和相机。
- `preview-hero.png`、`preview-dorsal.png`、`preview-lateral.png`：1500 × 1200 像素斜视、俯视和侧视渲染。
- `build_model.py`：独立 Blender 建模、导出和渲染脚本。
- `model-info.json`：实际网格、三角面及尺寸统计。
- `validate_model.py`、`validation.json`：结构验证与 GLB 独立重新导入检查。

## 雄蜂版本

- 复眼沿头壳两侧向背部包覆，在头顶中线附近形成窄缝，不是简单放大工蜂的眼球。眼面有程序化微纹理与少量几何短毛。
- 三只单眼前移至额部，避开扩大的背侧复眼。
- 胸部加宽加厚，增加短绒毛；腹部较短、宽厚，腹端呈圆钝轮廓。
- 腹部按七段外观背板分件，配合简化腹侧板；深褐近黑的外壳配低对比环带与细毛。
- 每侧触角为柄节、梗节和十一节鞭节，共 13 节；六足各保留五节跗节和双爪。
- 四片翅轻度展开以便观察；口器短而折于头下。没有螫针、花粉筐、花粉团或工蜂采粉刷。

这是雄蜂静息状态的外部展示，没有制作内脏、外翻的生殖器、骨骼绑定或飞行动画。

## 单位和使用

设计身体长度约 11.4 mm（不包含触角和足），这是展示模型的设定值，并非对某个采集标本的实测。东方蜜蜂会有地域、年龄与个体差异，本模型不指定地方亚种。

Blender 中 `1 单位 = 1 毫米`，场景单位缩放为 `0.001`。`+X` 朝腹端，`+Z` 朝背部。GLB 显式转换为米并采用 glTF 的 Y-up 坐标；包括触角及翅足的整体包围盒以 `model-info.json` 为准。

打开 `.blend` 后按 F12 可渲染。模型集合为 `01 | APIS CERANA • Drone`，根对象为 `Apis_cerana_drone`；摄影棚位于 `02` 集合。三台相机分别是 `Camera_Hero`、`Camera_Dorsal` 和 `Camera_Lateral`。

重新生成会覆盖本目录的同名输出：

```powershell
& 'D:\blender\blender.exe' --background --python 'D:\artist\bee\beemodel\apis-cerana-drone-standalone\build_model.py'
```

## 材质与精度边界

所有几何和材质均在 Blender 中生成，未使用外部模型、AI 图片或照片贴图。毛发为实际网格纤维，能随 GLB 一起导出。

GLB 保留几何、透明翅膜与标准 PBR 参数。Blender 中的程序化凹凸、复眼细纹和薄膜细节未烘焙，因此网页效果不会与 Cycles 预览完全一致。完整精度母版未做网页批量展品的减面、材质合并或纹理烘焙。

本模型不是扫描件或分类鉴定模型；翅脉、口器、末端节片与复眼微结构经过展示性简化，不适合测量鉴定指数。

## 参考资料

- [Streinzer 等，2013：五种蜜蜂的性别与职型复眼形态比较](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0057702)。研究包含东方蜜蜂，用于复眼的性别差异和背侧扩张特征参考；没有逐一复制小眼数值。
- [蜜蜂单眼的组织与区域特化](https://www.sciencedirect.com/science/article/pii/S1467803911000703)。辅助参考雄蜂单眼在额部的布局；研究对象为西方蜜蜂，不将其测量值当作东方蜜蜂数据。
- [India Biodiversity Portal：东方蜜蜂说明与雄蜂照片](https://www.indiabiodiversity.org/group/The_Living_Earth/observation/show/18551584)。辅助核对粗短腹端、大复眼及无螫针的外形描述；此为观察门户资料，不作为精密测量依据。
- [Ohio State University 作者，1983：The Antennae of the Honey Bee](https://cdn.beeculture.com/wp-content/uploads/2025/05/Aug-1983-Final-R.pdf)。用于雄蜂触角柄节、梗节和十一节鞭节的组成参考。

以上仅用于形态参考，交付文件不包含来源图像或外部模型。
