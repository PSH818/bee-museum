# M3 · 花朵与四季馆 实施计划

> 2026-08-26 定稿。依据:产品方案 §4.4 / §5.2 / §5.3 / §7.4 / §9.1,前端方案 §6.3 / §7.2 / §8(花朵锚点)/ §11.2(关系模型)。

## 已定决策

| 事项 | 决定 |
|---|---|
| 花朵清单 | 6 种 MVP 花 + **紫花苜蓿**(Medicago sativa,苜蓿切叶蜂的核心关系与重要蜜源)= 7 种;苹果花留二期 |
| "槐花" | 按**刺槐**(Robinia pseudoacacia,洋槐,槐花蜜来源) |
| "三叶草" | 按**白车轴草**(Trifolium repens) |
| "蓝莓" | 按**高丛蓝莓**(Vaccinium corymbosum) |
| 建模路线 | 沿用蜜蜂的混合管线:Blender 参数化生成 + Cycles 烘焙 + GLB 双 LOD(浏览器端只做风摆与实例化花粉),不做纯浏览器几何 |
| 关系口径 | 只画有来源的关联;`evidence` 为 editorial 的关系在界面不得表述为"偏好";地域与季节不可省略(前端方案 §11.2) |
| 秋冬 | 不做场景;花期条上标注,链接到生命历程的越冬内容(方案 §5.3) |

七种花:油菜(Brassica napus)· 刺槐(Robinia pseudoacacia)· 向日葵(Helianthus annuus)· 高丛蓝莓(Vaccinium corymbosum)· 白车轴草(Trifolium repens)· 薰衣草(Lavandula angustifolia)· 紫花苜蓿(Medicago sativa)。
三地域:中国东部温带 · 中欧 · 北美温带;首期各做春、夏两季。

## 数据实体

- `Region`:id、名称、描述、春/夏对应月份口径、来源、审校状态。
- `FlowerSpecies`:id、中文名/学名/英文名/科、花型(radial / bilateral / papilionaceous / capitulum / spike)、花冠深度区间(mm,有来源才填)、每地域花期月份、花蜜/花粉特征、摘要、来源、审校状态;3 条观察条目(花冠 / 花蕊 / 花序)复用观察条目结构。
- `BeeFlowerRelation`:beeId、flowerId、regionId、season、relation(nectar / pollen / pollination / observed-visit)、evidence(primary / review / institutional / editorial)、一句说明、来源、审校状态。
- 校验:引用的蜂、花、地域、来源必须存在;关系的季节必须落在该花在该地域的花期内;花朵观察条目必须齐三项;editorial 关系必须带说明。

## 六步

1. **数据层与内容**(≈1.5 天 + 审查):实体、校验、7 花 × (1 卡 + 3 条目)、3 地域卡、约 15–20 条关系;来源新增(各植物词条 + 传粉文献);dump/merge/apply 脚本接入;来源页加表;对抗式审查。
2. **花朵建模管线**(✅ 已完成 2026-09-02:七种花全部建模上线——油菜(总状)、向日葵(头状)、刺槐(蝶形垂串)、高丛蓝莓(坛形倒挂)、白车轴草(球形头状)、薰衣草(穗状轮伞)、紫花苜蓿(短总状,复用蝶形花件);五类花序模板 + anchor_landingNormal 全带;原注:油菜已完成 —— flowermodel/flower_gen.py 参数化生成 + run_export.py 无头导出 + render_preview.py Cycles 预览;flower-brassica[-low].glb 已部署 public/models/,含 anchor_flowerCenter/petalFocus/stamenFocus/nectarEntrance/stemBase 五锚点与 hero_petals/sepals/stamens/pistil_full/nectaries 分部件;下一个:向日葵)(≈2–3 天,风险最高):`flower_gen.py`(花瓣放样、三类花冠模板、四类花序、花蕊/花萼/花托/花柄、盛开度)、7 个预设、锚点 `flowerCenter / petalFocus / stamenFocus / nectarEntrance / stemBase`、双 LOD、缩略图;先做油菜 + 向日葵打通再补其余 5 种。
3. **花朵观察器与展厅页**(已完成首版:src/three/flowers/FlowerViewer.tsx 花朵查看器——聚焦镜头 rig(整株按视场角装框)、5 锚点两段式热点(createPortal 挂到锚点空节点)、轻风摇摆、视角/缩放/重置;src/pages/FlowersHall.tsx 工作台三栏——左 7 花列表(未建模标"建模中")、中 舞台+工具栏、右 档案卡(花型/花期条/蜜粉/三条目/来源徽章);路由 /museum/flowers[/:flowerId],?focus=&motion= 直链;e2e 冒烟 1 条,35/35 过。原描述:≈1.5 天)`/museum/flowers/:flowerId`,工作台三栏(左 地域·季节筛选 + 花朵列表;中 三维花朵 + 风摆 + 5 锚点热点 + 视角/放大/重置;右 档案卡),复用镜头 rig、热点、URL 状态。
4. **蜂花关系浏览**(✅ 已完成 2026-09-02,三小步:①右栏"谁来访花"关系卡+档案双页签+数量徽章;②花粉筐彩蛋(携粉蜂×粉源/传粉记录才亮,颜色随花,苜蓿×蜜蜂空筐即教学);③按蜂调飞法 nimble/heavy/darting。原描述:≈1 天:右栏"谁来访花"(按地域/季节过滤,关系类型 + 证据徽章 + 来源);点蜂 → 蜂精模落到 nectarEntrance 附近 + "为什么能访"线索卡(口器—花冠、季节—花期、地域重叠);标本卡加"典型访花",扩展卡"花朵与四季"变实。
5. **地域与季节**(✅ 已完成 2026-09-03,三小步:①左栏地域×季节筛选 chips + ?region=&season= 直链 + 列表应季置顶/降灰/当地花期签 + 关系过滤与空态;②档案卡 12 个月花期色带(花瓣色填充、季节窗描金边、无记录如实标注);③访花演示说明取当前筛选下的关系记录。原描述:≈1 天:地域 × 季节切换联动列表/花期条/关系;花期条 12 月色带;`?region=&season=`。
6. **收尾**(≈1 天):子步 1 ✅ 视觉基线(2026-09-07:tests/e2e/flowers-visual.spec.ts,7 花整株 + 2 访花静格(蓝莓×熊蜂花粉筐、油菜×蜜蜂);整株用 toHaveScreenshot,访花静格用单帧 toMatchSnapshot——重场景冷启动下 GPU 读回慢,连续两帧一致的稳定性循环会超时;BeeVisit 取蜜微俯仰在 motion=0 时归零保证静格确定)。子步 2 ✅ 移动端与无障碍(2026-09-07:①手机 767px 下 `.wb-tools span{display:none}` 连花朵馆的 span.fl-glyph 图标一起藏掉、工具栏压成 21px 空胶囊——现规则豁免 .fl-glyph 并加高按钮到触控标准;②≤1023px 左栏隐藏后筛选 chips 无入口——filterChips 提取后双渲染,窄屏在舞台顶部花名条下加 .fl-filters-narrow 单行横滚条;③工作台按钮/链接统一 :focus-visible 金色描边;页签 aria-selected、访花条 role=status 原已齐备;smoke 补窄屏断言)。审查收官:本步无内容文本改动,无需新审查轮。原描述:视觉基线(7 花侧视 + 访花组合 + 季节态)、e2e、无障碍、移动端、来源页/关于页、审查收官。

## 已知内容边界

- 角额壁蜂的核心访花对象(苹果等蔷薇科果树)不在首期花单,它在花朵馆可能没有连线;物种卡上如实说明"二期加入"。
- 紫木蜂的访花记录需查证;查不到有来源的就不画。
- 花期按地域给"大致月份区间",各地域来源不一时以最近似的地区资料为准并注明。

## 访花演示模式(2026-08-31 定稿,插在第 3 步与第 4 步之间)

- **是什么**:花朵馆的"访花"演示——选一只蜂,进场绕花螺旋渐近 → 悬停 → 落到 `anchor_nectarEntrance` → 取蜜数秒 → 起飞离场;**飞一轮即停**,说明条上"再看一次"。
- **数据驱动与诚实原则**:可选蜂 = 该花在 `beeFlowerRelations` 里有记录的蜂;演示时底部说明条显示蜂名 + 关系 note + 证据徽章(编辑整理照标);无记录的蜂不出现,列表底注一句原因。
- **已定决策**:首版通用飞法(后续按蜂调参:熊蜂低频笨重、蜜蜂轻快);花粉筐渐显彩蛋留到第 4 步与关系卡一起做;`?visit=<beeId>` 直链;`?motion=0` 时不播飞行、直接呈现落定静格(基线用此态)。
- **技术**:复用蜂 hero GLB(尺度与花一致,大小对比真实——油菜花 ~1.5cm vs 工蜂 ~1.2cm,展项本身要点出);蜂在世界坐标下每帧取锚点世界位置(落定后自然跟随风摆,免 attach/detach);扇翅=程序化高频旋转 foreWing/hindWing 节点,落定收拢;每种花一份降落参数(锚点、落姿;蓝莓倒挂、薰衣草近悬停,建模时补)。
- **落地情况(2026-09-01)**:已上线首版——src/three/flowers/BeeVisit.tsx(五阶段状态机 enter/hover/land/probe/takeoff,飞一轮即停;世界坐标逐帧取锚点位置,落定自然跟随风摆;程序化扇翅 21Hz,落定收拢;花粉节点先隐藏);工具栏"访花"按钮列出该花有关系记录的蜂,底部说明条=蜂名+阶段+关系 note+证据徽章+再看一次/停止;?visit=<beeId> 直链;motion=0 落定静格;e2e 35 项全过。修复:.wb-body flex:1 的 basis 0 使固定高度失效导致整页被档案卡撑高(改 flex:0 0 auto + grid-template-rows minmax(0,1fr));镜头 rig 首帧改为直接吸附(GLB 解析掉帧会耗尽插值窗口)。
- **与第 4 步的关系**:第 4 步"谁来访花"关系卡(地域/季节过滤、证据徽章、来源)做好后,卡上"看它访花"按钮触发同一演示。
