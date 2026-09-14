# 东方蜜蜂工蜂 · 独立 Blender 模型

制作日期：2026-09-07。物种：东方蜜蜂 `Apis cerana`，职型：工蜂，雌性。

## 文件

- `apis-cerana-worker.blend`：Blender 5.1.2 可编辑工程，包含模型、材质节点、毛发几何、灯光、地面以及三个相机。
- `apis-cerana-worker.glb`：单独的完整精度模型；不包含地面、相机和灯光。
- `preview-hero.png`：三分之四角度渲染。
- `preview-dorsal.png`：俯视渲染。
- `preview-lateral.png`：侧视渲染。
- `build_model.py`：可重复生成模型的 Blender 脚本。
- `model-info.json`：网格数量、三角面和尺寸统计。
- `validate_model.py` / `validation.json`：工程与 GLB 的结构检查脚本及结果。

## 建模范围

独立制作的静态数字标本。头、胸、腹、复眼、三只单眼、触角、口器、六足、前后翅及毛被分件命名，方便后续编辑。四片翅采取展开观察姿态，两只后足的花粉筐保持空载，螫针收起。

腹部通过连续轮廓构成六段甲壳，配以低饱和赭色环带和细短毛缘；胸部覆盖细短、部分分叉的毛发。足部保留基节、转节、股节、胫节、五节跗节和爪；触角每侧由柄节、梗节和十节鞭节构成。

所有几何与表面均在 Blender 内创建，没有使用外部模型、照片贴图或 AI 图片。毛发是可导出的网格纤维。当前没有骨骼绑定或动画。

## 尺度与使用

Blender 工程中 `1 单位 = 1 毫米`，场景单位缩放为 `0.001`；身体长约 10 mm，包含触角的全长约 10.9 mm。`+X` 为尾部，`+Z` 为背部。GLB 已显式转换为米并采用 glTF 的 Y-up 约定。

在 Blender 中打开工程后可以直接按 F12 重渲染。相机名称为 `Camera_Hero`、`Camera_Dorsal`、`Camera_Lateral`。`01` 集合是蜜蜂，`02` 集合是摄影环境。模型根节点为 `Apis_cerana_worker`。

GLB 保留几何、透明翅膜和标准 PBR 参数。Blender 材质中的程序化微凹凸和薄膜细节并未烘焙为贴图，因此网页显示不会与 Cycles 渲染完全一致。工程是完整精度母版；若未来用于同时展示大量展品，应另做减面与材质合并。

## 形态参考与边界

本模型是科普展示用的形态表达，不是扫描件或物种鉴定测量模型。东方蜜蜂不同地区、个体年龄的体色、体型和毛被有差异；翅脉按蜜蜂结构作了简化，不用于计算鉴定指标。

- [Queensland Government — Asian honey bee manual](https://era.dpi.qld.gov.au/id/eprint/9193/1/2423_AHB-manual_WEB.pdf)，2013，印刷页 2–5：工蜂整体外形、深色头胸、腹部环带、两对翅及触角。其现场比较主要针对爪哇基因型，不能把体色参数视为全物种固定特征。
- [Morphology and Olfactory Recognition of Leg Sensilla in Honeybee Workers of Apis cerana cerana](https://www.mdpi.com/2075-4450/16/9/961)，2025：工蜂足部与花粉筐结构。
- [An Evaluation of Morphometric Characteristics of Honey Bee (Apis cerana) Populations in the Qinghai–Tibet Plateau in China](https://pmc.ncbi.nlm.nih.gov/articles/PMC11856382/)，2025：地理环境与外形差异。

以上资料用于形态参考；未将来源图片或文字嵌入模型。
