# 对抗式审查报告

> 生成:2026-08-25T02:20:57.639Z  (dry run,未写回)

| 结果 | 条目数 |
|---|---|
| 三方全 pass → ai-reviewed | 68 |
| 保留 draft(任一 fail/uncertain) | 21 |

- fact-check:pass 73 / fail 0 / uncertain 16
- refutation:pass 82 / fail 0 / uncertain 7
- compliance:pass 89 / fail 0 / uncertain 0

## 未通过条目与问题

### focus:apis-cerana-worker/whole
- **fact-check** → uncertain
  - 断言:东方蜜蜂工蜂体型比西方蜜蜂小
    问题:两个被引来源均未作两种体型比较;Apis cerana 页反而把两种并列为同一体型段。
    依据:Apis cerana 页:'both are medium-sized bees (10-11mm)';Honey bee 页未比较体型。
    建议:改为'东方蜜蜂工蜂体型一般略小于西方蜜蜂(约 10–11 mm 对 12–15 mm)',并为 12–15 mm 一侧补引 src-wikipedia-worker-bee;或补引一个直接比较两种体型的来源。

### focus:apis-cerana-drone/whole
- **fact-check** → uncertain
  - 断言:雄蜂由未受精卵发育而来——这一点在蜜蜂属乃至绝大多数蜂类中都是如此
    问题:'绝大多数蜂类'的外推未被任何被引来源提及;被引页面只就蜜蜂属讨论单倍二倍性。
    依据:Honey bee 页:'Drones develop from unfertilised eggs and are haploid'(仅限蜜蜂);Apis cerana 页与 Western honey bee 页同样只谈本种。
    建议:补引 Wikipedia 'Haplodiploidy' 页(说明膜翅目普遍为单倍二倍性),或把后半句改为'蜜蜂属都是如此'。

### focus:bombus-terrestris-worker/whole
- **fact-check** → uncertain
  - 断言:黑底之上,前胸一圈黄领、腹部一道黄带、尾端一撮白毛
    问题:被引来源只提到'yellowish bands'和白色尾端,未说明黄带位置(前胸黄领、腹部一道)。
    依据:Bombus terrestris 页:'Workers have white-ended abdomens ... the yellowish bands of B. terrestris being darker in direct comparison';Bumblebee 页无 B. terrestris 具体色型。
    建议:补引一个给出色型分部位描述的来源(如 Bumblebee Conservation Trust 或 NatureSpot 的 B. terrestris 页),或简化为'黑底之上有黄色带纹,尾端白色'。

### focus:bombus-terrestris-worker/head
- **fact-check** → uncertain
  - 断言:欧洲熊蜂属于短舌熊蜂,偏好开放或浅冠筒的花
    问题:三个被引来源均未把 B. terrestris 标为短舌种,也未描述其花型偏好;Nectar robbing 页仅以图注显示 B. terrestris 盗蜜。
    依据:Bombus terrestris 页:'forage on a large variety of flower species'(无舌长);Bumblebee 页:'The longer the tongue, the deeper the bumblebee can probe'(未点名种);Nectar robbing 页图注:'Bombus terrestris stealing nectar',正文举例为 B. pratorum。
    建议:补引明确将 B. terrestris 归为短舌种的来源(如 Goulson《Bumblebees》或 BWARS 物种页),或改为'欧洲熊蜂舌较短,遇深冠筒花时常在花冠基部咬孔取蜜'。
  - 断言:真正能探入深花的是长舌熊蜂,如 Bombus hortorum
    问题:B. hortorum 未在任何被引来源中出现。
    依据:Nectar robbing 页仅提及 B. terrestris、B. pratorum、B. appositus、B. occidentalis;Bumblebee 页未点名 B. hortorum。
    建议:补引 Wikipedia 'Bombus hortorum' 页(garden bumblebee,长舌),或删去该示例。

### focus:bombus-terrestris-worker/wing
- **fact-check** → uncertain
  - 断言:前后翅同样以翅钩联动;依靠灵活的翅角控制维持飞行
    问题:本条只引 Bumblebee 与 Bombus terrestris 两页,二者均未提及翅钩(hamuli)或翅角控制。
    依据:两页对翅钩的判定均为'未提及';Bumblebee 页只支持约 200 次/秒的扇翅频率与动态失速产生升力。
    建议:为翅钩一句补引 src-wikipedia-hamulus(膜翅目通用);'灵活的翅角控制'改为来源支持的表述'翅在每个拍动周期中经历动态失速而产生额外升力',或删去。

### focus:osmia-cornifrons-worker/whole
- **fact-check** → uncertain
  - 断言:20 世纪后半叶,日本超过一半的苹果园曾用它授粉
    问题:来源只给出'约 50 年间',没有指明是 20 世纪后半叶。
    依据:Osmia cornifrons 页:'Over a 50-year time period, more than half of the apple orchards in Japan utilized this species'。
    建议:改为'在约五十年间,日本超过一半的苹果园曾用它授粉',或补引给出具体年代的来源。

### focus:osmia-cornifrons-worker/head
- **fact-check** → uncertain
  - 断言:大颚用于衔运和塑形筑巢的泥土
    问题:两个被引来源都未描述大颚的用途。
    依据:Osmia cornifrons 页:'页面未讨论大颚的具体功能';Mason bee 页:'未提及大颚用于衔泥筑巢'。
    建议:补引描述壁蜂用大颚运泥的来源(如 Wikipedia 'Osmia' 属页或 Xerces Society 壁蜂资料),或改为'它用泥土封闭巢室'(该句被来源支持)。

### focus:osmia-cornifrons-worker/abdomen
- **fact-check** → uncertain
  - 断言:花粉松散地夹在毛间带回巢中
    问题:'松散'这一携粉状态未被 Scopa 页或 Osmia cornifrons 页提及;仅 Pollen basket 页(本条未引)说明花粉筐内花粉被压实,可作对比。
    依据:Scopa 页:'a dense mass of elongated, often branched, hairs ... form a pollen-carrying apparatus',未描述花粉松散与否。
    建议:改为'花粉刷附在毛间带回巢中',或补引 src-wikipedia-pollen-basket 以支撑'不像花粉筐那样压实'的对比。
- **refutation** → uncertain
  - 断言:这种腹面携粉方式是切叶蜂科的共同特征。
    问题:"共同特征"是绝对化表述。切叶蜂科内的盗寄生属(如 Coelioxys 尖腹蜂、Stelis)不采粉、没有集粉毛,严格说不能称全科共同特征;准确说法是"采粉(非寄生)切叶蜂的共同特征"。
    依据:Wikipedia Scopa (biology): "kleptoparasitic bees, which do not gather their own pollen" 缺少 scopa;同页指出腹面 scopa 见于 Megachilidae。https://en.wikipedia.org/wiki/Scopa_(biology)
    建议:改为"这种腹面携粉方式是切叶蜂科采粉蜂类的共同特征(科内的盗寄生属不采粉、无集粉毛)"或简写为"是切叶蜂科的典型特征"。

### focus:osmia-cornifrons-worker/leg
- **refutation** → uncertain
  - 断言:把花粉带在腹面则是切叶蜂科的独门方式。
    问题:"独门"过于绝对。Wikipedia Scopa 页明确写到少数其他蜂类除后足集粉毛外,腹部腹面也有用于携粉的特化毛;切叶蜂科的独特之处是"只靠腹面、不靠后足",而非"腹面携粉"本身仅见于该科。
    依据:Wikipedia Scopa (biology): "A few bees have, in addition to the leg hairs, many modified hairs on the ventral surface of the abdomen which are also used in pollen transport";"the Megachilidae, lack modified leg hairs, but have an extensive scopa on the underside of the abdomen"。https://en.wikipedia.org/wiki/Scopa_(biology)
    建议:改为"几乎只靠腹面集粉毛携粉、后足没有特化集粉毛,是切叶蜂科的标志性方式"。

### focus:megachile-rotundata-worker/whole
- **refutation** → uncertain
  - 断言:原产欧洲,被引入北美、新西兰和澳大利亚。
    问题:多数专业文献把本种原产地记为欧洲东南部至西亚(欧亚大陆),而非单纯"欧洲";英文维基的"European species"是简化说法。
    依据:Pitts-Singer & Cane 2011 Annual Review of Entomology 及 Animal Diversity Web:"native to southwestern Asia and southeastern Europe" / "Eurasian"。https://animaldiversity.org/accounts/Megachile_rotundata/ ; https://www.annualreviews.org/content/journals/10.1146/annurev-ento-120709-144836
    建议:改为"原产欧亚大陆(欧洲东南部至西亚)"。

### focus:megachile-rotundata-worker/leg
- **fact-check** → uncertain
  - 断言:人们提供成千上万个人工巢孔板
    问题:来源只说明用纸管或钻孔木块诱使雌蜂筑巢,没有'成千上万'这一数量表述。
    依据:Megachile rotundata 页:'When managed for pollination, the females are induced to nest in paper cylinders similar to drinking straws or drilled blocks of wood.'
    建议:改为'人们提供纸管或钻孔木块等人工巢材,雌蜂会自行进驻筑巢',或补引给出巢孔数量级的来源。

### focus:xylocopa-violacea-worker/whole
- **refutation** → uncertain
  - 断言:成蜂夏末羽化后越冬,次年四五月才出来活动。
    问题:两份被引用的来源互相冲突:英文维基说通常四五月出现,德文维基说中欧越冬后三月至七月即活动、四五月开始筑巢。"四五月才出来"把开始活动的时间说晚了,且未限定地区。
    依据:de.wikipedia Blaue Holzbiene: "In Mitteleuropa fliegt die Art ab August und nach der Überwinterung von März bis Juli";en.wikipedia: "they emerge in the spring, usually around April or May"。https://de.wikipedia.org/wiki/Blaue_Holzbiene ; https://en.wikipedia.org/wiki/Xylocopa_violacea
    建议:改为"成蜂夏末羽化后越冬,次年早春(约三至五月,视地区而异)出来活动,四五月开始筑巢"。

### focus:xylocopa-violacea-worker/head
- **fact-check** → uncertain
  - 断言:木蜂头部宽大
    问题:三个被引来源均未描述头部形态。
    依据:Xylocopa violacea 页正文几乎无外形描述;Carpenter bee 页与德文页只描述腹部光滑、身体黑色、翅有光泽。
    建议:删去'头部宽大',保留来源支持的'大颚极为强壮,在枯木中啃出隧道'(Carpenter bee 页:'rasp their mandibles against hardwood')。

### focus:xylocopa-violacea-worker/wing
- **fact-check** → uncertain
  - 断言:在特定角度下反射出蓝紫虹彩(薄膜干涉形成的结构色)
    问题:'薄膜干涉形成的结构色'在本条未加限定,而四个被引来源都只描述光泽现象,未说明成因;同馆的 abdomen 条与 organ-xylocopa-integument 已用'一般认为'限定。
    依据:德文页:'Auch die Flügel sind sehr dunkel und weisen einen auffälligen blauen Schiller auf';Carpenter bee 页与 X. violacea 页均'未提及结构色'。
    建议:改为'(一般认为是薄膜干涉形成的结构色)',与 abdomen 条保持一致;或补引论述昆虫翅膜结构色的来源。

### focus:xylocopa-violacea-worker/leg
- **fact-check** → uncertain
  - 断言:木蜂足部粗壮;强健的足也帮助它在钻洞时撑住身体
    问题:三个被引来源均未描述足部粗壮或钻洞时足的支撑作用。
    依据:Carpenter bee 页:'页面未特别强调足部粗壮特征';X. violacea 页与德文页未提足部。
    建议:删去'粗壮'与'撑住身体'的推断,保留来源支持的'后足密布集粉毛,没有光滑花粉筐'(Carpenter bee 页:'females lack the bare corbicula of bumblebees; the hind leg is entirely hairy')。

### organ:organ-osmia-scopa
- **refutation** → uncertain
  - 断言:这是切叶蜂科的共同特征。
    问题:与 focus:osmia-cornifrons-worker/abdomen 同一问题:切叶蜂科内的盗寄生属不采粉、无集粉毛,"共同特征"绝对化。
    依据:Wikipedia Scopa (biology): 盗寄生蜂 "do not gather their own pollen" 且缺少 scopa。https://en.wikipedia.org/wiki/Scopa_(biology)
    建议:改为"这是切叶蜂科采粉蜂类的典型特征"。

### organ:organ-osmia-mandible
- **fact-check** → uncertain
  - 断言:大颚用于衔泥筑巢和封闭巢室
    问题:两个被引来源都支持用泥封闭巢室,但均未把这一行为归于大颚。
    依据:Osmia cornifrons 页:'the female bee closes off the cell with mud';Mason bee 页:'named for their habit of using mud ... in constructing their nests';二者均未提 mandibles。
    建议:补引描述壁蜂以大颚搬运泥土的来源,或改为'雌蜂用泥土分隔并封闭巢室'。

### species:apis-cerana
- **fact-check** → uncertain
  - 断言:体型比西方蜜蜂小
    问题:两个被引来源均未比较两种体型;Apis cerana 页把两种并列为同一体型段。
    依据:Apis cerana 页:'both are medium-sized bees (10-11mm)';Honey bee 页未比较。
    建议:改为'工蜂体型一般略小于西方蜜蜂',并补引给出西方蜜蜂 12–15 mm 的 src-wikipedia-worker-bee,或补引直接比较两种的来源。
  - 断言:中国本土传统饲养的主要蜂种
    问题:被引来源只说 A. cerana 是亚洲南部与东部的传统蜜蜂、亚种 A. c. indica 被养在蜂箱中,未提中国的传统饲养。
    依据:Honey bee 页:'traditional honey bee of southern and eastern Asia';'A. c. indica ... has been domesticated and kept in hives in a fashion similar to A. mellifera';Apis cerana 页未涉及养蜂。
    建议:补引说明中蜂在中国传统养蜂中地位的来源(如中文维基'中华蜜蜂'或农业部门资料),或改为'亚洲南部与东部的传统饲养蜂种'。
  - 断言:树洞、岩缝等隐蔽腔体内营蜡巢
    问题:来源只提树洞与'各类自然及人工环境',未提岩缝。
    依据:Apis cerana 页:'tree cavity';'found in a wide range of external environments'。
    建议:改为'树洞等隐蔽腔体内营多脾蜡巢',或补引提及岩缝的来源。

### species:bombus-terrestris
- **fact-check** → uncertain
  - 断言:黑底绒毛配前胸黄领、腹部黄带和白色尾端
    问题:被引来源只提到黄色带纹与白色尾端,未给出'前胸黄领、腹部一道黄带'的分部位描述。
    依据:Bombus terrestris 页:'Workers have white-ended abdomens ... yellowish bands of B. terrestris being darker';Bumblebee 页无 B. terrestris 具体色型。
    建议:补引给出色型分部位描述的来源,或简化为'黑底绒毛带黄色带纹,尾端白色'。
- **refutation** → uncertain
  - 断言:黑底绒毛配前胸黄领、腹部黄带和白色尾端
    问题:作为物种级描述,"白色尾端"只对工蜂/雄蜂成立;蜂王尾端为皮黄色(buff),这正是英文名 buff-tailed 的来源。本馆自身的 focus:bombus-terrestris-worker/abdomen 已写明这一差异,物种条目与之不一致。
    依据:Wikipedia Bombus terrestris: 蜂王 "buff-white abdomen tip";工蜂 "have white-ended abdomens"。https://en.wikipedia.org/wiki/Bombus_terrestris
    建议:改为"尾端白色至皮黄色(工蜂近白,蜂王偏皮黄)"。

### species:osmia-cornifrons
- **fact-check** → uncertain
  - 断言:workerBodyLengthMm 8–12
    问题:三个被引来源都没有体长数字:Osmia cornifrons 页无体长;Scopa 页与本种无关;src-exotic-bee-id 指向 idtools.org 首页,不含该物种任何内容。
    依据:Osmia cornifrons 页:'页面未给出体长数据';idtools.org/id/bees/exotic/ 首页:'页面未提及 Osmia cornifrons ... 无任何尺寸数据'。
    建议:把 src-exotic-bee-id 的 URL 改为 Exotic Bee ID 中 Osmia cornifrons 的物种 fact sheet 页面(其中给出体长),并据其校正数字;找不到时改为'约 8–12 mm(不同资料差异较大)'。

### species:megachile-rotundata
- **refutation** → uncertain
  - 断言:原产欧洲,被引入北美、新西兰、澳大利亚作为管理授粉蜂
    问题:与 focus:megachile-rotundata-worker/whole 同一问题:专业文献记原产地为欧洲东南部至西亚(欧亚大陆),"原产欧洲"过窄。
    依据:Animal Diversity Web / Pitts-Singer & Cane 2011:"native to southwestern Asia and southeastern Europe"。https://animaldiversity.org/accounts/Megachile_rotundata/
    建议:改为"原产欧亚大陆(欧洲东南部至西亚)"。

## 通过条目(可选润色建议)

- focus:apis-mellifera-worker/whole:全站统一为中文全角标点(，、；：),包括所有 focus/organ/compare/species 文案。
- focus:apis-mellifera-worker/head:改为“大颚、下唇须(口器两侧的小触须)和可伸出的中唇舌(用来吸取花蜜的‘舌头’)”。
- focus:apis-mellifera-queen/head:改为“大颚、下唇须(口器两侧的小触须)和可伸出的中唇舌(用来吸取花蜜的‘舌头’)”。
- focus:apis-mellifera-drone/head:改为“大颚、下唇须(口器两侧的小触须)和可伸出的中唇舌(用来吸取花蜜的‘舌头’)”。
- focus:apis-cerana-worker/head:改为“大颚、下唇须(口器两侧的小触须)和可伸出的中唇舌(用来吸取花蜜的‘舌头’)”。
- focus:apis-cerana-queen/whole:统一为“约 6000–7000 只工蜂(不同资料因亚种与季节差异较大)”。
- focus:apis-cerana-queen/head:改为“大颚、下唇须(口器两侧的小触须)和可伸出的中唇舌(用来吸取花蜜的‘舌头’)”。
- focus:apis-cerana-drone/head:改为“大颚、下唇须(口器两侧的小触须)和可伸出的中唇舌(用来吸取花蜜的‘舌头’)”。
- focus:bombus-terrestris-worker/abdomen:改为“尾端灰白(略带皮黄)”。;改为“英文名 buff-tailed bumblebee(皮黄尾熊蜂)一般认为是按蜂王的尾色起的”。
- focus:osmia-cornifrons-worker/wing:改为“活动季集中在早春果树开花期;在温带地区雄蜂大约四月先羽化,具体时间随当地气候而变”。
- focus:megachile-rotundata-worker/wing:改为“取食时把喙插进苜蓿花下方船形的花瓣(龙骨瓣),花粉随之刷到集粉毛上”。
- organ:organ-antenna:改为“是蜜蜂主要的化学感知(嗅觉)器官”。
- organ:organ-foreleg-cleaner:改为“前足靠近‘脚掌’的一节(基跗节)有个半圆形缺口,与小腿末端的一根小刺(胫节距)配合,像夹子一样刮过触角”。
- organ:organ-bombus-fur:改为“黑黄白的分带一般认为是警戒色”。
- organ:organ-bombus-flight-muscle:改为“如今温室番茄的授粉大量依赖熊蜂的这一能力”。;改为“靠震动取粉;蜜蜂不具备此行为”。
- organ:organ-megachile-hair-bands:补一句,如“本模型以浅色绒毛近似表现白色细毛,未逐根雕刻;标注点位于腹部前段背面、翅根附近”。
- species:apis-mellifera:改为“现随养蜂业几乎遍布全球(南极洲除外)”。;改为“也是研究最充分的蜂种之一”。;改为“在洞穴或蜂箱内建造多片垂直悬挂的蜡质巢脾(巢板)”。