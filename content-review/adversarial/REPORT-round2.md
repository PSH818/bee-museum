# 对抗式审查报告

> 生成:2026-08-25T02:08:31.474Z  (dry run,未写回)

| 结果 | 条目数 |
|---|---|
| 三方全 pass → ai-reviewed | 54 |
| 保留 draft(任一 fail/uncertain) | 35 |

- fact-check:pass 61 / fail 0 / uncertain 28
- refutation:pass 86 / fail 0 / uncertain 3
- compliance:pass 79 / fail 9 / uncertain 1

## 未通过条目与问题

### focus:apis-mellifera-drone/leg
- **compliance** → fail
  - 断言:雄蜂不采集花粉，也没有螫针——它既不会带回花粉团，也不会螫人。
    问题:3 安全与健康暗示:面向中小学生直接写「不会螫人」,而普通人在野外几乎无法一眼分辨雄蜂与工蜂,可能诱导孩子以「这是雄蜂」为由去触碰蜂类。
    建议:改为「雄蜂不采集花粉,也没有螫针。不过野外很难一眼分清雄蜂与工蜂,请不要因此去触碰任何蜂类。」

### focus:apis-cerana-worker/whole
- **fact-check** → uncertain
  - 断言:东方蜜蜂是亚洲本土传统养蜂的主角
    问题:两个来源均未提及东方蜜蜂在亚洲传统养蜂中的地位;Honey bee 页仅称 A. c. indica 曾被驯化。
    依据:Apis cerana 页:未提及传统养蜂(fetch 判定 NOT MENTIONED);Honey bee 页:"the Indian honey bee (A. c. indica), was domesticated"
    建议:改为"是亚洲多地传统养蜂饲养的蜂种之一",或补充一条说明亚洲/中国传统养蜂以东方蜜蜂为主的来源(如 FAO 或中国养蜂学文献)。

### focus:apis-cerana-queen/whole
- **fact-check** → uncertain
  - 断言:一个蜂群通常有数千至一万余只工蜂
    问题:来源给出的群体规模为约 6,000–7,000 只工蜂,"一万余"上限在来源中没有依据(虽有"随亚种与季节变化"限定,但数字本身超出来源)。
    依据:Apis cerana 页:"Apis cerana colonies are relatively small, with only around 6,000 to 7,000 workers"
    建议:改为"通常约六七千只工蜂";若要保留更宽的范围,补充给出该范围的来源。

### focus:apis-cerana-drone/leg
- **compliance** → fail
  - 断言:雄蜂不采集花粉,也没有螫针——既不会带回花粉团,也不会螫人。
    问题:3 安全与健康暗示:与西方蜜蜂雄蜂条相同,直接写「不会螫人」而无「勿据此触碰蜂类」的提示,对中小学生有诱导风险。
    建议:改为「雄蜂不采集花粉,也没有螫针。不过野外很难一眼分清雄蜂与工蜂,请不要因此去触碰任何蜂类。」

### focus:bombus-terrestris-worker/whole
- **fact-check** → uncertain
  - 断言:黑底之上,前胸一圈黄领、腹部一道黄带、尾端一撮白毛
    问题:Bombus terrestris 页只提到"yellowish bands"和工蜂"white-ended abdomens",没有"黑底"和"前胸黄领"的描述;Bumblebee 页仅泛称 black-and-yellow。具体带纹位置无来源。
    依据:Bombus terrestris 页:"the yellowish bands of B. terrestris being darker in direct comparison"; "Workers have white-ended abdomens"
    建议:补充一条描述 B. terrestris 具体色带位置的来源(如 Bumblebee Conservation Trust 或 NatureSpot 物种页),或简化为"黑黄相间的带纹、尾端白色"。

### focus:bombus-terrestris-worker/head
- **fact-check** → uncertain
  - 断言:欧洲熊蜂属于短舌熊蜂,偏好开放或浅冠筒的花;遇到深冠筒花时常在花冠基部咬孔取蜜
    问题:Bombus terrestris 页未提及舌长、盗蜜;Bumblebee 页支持熊蜂有盗蜜行为和长舌/短舌之分,但未把 B. terrestris 归为短舌。
    依据:Bumblebee 页:"many species of bumblebees also exhibit 'nectar robbing': instead of inserting the mouthparts into the flower in the normal way, these bees bite directly through the base"; Bombus terrestris 页:tongue/robbing 均 NOT FOUND
    建议:补充说明 B. terrestris 为短舌种并会盗蜜的来源(如 Goulson《Bumblebees》或 BWARS 物种页),或改为"熊蜂中的短舌种(如欧洲熊蜂)…"并引用相应来源。
  - 断言:真正能探入深花的是长舌熊蜂,如 Bombus hortorum
    问题:两个来源均未把 B. hortorum 标为长舌种(Bumblebee 页仅在农药段落提及它)。
    依据:Bumblebee 页:"some bumblebee species have long tongues and collect nectar from flowers that are closed into a tube"(未点名 hortorum)
    建议:增加 Wikipedia "Bombus hortorum" 页为来源(该页明确其长舌),或删去具体种名。
- **refutation** → uncertain
  - 断言:熊蜂个体间体型差异很大,同一巢的工蜂可以差出近一倍。
    问题:"近一倍"明显低估了实际差异幅度。文献记录的欧洲熊蜂同巢工蜂胸宽 2.3–6.9 mm(约 3 倍)、体重 68–754 mg(约 11 倍)。虽然"可以差出近一倍"在逻辑上不算假(差异确实可达并超过两倍),但读者会把它理解为差异上限约两倍,与数据不符。
    依据:Wikipedia Bombus terrestris: "thorax sizes ranging from 2.3 to 6.9 mm in length and masses ranging from 68 to 754 mg" https://en.wikipedia.org/wiki/Bombus_terrestris
    建议:改为"同一巢的工蜂体长可相差两三倍,体重甚至可相差十倍以上"。

### focus:bombus-terrestris-worker/wing
- **fact-check** → uncertain
  - 断言:相对滚圆的身体,熊蜂的翅显得偏小;它依靠高频扇动与灵活的翅角控制维持飞行
    问题:Bumblebee 页支持高频扇动(约 200 次/秒)和动态失速旋涡,但没有"翅相对偏小"和"翅角控制"的表述。
    依据:Bumblebee 页:"Bees beat their wings about 200 times a second"; "dynamic stall (an airflow separation inducing a large vortex above the wing), which briefly produces several times the lift of the aerofoil in regular flight"
    建议:删去"灵活的翅角控制"或改为"高频扇动与拍动方式";"翅显得偏小"可保留为观感描述但宜加"看起来"限定。
  - 断言:前后翅同样以翅钩联动
    问题:该条目引用的两个来源均未提及翅钩;膜翅目通用翅钩在 Hamulus 页有支持但未被引用。
    依据:Hamulus 页:"the row of hamuli on the anterior edge of the metathoracic (rear) wings of Hymenoptera such as the honeybee"
    建议:在 sourceIds 中加入 src-wikipedia-hamulus。

### focus:bombus-terrestris-worker/leg
- **fact-check** → uncertain
  - 断言:在番茄、蓝莓等作物上,熊蜂的单花访问效率常高于蜜蜂
    问题:Buzz pollination 页与 Bumblebee 页均未做单花访问效率比较;Bumblebee 页不含"蓝莓";仅支持熊蜂能给温室番茄振动授粉而其他传粉者不能。
    依据:Bumblebee 页:"they can pollinate plants such as tomato in greenhouses by buzz pollination whereas other pollinators cannot"; Buzz pollination 页:efficiency 比较 NOT MENTIONED
    建议:改为"在番茄、蓝莓等需要振动授粉的作物上,熊蜂能完成蜜蜂做不到的授粉",或补充关于单花访问效率的来源。

### focus:osmia-cornifrons-worker/head
- **fact-check** → uncertain
  - 断言:大颚用于衔运和塑形筑巢的泥土
    问题:Osmia cornifrons 页与 Mason bee 页都描述了用泥封巢,但均未说明泥土由大颚衔运、塑形。
    依据:Mason bee 页:"Then, she creates a partition of 'mud'"(大颚 NOT MENTIONED); Osmia cornifrons 页:"the female bee closes off the cell with mud"
    建议:改为"雌蜂把泥土衔回巢中隔出巢室"并弱化大颚机理,或补充描述壁蜂用大颚运泥的来源。

### focus:megachile-rotundata-worker/abdomen
- **fact-check** → uncertain
  - 断言:常在腹部背板后缘形成浅色条带的外观
    问题:Megachile rotundata 页只说雌蜂全身覆白毛,Megachile 页与 Scopa 页都没有背板后缘毛带的描述。
    依据:Megachile rotundata 页:"Megachile rotundata bees are a dark grey color. Females have white hairs all over their bodies"(hair bands NOT MENTIONED)
    建议:补充一条鉴定类来源(如 idtools Megachile 页或 Discover Life)描述腹部毛带,或删去"背板后缘条带",只保留"白色细毛"。

### focus:xylocopa-violacea-worker/whole
- **fact-check** → uncertain
  - 断言:通体黑色、带微弱光泽;标志性的蓝紫色虹彩主要来自它烟紫色的翅膀
    问题:Xylocopa violacea 页当前版本没有任何体色、光泽或翅色描述;Carpenter bee 页只说腹部光亮,未提蓝紫虹彩或翅色。
    依据:Xylocopa violacea 页:'black'/'blue'/'iridescen'/'shin' 均无匹配句;Carpenter bee 页:"most carpenter bees have a shiny abdomen"
    建议:补充一条描述 X. violacea 体色与翅虹彩的来源(如 NatureSpot、BWARS 或欧洲昆虫图鉴)。

### focus:xylocopa-violacea-worker/head
- **fact-check** → uncertain
  - 断言:木蜂头部宽大
    问题:两来源均未描述头部大小;仅支持大颚强壮。
    依据:Carpenter bee 页:"chewing out burrows with their robust mandibles"
    建议:删去"头部宽大",或改为"大颚极为强壮"。

### focus:xylocopa-violacea-worker/wing
- **fact-check** → uncertain
  - 断言:木蜂的翅膜呈烟褐色,在特定角度下折射出蓝紫虹彩
    问题:三个来源均无翅色/虹彩描述(X. violacea 页仅有图注"Wing of the violet carpenter bee under microscope")。
    依据:Xylocopa violacea 页:'iridescen' 无匹配;Carpenter bee 页:wing colour NOT MENTIONED
    建议:补充描述翅色与虹彩的来源。振动授粉一句已用"被认为"限定且 Buzz pollination 页列有 Xylocopa frontalis,可保留。
- **refutation** → uncertain
  - 断言:木蜂的翅膜呈烟褐色,在特定角度下折射出蓝紫虹彩
    问题:物理机制用词不准:翅膜虹彩是薄膜干涉/反射产生的结构色,不是"折射"。同一批内容的 organ-xylocopa-integument 条目已正确写成"干涉",此处措辞与之不一致,可能误导读者。
    依据:Wikipedia Iridescence(翅膜虹彩由薄膜干涉产生)https://en.wikipedia.org/wiki/Iridescence ;Wikipedia Structural coloration https://en.wikipedia.org/wiki/Structural_coloration
    建议:把"折射出蓝紫虹彩"改为"反射出随角度变化的蓝紫虹彩(薄膜干涉形成的结构色)"。

### focus:xylocopa-violacea-worker/abdomen
- **fact-check** → uncertain
  - 断言:光滑坚硬的甲壳呈黑色,在光下带微弱的蓝紫光泽
    问题:"腹部几乎无毛、光滑"有来源支持,但"黑色"与"蓝紫光泽"在两来源中均无描述;结构色一句已用"一般认为"限定。
    依据:Carpenter bee 页:"most carpenter bees have a shiny abdomen"; Xylocopa violacea 页:体色 NOT MENTIONED
    建议:补充描述 X. violacea 体色/光泽的来源。
- **compliance** → uncertain
  - 断言:在光线下转动实物标本或本馆的 3D 模型,能看到光泽随角度变化。
    问题:9/8 模型说明诚实性:该句向观众承诺「本馆 3D 模型」能呈现随角度变化的光泽,但 organ:organ-xylocopa-wing 的 modelNote 明确说明模型「未表现随角度变化的虹彩」;腹部甲壳的 organ 条目又没有 modelNote 说明材质是否具备该效果。无法从文案判断该承诺是否属实。同时「实物标本」对线上博物馆的观众不可得。
    建议:核实腹部模型材质是否有随角度变化的光泽:若有,保留并在 organ:organ-xylocopa-integument 补 modelNote 说明「模型以带反光的黑色材质近似,实物光泽更弱/更强」;若无,改为「在光线下转动真实标本,能看到光泽随角度变化;本馆模型以带反光的黑色材质近似,未完整重现这种效果」。并删去对线上观众不可得的「实物标本」承诺或改为「如果有机会看到真实标本」。

### focus:xylocopa-violacea-worker/leg
- **fact-check** → uncertain
  - 断言:强健的足也帮助它在钻洞时撑住身体
    问题:两来源均未提及足部在钻洞中的作用;这是未加限定的功能推断。
    依据:Carpenter bee 页:"females lack the bare corbicula of bumblebees; the hind leg is entirely hairy"(足部其他功能 NOT MENTIONED)
    建议:删去该句,或改为"一般认为强健的足有助于钻洞时固定身体"。

### organ:organ-compound-eye
- **fact-check** → uncertain
  - 断言:蜜蜂可感知偏振光并以此辅助定向
    问题:偏振光导航属行为/感觉生理学(von Frisch 等),不属于 Snodgrass 解剖学教科书常识范围;Britannica 403 无法核对。
    依据:教科书常识仅覆盖复眼由数千小眼组成;偏振光断言无可访问来源。
    建议:补充来源(如 Wikipedia "Bee learning and communication" 或 "Honey bee" 中的导航段落)。

### organ:organ-ocelli
- **compliance** → fail
  - 断言:单眼没有独立锚点,统一挂在 head 锚点下讲解。
    问题:8 内部制作说明泄漏:「锚点」「挂在 head 锚点下」是前端/3D 实现术语,还夹带英文标识符 head,不应出现在面向公众的模型说明中。
    建议:改为「模型未单独标出单眼;请在头部标注处查看。实物中,三只单眼位于头顶两复眼之间。」

### organ:organ-proboscis
- **compliance** → fail
  - 断言:当前首屏高精度模型未雕刻口器,标注点位于头部下前方的近似位置;程序化标本模型包含简化口器。
    问题:8 内部制作说明泄漏:「首屏高精度模型」「程序化标本模型」是项目内部对资产的称呼,公众不知所指;应只保留对观众有用的「模型省略了口器、标注点为近似位置」这一诚实说明。
    建议:改为「本模型未雕刻口器,标注点位于头部下前方的近似位置;实物中口器不用时折叠于头下。」若确有两套模型在不同页面展示,请用观众可见的页面名称指代(如「标本厅的简化模型带有口器」)。

### organ:organ-osmia-horns
- **compliance** → fail
  - 断言:当前模型未雕刻角突,以头部锚点讲解。
    问题:8 内部制作说明泄漏:「锚点」「讲解」是制作侧用语,对观众不友好;省略本身的诚实说明应保留。
    建议:改为「本模型未雕刻角突;请在头部标注处查看。实物中它位于雌蜂脸部下方、两触角之间。」

### organ:organ-osmia-mandible
- **fact-check** → uncertain
  - 断言:大颚用于衔泥筑巢和封闭巢室
    问题:两来源支持用泥封巢,但都没有说明泥土由大颚衔运。
    依据:Mason bee 页:"Then, she creates a partition of 'mud'"(mandibles NOT MENTIONED)
    建议:改为"雌蜂衔泥筑巢并封闭巢室"并把大颚作用弱化为一般描述,或补充相应来源。
- **compliance** → fail
  - 断言:当前模型未单独雕刻大颚,以口器锚点讲解。
    问题:8 内部制作说明泄漏:「锚点」「讲解」为制作侧用语。
    建议:改为「本模型未单独雕刻大颚;标注点放在口器附近。」

### organ:organ-megachile-mandible
- **compliance** → fail
  - 断言:当前模型未单独雕刻大颚,以口器锚点讲解。
    问题:8 内部制作说明泄漏:「锚点」「讲解」为制作侧用语。
    建议:改为「本模型未单独雕刻大颚;标注点放在口器附近。」

### organ:organ-megachile-hair-bands
- **fact-check** → uncertain
  - 断言:常在背板后缘形成浅色条带的外观…是野外辨识切叶蜂属的常见线索之一
    问题:Megachile rotundata 页只说雌蜂全身白毛;Megachile 页无腹部毛带或鉴定线索描述。
    依据:Megachile rotundata 页:"Females have white hairs all over their bodies"; Megachile 页:hair bands NOT MENTIONED
    建议:补充鉴定类来源(如 idtools "Megachile s.l." 页或 Discover Life),或改写为"腹部覆白色细毛,与深灰底色相间"。
- **compliance** → fail
  - 断言:锚点借用后翅根部(临近腹部前段背面)。
    问题:8/9 内部制作说明泄漏与模型诚实性:「锚点借用」是实现说明;此外「腹部白毛带」被挂在「翅」焦点与后翅锚点下,观众在翅页面看到腹部器官会困惑,说明文字需用观众视角解释这一错位。
    建议:改为「模型中此处的标注位于后翅根部附近;实际的白毛带在腹部背面每一节的后缘,请对照腹部视角观察。」并考虑把该条目移到「腹部」焦点。

### organ:organ-xylocopa-integument
- **fact-check** → uncertain
  - 断言:黑色甲壳表面带微弱蓝紫光泽…木蜂最醒目的蓝紫虹彩其实在翅膜上
    问题:两来源都没有 X. violacea 的体色、光泽、翅虹彩描述;结构色部分已用"一般认为"限定,但基础的颜色描述本身缺来源。
    依据:Xylocopa violacea 页:'black'/'blue'/'iridescen' 无匹配;Carpenter bee 页:"most carpenter bees have a shiny abdomen"
    建议:补充描述 X. violacea 体色与翅虹彩的来源。

### organ:organ-xylocopa-mandible
- **compliance** → fail
  - 断言:当前模型未单独雕刻大颚,以口器锚点讲解。
    问题:8 内部制作说明泄漏:「锚点」「讲解」为制作侧用语。
    建议:改为「本模型未单独雕刻大颚;标注点放在口器附近。」

### organ:organ-xylocopa-wing
- **fact-check** → uncertain
  - 断言:深色翅膜带蓝紫虹彩
    问题:两来源均无翅色/虹彩描述;振动授粉一句已限定("被认为")且 Buzz pollination 页列有 Xylocopa frontalis。
    依据:Buzz pollination 页:"Xylocopa frontalis" 列于振动授粉蜂种;Xylocopa violacea 页:翅色 NOT MENTIONED
    建议:补充翅色与虹彩的来源。

### compare:row-body-length
- **fact-check** → uncertain
  - 断言:工蜂约 10–15 mm
    问题:唯一给出数字的可访问来源为 12–15 mm,下限 10 mm 无依据;Britannica 403。
    依据:Worker bee 页:"Body Length 12–15 mm"
    建议:改为"约 12–15 mm",或补充给出 10–15 mm 的来源。
  - 断言:蜂王约 18–20 mm;雄蜂约 15–17 mm
    问题:Worker bee、Honey bee 页均无蜂王/雄蜂毫米体长;Western honey bee 仅说雄蜂约为工蜂 1.5 倍;Britannica 403。
    依据:Honey bee 页:size NOT MENTIONED;Western honey bee 页:"Given their larger size (1.5 times that of worker bees)"
    建议:补充可访问的体长来源(如养蜂教科书或 Wikipedia "Queen bee"/"Drone (bee)" 页)。

### compare:row-sting
- **fact-check** → uncertain
  - 断言:蜂王:有,倒钩细小,可重复螫刺
    问题:Honey bee 页说蜂王螫针"not barbed like a worker's",未说"倒钩细小"或"可重复螫刺";Western honey bee、Worker bee 页均无蜂王螫针描述。
    依据:Honey bee 页:queen sting "is not barbed like a worker's sting"
    建议:改为"有,不像工蜂那样带明显倒钩,可重复使用",并在 sourceIds 加入 src-snodgrass-anatomy(其描述蜂王螫针倒钩较小)。

### compare:row-cerana-sting
- **fact-check** → uncertain
  - 断言:蜂王:有,倒钩细小,可重复螫刺
    问题:Apis cerana 页未提蜂王螫针;Honey bee 页仅说"not barbed like a worker's"。
    依据:Honey bee 页:queen sting "is not barbed like a worker's sting"; Apis cerana 页:queen sting NOT MENTIONED
    建议:同 compare:row-sting:改措辞并加入 src-snodgrass-anatomy。

### compare:row-cerana-colony
- **fact-check** → uncertain
  - 断言:工蜂:数千至一万余只
    问题:来源给出约 6,000–7,000 只,"一万余"上限无依据。
    依据:Apis cerana 页:"Apis cerana colonies are relatively small, with only around 6,000 to 7,000 workers"
    建议:改为"约六七千只"或补充支持更宽范围的来源。

### species:apis-mellifera
- **fact-check** → uncertain
  - 断言:workerBodyLengthMm 10–15
    问题:Worker bee 页给出 12–15 mm;Honey bee、Western honey bee 页无毫米数。
    依据:Worker bee 页:"Body Length 12–15 mm"
    建议:改为 min 12 / max 15,或补充给出 10–15 mm 的来源。

### species:apis-cerana
- **fact-check** → uncertain
  - 断言:中国本土传统饲养的主要蜂种
    问题:两来源均未论及东方蜜蜂在中国传统养蜂中的地位。
    依据:Apis cerana 页:traditional beekeeping NOT MENTIONED;Honey bee 页:"the Indian honey bee (A. c. indica), was domesticated"
    建议:补充中国/亚洲传统养蜂以东方蜜蜂为主的来源,或改为"亚洲多地传统饲养的蜂种之一"。
  - 断言:nesting:树洞、岩缝等隐蔽腔体
    问题:来源仅提及树洞;"岩缝"未提及(轻微)。
    依据:Apis cerana 页:"The nest is constructed inside beeswax combs inside a tree cavity"
    建议:改为"树洞等隐蔽腔体"或补充来源。

### species:bombus-terrestris
- **fact-check** → uncertain
  - 断言:黑底绒毛配前胸黄领、腹部黄带和白色尾端
    问题:Bombus terrestris 页仅有"yellowish bands"和工蜂"white-ended abdomens",无"黑底""前胸黄领"的具体描述。
    依据:Bombus terrestris 页:"Workers have white-ended abdomens"; "the yellowish bands of B. terrestris"
    建议:补充描述色带位置的来源,或简化为"黑黄相间带纹、尾端白色"。
- **refutation** → uncertain
  - 断言:一年生社会性:蜂王越冬后独立建群
    问题:"一年生"写成了无限定的绝对表述。欧洲熊蜂在温暖地区(地中海、英国南部城市、新西兰、塔斯马尼亚等)已多次记录到冬季活动群体或一年两代,并非严格一年一代。
    依据:Wikipedia Bombus terrestris(在温暖气候/引入地存在冬季活动与二代群体的记录)https://en.wikipedia.org/wiki/Bombus_terrestris ;Stelzer et al. 2010, "Winter active bumblebees (Bombus terrestris) achieve high foraging rates in urban Britain", PLoS ONE https://doi.org/10.1371/journal.pone.0009559
    建议:改为"通常为一年生社会性:蜂王越冬后独立建群(温暖地区可出现冬季活动或一年两代的群体)"。

### species:osmia-cornifrons
- **fact-check** → uncertain
  - 断言:workerBodyLengthMm 8–12
    问题:Osmia cornifrons 页无体长数字;Scopa 页不涉及;src-exotic-bee-id 首页及 Osmia 物种包页面均无 O. cornifrons 事实页内容,无法核对。
    依据:Osmia cornifrons 页:size NOT MENTIONED;idtools.org/id/bees/exotic/ 与 index.cfm?packageID=1185:仅导航链接,无该种事实页
    建议:将 src-exotic-bee-id 的 url 指向具体 O. cornifrons 事实页(若存在),或改引其他给出体长的来源(如 Penn State Extension / USDA 资料)。

### species:megachile-rotundata
- **fact-check** → uncertain
  - 断言:苜蓿制种业最重要的授粉蜂
    问题:来源称其为"very efficient pollinator of alfalfa"并"managed on a commercial scale",未称其为"最重要"。
    依据:Megachile rotundata 页:"very efficient pollinator of alfalfa, carrots, other vegetables, and some fruits";Megachile 页:"managed on a commercial scale for crop pollination"
    建议:改为"苜蓿制种业最主要的管理授粉蜂之一",或补充支持"最重要"的来源。

### species:xylocopa-violacea
- **fact-check** → uncertain
  - 断言:workerBodyLengthMm 20–28
    问题:三个来源均无体长毫米数(Carpenter bee 页仅有巢口直径 16 mm)。
    依据:Xylocopa violacea 页:'mm'/'length' 无匹配;Carpenter bee 页:"about 16 mm (0.63 in)"(巢口尺寸)
    建议:补充给出 X. violacea 体长的来源。
  - 断言:黑色身体带微弱光泽,翅呈烟紫色并带蓝紫虹彩
    问题:三个来源均无体色/翅色/虹彩描述。
    依据:Xylocopa violacea 页:'black'/'blue'/'iridescen' 无匹配;Carpenter bee 页:wing colour NOT MENTIONED
    建议:补充描述体色与翅虹彩的来源。

## 通过条目(可选润色建议)

- focus:apis-mellifera-worker/head:括注简释,如「下唇须(口器上一对细小的感觉附肢)」「中唇舌(可伸出吸取花蜜的『舌头』)」。
- focus:apis-mellifera-worker/wing:改为「翅脉像叶脉一样把翅面分成一格格『翅室』,不同蜂类的分格样式可用来辨认身份」。
- focus:apis-mellifera-worker/abdomen:在 fact 末尾追加一句「(野外请勿触碰蜂类;详见『螫针』条目)」,或在界面上确保此处可跳转至螫针条目。
- focus:apis-mellifera-queen/head:同 focus:apis-mellifera-worker/head 的建议,统一修改共享文案。
- focus:apis-mellifera-queen/wing:同 focus:apis-mellifera-worker/wing 的建议。
- focus:apis-mellifera-queen/abdomen:同 focus:apis-mellifera-worker/abdomen 的建议。
- focus:apis-mellifera-drone/whole:可改为「宽大的复眼,是辨认雄蜂最直观的线索之一」。
- focus:apis-mellifera-drone/head:同 focus:apis-mellifera-worker/head 的建议。
- focus:apis-mellifera-drone/wing:同 focus:apis-mellifera-worker/wing 的建议。
- focus:apis-mellifera-drone/abdomen:同 focus:apis-mellifera-worker/abdomen 的建议。
- focus:apis-cerana-worker/head:同 focus:apis-mellifera-worker/head 的建议。
- focus:apis-cerana-worker/wing:同 focus:apis-mellifera-worker/wing 的建议。
- focus:apis-cerana-worker/abdomen:同 focus:apis-mellifera-worker/abdomen 的建议。
- focus:apis-cerana-queen/head:同 focus:apis-mellifera-worker/head 的建议。
- focus:apis-cerana-queen/wing:同 focus:apis-mellifera-worker/wing 的建议。
- focus:apis-cerana-queen/abdomen:同 focus:apis-mellifera-worker/abdomen 的建议。
- focus:apis-cerana-drone/whole:改为「宽大复眼、无螫针,和西方蜜蜂雄蜂十分相似」。
- focus:apis-cerana-drone/head:同 focus:apis-mellifera-worker/head 的建议。
- focus:apis-cerana-drone/wing:同 focus:apis-mellifera-worker/wing 的建议。
- focus:apis-cerana-drone/abdomen:同 focus:apis-mellifera-worker/abdomen 的建议。
- focus:osmia-cornifrons-worker/whole:全站统一使用「」与全角标点。
- focus:osmia-cornifrons-worker/wing:改为「活动季集中在早春果树开花期(在日本、北美温带地区约为四月),雄蜂先破茧出巢(羽化)」。
- focus:osmia-cornifrons-worker/abdomen:改为「这种腹面携粉方式是切叶蜂科的典型特征」。
- focus:osmia-cornifrons-worker/leg:改为「把花粉带在腹面,则主要见于切叶蜂科」。;改为「只见于蜜蜂科中关系较近的几类蜂(蜜蜂、熊蜂、无刺蜂、兰花蜂)」。
- focus:megachile-rotundata-worker/wing:改为「取食时把口器伸进苜蓿花下方船形的花瓣(龙骨瓣)里」。
- focus:megachile-rotundata-worker/leg:改为「人工饲养时,人们提供布满小孔的巢板(常有成千上万个孔),雌蜂会自己搬进去筑巢」。
- organ:organ-antenna:改为「是蜜蜂最主要的化学感知器官(『鼻子』)」。;括注「(像手臂一样分成根部、关节和长长的末段)」。
- organ:organ-thorax:改为「内部塞满飞行肌,这些肌肉并不直接拉动翅膀,而是让胸壁快速变形,从而带动翅膀高频振动」。
- organ:organ-abdomen:改为「容纳储存花蜜的蜜胃(『蜜囊』)、消化道等;工蜂腹面还有分泌蜂蜡的蜡腺」。
- organ:organ-sting:改为「被螫后尽快用指甲或卡片边缘刮掉螫针(不要用手捏),出现呼吸困难、大面积肿胀等过敏反应应立即就医」。
- organ:organ-corbicula:改为「主要见于蜜蜂、熊蜂等少数蜜蜂科成员」,与 focus:osmia-cornifrons-worker/leg 的说法一致。
- organ:organ-foreleg-cleaner:改为「前足靠近『脚掌』的一节有一个半圆形缺口,与小腿末端的一根刺状突起配合,像小夹子一样刮过触角」。;界面上将该字段标签改为「术语」或「英文/拉丁术语」,或补充真正的拉丁名(如 strigilis)。
- organ:organ-bombus-fur:改为「黑黄白的分带一般认为是警戒色(提醒捕食者『我会螫』)」。
- organ:organ-bombus-flight-muscle:改为「声震取粉;蜜蜂属(Apis)一般不具备此行为」。;改为「温室番茄授粉广泛依赖这一能力」。
- organ:organ-osmia-scopa:改为「这是切叶蜂科的典型特征」。;确认界面在独居蜂页面把该值渲染为「雌蜂」,或在数据中新增 female 职型值。