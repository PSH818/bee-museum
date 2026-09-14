# 对抗式审查报告

> 生成:2026-08-25T01:53:01.213Z  (dry run,未写回)

| 结果 | 条目数 |
|---|---|
| 三方全 pass → ai-reviewed | 18 |
| 保留 draft(任一 fail/uncertain) | 71 |

- fact-check:pass 37 / fail 1 / uncertain 51
- refutation:pass 58 / fail 3 / uncertain 28
- compliance:pass 65 / fail 23 / uncertain 1

## 未通过条目与问题

### focus:apis-mellifera-worker/head
- **refutation** → uncertain
  - 断言:靠近头部,可以看到大颚、下颚须和可伸出的中唇舌。
    问题:蜜蜂的下颚须(maxillary palps)极度退化,肉眼可见、伸出时明显的是下唇须(labial palps),与中唇舌并列构成吸管。把可见的须写成'下颚须'属于张冠李戴。
    依据:Snodgrass《Anatomy of the Honey Bee》及通行蜜蜂形态学:honey bee maxillary palps are vestigial/minute; the labial palps are elongate and sheath the glossa。参考 https://bees.msu.edu/honey-bee-anatomy/
    建议:改为'大颚、下唇须和可伸出的中唇舌',或泛写为'大颚与可伸缩的口器'。

### focus:apis-mellifera-worker/wing
- **fact-check** → uncertain
  - 断言:蜂王腹部长但翅不会等比例变长;雄蜂的翅体比则更适合婚飞
    问题:两个引用来源均未提及职型间翅体比差异;'更适合婚飞'是解释性推断,超出教科书解剖常识
    依据:Hamulus 页面仅 3 句,未提及职型;Snodgrass 未抓取,该断言超出常识范围
    建议:改为可核的描述性措辞:'蜂王翅长与工蜂相近,因腹部更长而显得翅短'并补引 Western honey bee 页面('rounder, longer abdomen');删去'更适合婚飞'或补引具体文献
  - 断言:前翅与后翅通过翅钩联动(连成一个翼面)
    问题:Hamulus 页面只说钩住前翅后缘褶,未说'连成一个翼面'
    依据:'The hooks attach to a fold on the posterior edge of the mesothoracic (front) wings'(判定为教科书常识,不单独扣分)
    建议:可保留;如需严格对应来源,可补引 Wikipedia 'Insect wing' 的 wing coupling 段
- **refutation** → uncertain
  - 断言:雄蜂的翅体比则更适合婚飞。
    问题:目的论表述,把'雄蜂翅较大'推断成'为婚飞而适合',且未给出翅长/体长比数据;原文所引 hamulus 与 Snodgrass 都不支持这一比较结论。
    依据:Wikipedia《Western honey bee》与 Britannica 只描述雄蜂体大、复眼大,未给出翅体比或婚飞适应性的结论;相关翅形态差异研究(如 ResearchGate: Size and Shape Differences in Fore Wings of Honey Bee Queens, Workers and Drones)仅记录雄蜂前翅更大,不做功能推断。
    建议:改为'雄蜂的翅在三种职型中绝对尺寸最大',删去'更适合婚飞'的功能判断,或加'一般认为'。

### focus:apis-mellifera-worker/abdomen
- **compliance** → fail
  - 断言:职型差异首先应通过可信轮廓表达,而不是只改变颜色或整体缩放。
    问题:8 受众适配:这是面向建模者的内部制作要求,不是面向公众的科普事实,出现在 fact 字段会让观众困惑。
    建议:替换为面向观众的事实,如“工蜂腹部有 6 个可见体节,末端藏有螫针;蜂王腹部明显更长,雄蜂末端较钝且无螫针。”
  - 断言:表面同时具有甲壳、环带和短毛
    问题:[可选] 8 受众适配:“环带”含义不明。
    建议:改为“表面有坚硬的甲壳、深浅相间的色带和短毛”。

### focus:apis-mellifera-queen/whole
- **fact-check** → uncertain
  - 断言:蜂王腹部更长
    问题:引用的 Honey bee 页面只说蜂王体型更大,未提腹部更长;Britannica 不可达
    依据:Honey bee: 'In addition to the greater size of the queen, she has a functional set of ovaries, and a spermatheca';Western honey bee(未引用)支持:'has a characteristic rounder, longer abdomen'
    建议:在 sourceIds 中补引 src-wikipedia-western-honey-bee

### focus:apis-mellifera-queen/head
- **refutation** → uncertain
  - 断言:靠近头部,可以看到大颚、下颚须和可伸出的中唇舌。
    问题:蜜蜂的下颚须(maxillary palps)极度退化,肉眼可见、伸出时明显的是下唇须(labial palps),与中唇舌并列构成吸管。把可见的须写成'下颚须'属于张冠李戴。
    依据:Snodgrass《Anatomy of the Honey Bee》及通行蜜蜂形态学:honey bee maxillary palps are vestigial/minute; the labial palps are elongate and sheath the glossa。参考 https://bees.msu.edu/honey-bee-anatomy/
    建议:改为'大颚、下唇须和可伸出的中唇舌',或泛写为'大颚与可伸缩的口器'。

### focus:apis-mellifera-queen/wing
- **fact-check** → uncertain
  - 断言:蜂王腹部长但翅不会等比例变长;雄蜂的翅体比则更适合婚飞
    问题:同 worker/wing:来源未提及,'更适合婚飞'为推断
    依据:未提及
    建议:同 focus:apis-mellifera-worker/wing
- **refutation** → uncertain
  - 断言:雄蜂的翅体比则更适合婚飞。
    问题:目的论表述,把'雄蜂翅较大'推断成'为婚飞而适合',且未给出翅长/体长比数据;原文所引 hamulus 与 Snodgrass 都不支持这一比较结论。
    依据:Wikipedia《Western honey bee》与 Britannica 只描述雄蜂体大、复眼大,未给出翅体比或婚飞适应性的结论;相关翅形态差异研究(如 ResearchGate: Size and Shape Differences in Fore Wings of Honey Bee Queens, Workers and Drones)仅记录雄蜂前翅更大,不做功能推断。
    建议:改为'雄蜂的翅在三种职型中绝对尺寸最大',删去'更适合婚飞'的功能判断,或加'一般认为'。

### focus:apis-mellifera-queen/abdomen
- **compliance** → fail
  - 断言:职型差异首先应通过可信轮廓表达,而不是只改变颜色或整体缩放。
    问题:8 受众适配:内部制作说明泄露到公开 fact 字段(与工蜂腹部条目共用文案)。
    建议:同 focus:apis-mellifera-worker/abdomen:替换为面向观众的腹部事实。

### focus:apis-mellifera-queen/leg
- **fact-check** → uncertain
  - 断言:蜂王没有工蜂式花粉筐
    问题:Pollen basket 页面只说'female of certain species',未区分蜂王;Britannica 不可达
    依据:Pollen basket: 'part of the tibia on the hind legs of the female of certain species of bees';Honey bee(未引用)可作支持:'Workers have morphological specializations, including the pollen basket (corbicula)'
    建议:补引 src-wikipedia-honey-bee
- **compliance** → fail
  - 断言:比较职型时,不能给蜂王复制工蜂的花粉团和花粉筐。
    问题:8 受众适配:这是对建模/讲解团队的内部提醒,不是科普事实。
    建议:改为“蜂王一生几乎不外出采集,后足没有花粉筐,也不会带回花粉团。”

### focus:apis-mellifera-drone/whole
- **fact-check** → uncertain
  - 断言:雄蜂胸部粗壮
    问题:Honey bee 页面未描述雄蜂胸部;Britannica 不可达
    依据:Honey bee 仅有:'Drones have large eyes used to locate queens during mating flights ... do not have a stinger'
    建议:补引 src-snodgrass-anatomy(雄蜂胸部形态属教科书内容)或删去'胸部粗壮'
  - 断言:也没有工蜂式花粉筐
    问题:来源仅间接支持(花粉筐列为工蜂特化结构)
    依据:Honey bee: 'Workers have morphological specializations, including the pollen basket (corbicula)'
    建议:可接受;如需更直接来源可补引 Wikipedia 'Drone (bee)'

### focus:apis-mellifera-drone/head
- **refutation** → uncertain
  - 断言:靠近头部,可以看到大颚、下颚须和可伸出的中唇舌。
    问题:蜜蜂的下颚须(maxillary palps)极度退化,肉眼可见、伸出时明显的是下唇须(labial palps),与中唇舌并列构成吸管。把可见的须写成'下颚须'属于张冠李戴。
    依据:Snodgrass《Anatomy of the Honey Bee》及通行蜜蜂形态学:honey bee maxillary palps are vestigial/minute; the labial palps are elongate and sheath the glossa。参考 https://bees.msu.edu/honey-bee-anatomy/
    建议:改为'大颚、下唇须和可伸出的中唇舌',或泛写为'大颚与可伸缩的口器'。

### focus:apis-mellifera-drone/wing
- **fact-check** → uncertain
  - 断言:蜂王腹部长但翅不会等比例变长;雄蜂的翅体比则更适合婚飞
    问题:同 worker/wing
    依据:未提及
    建议:同 focus:apis-mellifera-worker/wing
- **refutation** → uncertain
  - 断言:雄蜂的翅体比则更适合婚飞。
    问题:目的论表述,把'雄蜂翅较大'推断成'为婚飞而适合',且未给出翅长/体长比数据;原文所引 hamulus 与 Snodgrass 都不支持这一比较结论。
    依据:Wikipedia《Western honey bee》与 Britannica 只描述雄蜂体大、复眼大,未给出翅体比或婚飞适应性的结论;相关翅形态差异研究(如 ResearchGate: Size and Shape Differences in Fore Wings of Honey Bee Queens, Workers and Drones)仅记录雄蜂前翅更大,不做功能推断。
    建议:改为'雄蜂的翅在三种职型中绝对尺寸最大',删去'更适合婚飞'的功能判断,或加'一般认为'。

### focus:apis-mellifera-drone/abdomen
- **compliance** → fail
  - 断言:职型差异首先应通过可信轮廓表达,而不是只改变颜色或整体缩放。
    问题:8 受众适配:内部制作说明泄露到公开 fact 字段(共用文案)。
    建议:同 focus:apis-mellifera-worker/abdomen:替换为面向观众的腹部事实。

### focus:apis-mellifera-drone/leg
- **fact-check** → uncertain
  - 断言:雄蜂没有工蜂式花粉筐;雄蜂无螫针
    问题:Pollen basket 页面未提雄蜂,也不涉及螫针;Britannica 不可达。断言本身正确但当前引用无法支撑
    依据:Western honey bee(未引用):'Since they do not have ovipositors, they do not have stingers';Honey bee(未引用):'Workers have morphological specializations, including the pollen basket'
    建议:补引 src-wikipedia-western-honey-bee 与 src-wikipedia-honey-bee
- **compliance** → fail
  - 断言:雄蜂无花粉团、无螫针,这两点需要在模型和讲解中保持一致。
    问题:8 受众适配:“需要在模型和讲解中保持一致”是内部制作要求,不应公开展示。
    建议:改为“雄蜂不采集花粉,也没有螫针——所以它既不会带回花粉团,也不会螫人。”

### focus:apis-cerana-worker/whole
- **fact-check** → uncertain
  - 断言:腹部环纹更均匀清晰
    问题:Apis cerana 页面只说有四条黄色腹纹,无与西方蜜蜂的清晰度比较
    依据:'Adult Apis cerana are black in color, with four yellow abdominal stripes.'
    建议:改为'腹部有四条黄色环纹'或补引养蜂学教材中的形态比较
  - 断言:耐低温、善于利用零星蜜源
    问题:页面只说其在 12–36 °C 环境下能维持体温 33–35.5 °C,未提及耐低温优于西方蜜蜂或利用零星蜜源
    依据:'A. cerana maintain body temperatures in a range of 33–35.5 °C even while ambient temperatures vary between 12 and 36 °C';零星蜜源:未提及
    建议:补引 FAO 或中国养蜂学文献(如《中国蜂业》/《中华蜜蜂》专著)或删去
  - 断言:是亚洲本土传统养蜂的主角
    问题:页面未提及传统养蜂
    依据:未提及(Honey bee 页面有 'the traditional honey bee of southern and eastern Asia' 可作弱支持,但该页未被本条引用)
    建议:补引 src-wikipedia-honey-bee

### focus:apis-cerana-worker/head
- **refutation** → uncertain
  - 断言:靠近头部,可以看到大颚、下颚须和可伸出的中唇舌。
    问题:蜜蜂的下颚须(maxillary palps)极度退化,肉眼可见、伸出时明显的是下唇须(labial palps),与中唇舌并列构成吸管。把可见的须写成'下颚须'属于张冠李戴。
    依据:Snodgrass《Anatomy of the Honey Bee》及通行蜜蜂形态学:honey bee maxillary palps are vestigial/minute; the labial palps are elongate and sheath the glossa。参考 https://bees.msu.edu/honey-bee-anatomy/
    建议:改为'大颚、下唇须和可伸出的中唇舌',或泛写为'大颚与可伸缩的口器'。

### focus:apis-cerana-worker/wing
- **fact-check** → uncertain
  - 断言:蜂王腹部长但翅不会等比例变长;雄蜂的翅体比则更适合婚飞
    问题:同 apis-mellifera-worker/wing
    依据:未提及
    建议:同 focus:apis-mellifera-worker/wing
- **refutation** → uncertain
  - 断言:雄蜂的翅体比则更适合婚飞。
    问题:目的论表述,把'雄蜂翅较大'推断成'为婚飞而适合',且未给出翅长/体长比数据;原文所引 hamulus 与 Snodgrass 都不支持这一比较结论。
    依据:Wikipedia《Western honey bee》与 Britannica 只描述雄蜂体大、复眼大,未给出翅体比或婚飞适应性的结论;相关翅形态差异研究(如 ResearchGate: Size and Shape Differences in Fore Wings of Honey Bee Queens, Workers and Drones)仅记录雄蜂前翅更大,不做功能推断。
    建议:改为'雄蜂的翅在三种职型中绝对尺寸最大',删去'更适合婚飞'的功能判断,或加'一般认为'。

### focus:apis-cerana-worker/abdomen
- **compliance** → fail
  - 断言:职型差异首先应通过可信轮廓表达,而不是只改变颜色或整体缩放。
    问题:8 受众适配:内部制作说明泄露到公开 fact 字段(共用文案)。
    建议:同 focus:apis-mellifera-worker/abdomen:替换为面向观众的腹部事实,可顺带点出东方蜜蜂腹部环纹更均匀清晰。

### focus:apis-cerana-queen/whole
- **fact-check** → uncertain
  - 断言:东方蜜蜂比西方蜜蜂更容易分蜂和迁飞
    问题:来源仅支持'迁飞/弃巢(absconding)更多',对'分蜂(swarming)更容易'无比较
    依据:'A. cerana has more absconding behavior than A. mellifera'
    建议:改为'东方蜜蜂比西方蜜蜂更容易迁飞(弃巢)',或为分蜂频率补引专门来源
- **refutation** → uncertain
  - 断言:一个成熟蜂群通常只有约 6000–7000 只工蜂
    问题:数字过窄且偏低。6000–7000 只是 Wikipedia 转引的单一数据,其他资料给出 6000–10000 只,中国饲养的中蜂强群可达一两万只;亚种与季节差异很大,写成'通常只有 6000–7000'以偏概全。
    依据:Wikipedia《Apis cerana》: 'around 6,000 to 7,000 workers'(https://en.wikipedia.org/wiki/Apis_cerana);Bees for Development / HoneyBee & Co.: 'Typical managed colonies of Apis cerana contain 6,000 to 10,000 workers'(https://resources.beesfordevelopment.org/rc/apis-cerana-group/ , https://honeybeeandco.uk/eastern-honeybee/)。
    建议:改为'通常数千至一万余只,明显小于西方蜜蜂群体',并注明随亚种与季节变化。

### focus:apis-cerana-queen/head
- **refutation** → uncertain
  - 断言:靠近头部,可以看到大颚、下颚须和可伸出的中唇舌。
    问题:蜜蜂的下颚须(maxillary palps)极度退化,肉眼可见、伸出时明显的是下唇须(labial palps),与中唇舌并列构成吸管。把可见的须写成'下颚须'属于张冠李戴。
    依据:Snodgrass《Anatomy of the Honey Bee》及通行蜜蜂形态学:honey bee maxillary palps are vestigial/minute; the labial palps are elongate and sheath the glossa。参考 https://bees.msu.edu/honey-bee-anatomy/
    建议:改为'大颚、下唇须和可伸出的中唇舌',或泛写为'大颚与可伸缩的口器'。

### focus:apis-cerana-queen/wing
- **fact-check** → uncertain
  - 断言:蜂王腹部长但翅不会等比例变长;雄蜂的翅体比则更适合婚飞
    问题:同 apis-mellifera-worker/wing
    依据:未提及
    建议:同 focus:apis-mellifera-worker/wing
- **refutation** → uncertain
  - 断言:雄蜂的翅体比则更适合婚飞。
    问题:目的论表述,把'雄蜂翅较大'推断成'为婚飞而适合',且未给出翅长/体长比数据;原文所引 hamulus 与 Snodgrass 都不支持这一比较结论。
    依据:Wikipedia《Western honey bee》与 Britannica 只描述雄蜂体大、复眼大,未给出翅体比或婚飞适应性的结论;相关翅形态差异研究(如 ResearchGate: Size and Shape Differences in Fore Wings of Honey Bee Queens, Workers and Drones)仅记录雄蜂前翅更大,不做功能推断。
    建议:改为'雄蜂的翅在三种职型中绝对尺寸最大',删去'更适合婚飞'的功能判断,或加'一般认为'。

### focus:apis-cerana-queen/abdomen
- **compliance** → fail
  - 断言:职型差异首先应通过可信轮廓表达,而不是只改变颜色或整体缩放。
    问题:8 受众适配:内部制作说明泄露到公开 fact 字段(共用文案)。
    建议:同 focus:apis-mellifera-worker/abdomen:替换为面向观众的腹部事实。

### focus:apis-cerana-queen/leg
- **fact-check** → uncertain
  - 断言:蜂王后足没有工蜂式的花粉筐
    问题:Pollen basket 与 Western honey bee 页面都未提及蜂王是否有花粉筐
    依据:未提及;Honey bee(未引用)可作支持:'Workers have morphological specializations, including the pollen basket (corbicula)'
    建议:补引 src-wikipedia-honey-bee
- **compliance** → fail
  - 断言:比较职型时,不能给蜂王复制工蜂的花粉团和花粉筐。
    问题:8 受众适配:内部制作提醒,不是科普事实。
    建议:改为“蜂王几乎不外出采集,后足没有花粉筐,也不会带回花粉团。”

### focus:apis-cerana-drone/whole
- **fact-check** → uncertain
  - 断言:东方蜜蜂雄蜂胸部粗壮
    问题:两个引用来源均未描述雄蜂胸部
    依据:Apis cerana: 'Drones ... defined by larger eyes, lack of a stinger ... only function is to mate'
    建议:删去'胸部粗壮'或补引 Snodgrass
  - 断言:也没有花粉筐
    问题:未提及
    依据:未提及
    建议:补引 src-wikipedia-honey-bee
- **refutation** → uncertain
  - 断言:唯一职能是与新蜂王交配
    问题:绝对化。雄蜂的主要职能是交配,但有研究认为雄蜂在巢内参与子脾保温(thermoregulation),'唯一'说不住。
    依据:Wikipedia《Western honey bee》: 'it is believed that drones may play a significant role in thermoregulation'(https://en.wikipedia.org/wiki/Western_honey_bee)。
    建议:改为'主要职能是与新蜂王交配'。
- **compliance** → fail
  - 断言:唯一职能是与新蜂王交配
    问题:1 绝对化:“唯一”缺少限定;雄蜂在巢内还参与保温等次要活动。
    建议:改为“主要职能是与新蜂王交配”。
  - 断言:这一点在所有蜜蜂中都一样
    问题:1 绝对化:“所有”应留余地并说明范围。
    建议:改为“这一点在蜜蜂属乃至绝大多数蜂类中都是如此”。

### focus:apis-cerana-drone/head
- **refutation** → uncertain
  - 断言:靠近头部,可以看到大颚、下颚须和可伸出的中唇舌。
    问题:蜜蜂的下颚须(maxillary palps)极度退化,肉眼可见、伸出时明显的是下唇须(labial palps),与中唇舌并列构成吸管。把可见的须写成'下颚须'属于张冠李戴。
    依据:Snodgrass《Anatomy of the Honey Bee》及通行蜜蜂形态学:honey bee maxillary palps are vestigial/minute; the labial palps are elongate and sheath the glossa。参考 https://bees.msu.edu/honey-bee-anatomy/
    建议:改为'大颚、下唇须和可伸出的中唇舌',或泛写为'大颚与可伸缩的口器'。

### focus:apis-cerana-drone/wing
- **fact-check** → uncertain
  - 断言:蜂王腹部长但翅不会等比例变长;雄蜂的翅体比则更适合婚飞
    问题:同 apis-mellifera-worker/wing
    依据:未提及
    建议:同 focus:apis-mellifera-worker/wing
- **refutation** → uncertain
  - 断言:雄蜂的翅体比则更适合婚飞。
    问题:目的论表述,把'雄蜂翅较大'推断成'为婚飞而适合',且未给出翅长/体长比数据;原文所引 hamulus 与 Snodgrass 都不支持这一比较结论。
    依据:Wikipedia《Western honey bee》与 Britannica 只描述雄蜂体大、复眼大,未给出翅体比或婚飞适应性的结论;相关翅形态差异研究(如 ResearchGate: Size and Shape Differences in Fore Wings of Honey Bee Queens, Workers and Drones)仅记录雄蜂前翅更大,不做功能推断。
    建议:改为'雄蜂的翅在三种职型中绝对尺寸最大',删去'更适合婚飞'的功能判断,或加'一般认为'。

### focus:apis-cerana-drone/abdomen
- **compliance** → fail
  - 断言:职型差异首先应通过可信轮廓表达,而不是只改变颜色或整体缩放。
    问题:8 受众适配:内部制作说明泄露到公开 fact 字段(共用文案)。
    建议:同 focus:apis-mellifera-worker/abdomen:替换为面向观众的腹部事实。

### focus:apis-cerana-drone/leg
- **fact-check** → uncertain
  - 断言:雄蜂没有工蜂式花粉筐
    问题:Pollen basket 与 Western honey bee 均未提及雄蜂花粉筐(无螫针一点已由 Western honey bee 支持)
    依据:Western honey bee: 'Since they do not have ovipositors, they do not have stingers';花粉筐:未提及
    建议:补引 src-wikipedia-honey-bee
- **compliance** → fail
  - 断言:雄蜂无花粉团、无螫针,这两点需要在模型和讲解中保持一致。
    问题:8 受众适配:“需要在模型和讲解中保持一致”是内部制作要求。
    建议:改为“雄蜂不采集花粉,也没有螫针——既不会带回花粉团,也不会螫人。”

### focus:bombus-terrestris-worker/whole
- **fact-check** → uncertain
  - 断言:厚厚的毛被有助于保温,让它在较凉的天气也能出勤访花
    问题:Bombus terrestris 页面全文无 insulation/pile/thermoregulation 相关内容
    依据:未提及;Wikipedia 'Bumblebee'(未引用)支持:'The thick pile created by long setae (bristles) acts as insulation to keep bumblebees warm in cold weather'
    建议:补引 Wikipedia 'Bumblebee' 页面

### focus:bombus-terrestris-worker/head
- **fact-check** → uncertain
  - 断言:中舌相对较长,配合粗壮身体,能利用一些蜜蜂够不到的深冠筒花朵
    问题:疑似事实错误。两个引用来源均未提及舌长(Britannica 不可达);而在熊蜂学通行分类中 Bombus terrestris 是典型短舌种(short-tongued),以咬穿花冠基部'偷蜜'著称,并不以深冠筒花朵取蜜见长。Wikipedia 'Bumblebee' 只说'some bumblebee species have long tongues',并非指 B. terrestris
    依据:Bombus terrestris 页面:全文无 tongue/proboscis;Bumblebee 页面:'some bumblebee species have long tongues and collect nectar from flowers that are closed into a tube' 与 'Many species of bumblebees also exhibit nectar robbing'
    建议:改写为'欧洲熊蜂属于短舌熊蜂,遇到深冠筒花朵时常直接咬穿花冠基部取蜜(偷蜜)',并补引 Wikipedia 'Bumblebee' 或 Goulson《Bumblebees: Behaviour, Ecology, and Conservation》
  - 断言:同一巢的工蜂可以差出近一倍
    问题:来源支持(工蜂 11–17 mm,胸宽 2.3–6.9 mm,体重 68–754 mg)
    依据:'thorax sizes ranging from 2.3 to 6.9 mm in length and masses ranging from 68 to 754 mg';'workers from 11 to 17 mm'
    建议:无需修改
- **refutation** → fail
  - 断言:中舌相对较长,配合粗壮身体,能利用一些蜜蜂够不到的深冠筒花朵。
    问题:事实错误。欧洲熊蜂(Bombus terrestris)是典型的短舌熊蜂,舌长约 6–8 mm,恰恰够不到深冠筒花的花蜜,因而以'盗蜜'(在花冠基部咬孔)著称;长舌种是 B. hortorum 等。这里把长舌熊蜂的特征套到了本种上。
    依据:bumblebee.org: 'Bombus terrestris and lucorum with their short tongues ... became thieves and nectar robbing'(https://www.bumblebee.org/terr.htm);Nectar robbing by the invasive bumblebee Bombus terrestris(https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12553366/);The advantage of short tongues in bumble bees(https://www.cambridge.org/core/journals/canadian-entomologist/article/abs/advantage-of-short-tongues-in-bumble-bees-bombus-analyses-of-species-distributions-according-to-flower-corolla-depth-and-of-working-speeds-on-white-clover/A0C6D8DC302A7BCE6F621C0E7ADAEC3C)。
    建议:改为'欧洲熊蜂属短舌熊蜂,偏好开放或浅冠筒花;遇到深冠筒花时常在花冠基部咬孔盗蜜。真正能合法探入深花的是长舌熊蜂(如 Bombus hortorum)。'

### focus:bombus-terrestris-worker/wing
- **fact-check** → uncertain
  - 断言:翅显得偏小;依靠高频扇动与灵活的翅角控制维持飞行,前后翅同样以翅钩联动
    问题:Bombus terrestris 页面未涉及翅形态、扇动频率或翅钩;Britannica 不可达
    依据:未提及;Bumblebee(未引用):'Bees beat their wings about 200 times a second'
    建议:补引 Wikipedia 'Bumblebee' Flight 段,并给出'约 200 Hz'
  - 断言:'按空气动力学熊蜂不会飞'是个流传已久的误解——非定常涡流升力早已解释了它的飞行
    问题:两个引用来源均未提及该误解;Bumblebee 页面解释用的是 dynamic stall,而非'涡流升力'一词
    依据:Bumblebee(未引用):'a widely believed falsehood holds that scientists proved bumblebees to be incapable of flight' ... dynamic stall 'briefly produces several times the lift of the aerofoil in regular flight'
    建议:补引 Wikipedia 'Bumblebee',并把'非定常涡流升力'改为'非定常空气动力学(动态失速产生的前缘涡)'
- **compliance** → fail
  - 断言:非定常涡流升力早已解释了它的飞行
    问题:8 受众适配:“非定常涡流升力”是空气动力学专业术语,是本条 fact 的核心内容却完全未解释,中小学观众无法理解;“早已”带评价口吻。
    建议:改为“空气动力学研究已经解释了它的飞行:翅膀快速拍动时会在翅面上方卷起小旋涡,这些旋涡能提供额外的升力,用静止机翼的公式算不出来。”

### focus:bombus-terrestris-worker/leg
- **fact-check** → uncertain
  - 断言:工蜂和蜂王后足胫节同样特化出光滑的花粉筐
    问题:Pollen basket 页面支持熊蜂族有花粉筐,但未区分蜂王;Britannica 不可达
    依据:Pollen basket: 'Bees in four tribes of the family Apidae ... have corbiculae';Bumblebee(未引用):'In queens and workers this is then groomed into the corbiculae (pollen baskets) on the hind legs'
    建议:补引 Wikipedia 'Bumblebee'
  - 断言:熊蜂访花速度快、耐低温,单位时间授粉效率常高于蜜蜂
    问题:两个引用来源均未做此比较;Bumblebee 页面也未直接比较效率
    依据:未提及(Bumblebee 仅有 'bumblebees can reach ground speeds of up to 15 m/s')
    建议:补引授粉效率比较文献(如 Willmer et al. 1994 或 Velthuis & van Doorn 2006)或改为'能在较低温度下出勤,是重要的作物授粉者'
- **refutation** → uncertain
  - 断言:熊蜂访花速度快、耐低温,单位时间授粉效率常高于蜜蜂。
    问题:泛化结论。熊蜂单花访问效率高于蜜蜂的证据集中在番茄、蓝莓、红三叶等特定作物;对多数作物并无普适结论,且 B. terrestris 采集偏好约 25 °C 的环境。
    依据:Wikipedia《Bombus terrestris》: 'foragers prefer ambient temperatures of around 25 °C during nectar and pollen collection'(https://en.wikipedia.org/wiki/Bombus_terrestris);Wikipedia《Buzz pollination》仅就管状花药植物比较。
    建议:改为'在番茄、蓝莓等作物上,熊蜂的单花访问效率常高于蜜蜂;它也能在蜜蜂不出勤的凉爽阴天工作'。

### focus:osmia-cornifrons-worker/whole
- **refutation** → uncertain
  - 断言:是日本苹果园超过一半果园倚赖的授粉蜂
    问题:时态与量词偏差。来源说的是自 1940 年代起的约 50 年间'超过一半的日本苹果园曾使用过'该蜂,写成现在时的'倚赖'是把历史累计比例当成现状。
    依据:Wikipedia《Osmia cornifrons》: over a 50-year period from the 1940s 'more than half of the apple orchards in Japan utilized this species'(https://en.wikipedia.org/wiki/Osmia_cornifrons)。
    建议:改为'20 世纪后半叶,日本超过一半的苹果园曾用它授粉'。
- **compliance** → fail
  - 断言:没有蜂群的蜜蜂:一只雌蜂就是整个家
    问题:5 名称规范:标题把壁蜂称作“蜜蜂”,而本物种腹部条目写“壁蜂没有蜜蜂那样的后足花粉筐”,同一物种内“蜜蜂”一词指代前后矛盾。
    建议:改为“没有蜂群的蜂:一只雌蜂就是整个家”。
  - 断言:“壁蜂”之名由此而来
    问题:2 确定性口径:名称由来写成定论。
    建议:改为“‘壁蜂’(英文 mason bee,泥匠蜂)之名一般认为由此而来”。
  - 断言:是日本苹果园超过一半果园倚赖的授粉蜂
    问题:[可选] 8 受众适配:句子结构拗口。
    建议:改为“日本超过一半的苹果园依赖它授粉”。

### focus:osmia-cornifrons-worker/head
- **fact-check** → uncertain
  - 断言:雌蜂下脸(唇基)长有一对角状突起,学名 cornifrons 意为'有角的额'
    问题:来源支持'下脸有角状突起',但未点明唇基(clypeus),也未解释词源
    依据:'this species of bee is recognized for its horn-like extensions originating from its lower face'
    建议:可接受;如需精确到唇基可补引 Discover Life / BugGuide 的 O. cornifrons 形态描述
  - 断言:强壮的大颚用于搬运和塑形筑巢的泥土
    问题:页面全文未提及 mandible
    依据:未提及
    建议:补引 Wikipedia 'Mason bee' 或删去'强壮'等形态定语,改为'雌蜂用泥土封闭巢室'

### focus:osmia-cornifrons-worker/wing
- **fact-check** → uncertain
  - 断言:壁蜂通常在巢址附近几十米内往返采集
    问题:来源给出的是巢址到作物田的距离(130 m 内,有的达 700 m),不是'几十米'的采集半径;数字量级不符
    依据:'Both males and females will create a nest within 130 meters of a crop field; however, nest locations have been noted to exceed this distance; some being situated 700 meters away.'
    建议:改为'壁蜂多在巢址附近一二百米范围内采集(巢址通常建在作物田 130 m 以内)'
  - 断言:前后翅以翅钩联动
    问题:本条未引用翅钩来源,属通用膜翅目常识
    依据:教科书常识
    建议:可补引 src-wikipedia-hamulus
- **refutation** → uncertain
  - 断言:壁蜂通常在巢址附近几十米内往返采集
    问题:距离数字偏小且无来源。所引 Wikipedia 给出的是巢与作物田的距离通常在 130 m 以内、个别达 700 m;'几十米'低估了活动半径。
    依据:Wikipedia《Osmia cornifrons》: 'create a nest within 130 meters of a crop field; ... some being situated 700 meters away'(https://en.wikipedia.org/wiki/Osmia_cornifrons)。
    建议:改为'通常在巢址一两百米范围内采集,是典型的短距离采集者'。

### focus:osmia-cornifrons-worker/abdomen
- **fact-check** → uncertain
  - 断言:访花时干燥的花粉直接刷附在腹部下方;花粉不被唾液或花蜜粘成团,松散地夹在毛间——这让它在果树间传粉的效率很高
    问题:Scopa 页面支持切叶蜂科腹面集粉毛,但两个来源都未提及花粉干燥/不粘团,更未提及由此带来的传粉效率
    依据:Scopa: 'the Megachilidae, lack modified leg hairs, but have an extensive scopa on the underside of the abdomen';干燥/效率:未提及
    建议:为'干燥松散花粉→传粉效率高'的因果链补引来源(如 Bosch & Kemp 2001《How to Manage the Blue Orchard Bee》),或改为'花粉干燥地夹在毛间带回巢中'并去掉效率推论

### focus:osmia-cornifrons-worker/leg
- **fact-check** → fail
  - 断言:腹面集粉毛才是多数蜂类的携粉方式
    问题:与来源相反。Scopa 页面明确指出多数蜂类的集粉毛位于后足,腹面集粉毛只是切叶蜂科的特征
    依据:Scopa: 'In most species of bees, the scopa is simply a dense mass of elongated, often branched, hairs (or setae) on the hind leg' 与 'the Megachilidae, lack modified leg hairs, but have an extensive scopa on the underside of the abdomen'
    建议:改为'多数蜂类用后足集粉毛携粉;切叶蜂科(壁蜂、切叶蜂)则把集粉毛长在腹面;而光滑的花粉筐只见于蜜蜂科少数几族'
  - 断言:花粉筐(corbicula)只见于蜜蜂科少数几族
    问题:来源支持
    依据:Pollen basket: 'Bees in four tribes of the family Apidae ... have corbiculae'
    建议:无需修改
- **refutation** → fail
  - 断言:花粉筐(corbicula)只见于蜜蜂科少数几族,腹面集粉毛才是多数蜂类的携粉方式。
    问题:后半句事实错误。腹面(腹部腹面)集粉毛是切叶蜂科 Megachilidae 独有的特征;地蜂科、隧蜂科、分舌蜂科以及蜜蜂科中非花粉筐类群等绝大多数蜂类都把花粉携在后足(胫节/基跗节/股节)的集粉毛上。'多数蜂类用腹面集粉毛'与事实相反。
    依据:Minnesota Native Bees: 'carry pollen only on the underside of the abdomen, never on the hind legs. This trait is unique to the family Megachilidae; nest-building bees in the remaining five families ... carry pollen on their hind legs'(https://www.beesmn.org/megachilidae);Wikipedia《Scopa (biology)》(https://en.wikipedia.org/wiki/Scopa_(biology))。
    建议:改为'花粉筐只见于蜜蜂科的少数几族(蜜蜂、熊蜂、无刺蜂、兰花蜂);多数其他蜂类用后足的集粉毛携粉,而把花粉带在腹面则是切叶蜂科的独门方式'。
- **compliance** → fail
  - 断言:腹面集粉毛才是多数蜂类的携粉方式
    问题:1 绝对化/过度概括:腹面集粉毛是切叶蜂科的特征,多数蜂类的集粉毛长在后足;“才是多数”缺少限定。
    建议:改为“花粉筐(corbicula)只见于蜜蜂科少数几族;多数蜂类靠身体不同部位(后足或腹面)的集粉毛携粉”。

### focus:megachile-rotundata-worker/whole
- **compliance** → fail
  - 断言:会裁剪树叶的小蜜蜂
    问题:5 名称规范:切叶蜂不属于蜜蜂属,本馆其余条目均以“蜜蜂”与“切叶蜂”对举,标题称“小蜜蜂”前后矛盾。
    建议:改为“会裁剪树叶的小蜂”。
  - 断言:被引入北美、新西兰和澳大利亚作为苜蓿制种的管理授粉蜂
    问题:[可选] 8 受众适配:“制种”“管理授粉蜂”为行业术语。
    建议:改为“被引入北美、新西兰和澳大利亚,用于给生产种子的苜蓿田授粉”。

### focus:megachile-rotundata-worker/head
- **fact-check** → uncertain
  - 断言:切叶蜂头部相对宽大,大颚强壮而边缘锋利
    问题:来源只说用大颚剪下圆形叶片,未描述头部宽大或大颚锋利
    依据:'Each cell is made from circular disks cut from plant leaves using the bee's mandibles, hence the name leafcutter'
    建议:删去'头部相对宽大',或补引 Wikipedia 'Megachile' 属页面的形态描述

### focus:megachile-rotundata-worker/wing
- **fact-check** → uncertain
  - 断言:雌蜂用足夹着剪下的叶片飞行
    问题:页面未描述运叶方式
    依据:未提及
    建议:补引 Wikipedia 'Megachile'(切叶蜂属)或删去
  - 断言:访花时会'撬开'苜蓿花的龙骨瓣
    问题:来源描述为把喙插入龙骨瓣,并未说'撬开/触发(trip)';苜蓿花的弹开(tripping)是真实现象,但本来源不支持该措辞
    依据:'During feeding, the bee will insert its proboscis into the keel of the plant. In the process, pollen is brushed onto its scopa.'
    建议:改为'取食时把喙插入苜蓿花的龙骨瓣,花粉随之刷到集粉毛上',或为'触发龙骨瓣'补引 Pitts-Singer & Cane 2011(Annual Review of Entomology)

### focus:megachile-rotundata-worker/abdomen
- **fact-check** → uncertain
  - 断言:腹部背面各节后缘有一道白色毛带
    问题:两个来源均未提及腹部毛带,页面只说雌蜂全身有白毛
    依据:'Megachile rotundata bees are a dark grey color. Females have white hairs all over their bodies, including on their scopae.'
    建议:改为'深灰底色上覆白色细毛,腹面为密集集粉毛',或补引 Discover Life / BugGuide 对 M. rotundata 腹部 fasciae 的描述

### focus:xylocopa-violacea-worker/whole
- **fact-check** → uncertain
  - 断言:通体黑色,在阳光下泛出蓝紫色金属光泽,翅膀也是烟紫色
    问题:Xylocopa violacea 页面没有任何体色/翅色描述,只有'violet'出现在俗名中
    依据:未提及(页面 Description 段仅讲越冬、羽化、筑巢)
    建议:补引带形态描述的来源,如 Wikipedia 'Carpenter bee' 或 NatureSpot / iNaturalist 物种页
  - 断言:欧亚大陆最大的蜂类之一
    问题:来源说的是'欧洲'最大蜂之一,措辞略扩大
    依据:'one of the largest bees in Europe'
    建议:改为'欧洲最大的蜂类之一'
- **refutation** → uncertain
  - 断言:紫木蜂是欧亚大陆最大的蜂类之一
    问题:范围扩大。来源只说它是'欧洲最大的蜂类之一';亚洲有体长 4 cm 级的华莱士巨蜂(Megachile pluto)及更大的热带木蜂,'欧亚最大之一'难以成立。
    依据:Wikipedia《Xylocopa violacea》: 'one of the largest bees in Europe'(https://en.wikipedia.org/wiki/Xylocopa_violacea)。
    建议:改为'欧洲最大的蜂类之一'。

### focus:xylocopa-violacea-worker/head
- **fact-check** → uncertain
  - 断言:头部宽大,大颚极为强壮;它不吃木头,只是钻洞;木屑会被推出洞口
    问题:Xylocopa violacea 页面未提及大颚、头部或木屑
    依据:未提及;Wikipedia 'Carpenter bee'(未引用)支持:'Carpenter bees do not eat wood; they discard the bits of wood, or reuse particles to build partitions between cells' 及 'rasp their mandibles against hardwood'
    建议:补引 Wikipedia 'Carpenter bee';并可补充'木屑或被推出,或被用来隔间'

### focus:xylocopa-violacea-worker/wing
- **fact-check** → uncertain
  - 断言:木蜂的翅膜呈烟褐色,在特定角度下折射出蓝紫虹彩
    问题:来源无翅色描述
    依据:未提及
    建议:补引形态描述来源(同 whole)
  - 断言:木蜂属被认为能进行振动授粉
    问题:Buzz pollination 页面以 Xylocopa frontalis 为例,支持属级'被认为能',但未涉及 X. violacea 本种
    依据:'Xylocopa frontalis' 列于 'Examples of buzz pollinating bee species'
    建议:可接受;建议措辞保留'木蜂属'而不写成'紫木蜂能'

### focus:xylocopa-violacea-worker/abdomen
- **fact-check** → uncertain
  - 断言:木蜂腹部几乎无毛,光滑坚硬的甲壳
    问题:本种页面未提及;仅 Carpenter bee 属页面(未引用)支持
    依据:Carpenter bee(未引用):'most carpenter bees have a shiny abdomen, whereas bumblebee abdomens are completely covered with dense hair'
    建议:补引 Wikipedia 'Carpenter bee'
  - 断言:这种结构色来自甲壳表面的微结构,而非色素
    问题:任何来源均未提及结构色机理;这是具体科学论断,需专门来源
    依据:未提及
    建议:补引昆虫结构色文献(如 Seago et al. 2009 J. R. Soc. Interface 'Gold bugs and beyond'),或改为'蓝紫光泽随观察角度变化,属于结构色的表现'并标注待核
- **refutation** → uncertain
  - 断言:光滑坚硬的甲壳呈黑色并带蓝紫金属光泽——这种结构色来自甲壳表面的微结构,而非色素。
    问题:无来源的机理断言。X. violacea 的标志性蓝紫虹彩主要在翅膜(薄膜干涉),身体基本是黑色、仅有微弱光泽;所引 Wikipedia 页面完全没有讨论体表颜色成因。把'结构色/非色素'写成定论超出证据。
    依据:Wikipedia《Xylocopa violacea》对体色成因无任何描述(https://en.wikipedia.org/wiki/Xylocopa_violacea);多处科普来源描述为 'robust jet-black body' 与 'metallic violet-blue wings'(https://www.buzzaboutbees.net/violet-carpenter-bee.html)。
    建议:把结构色的表述限定在翅膜,身体改为'黑色,带微弱金属光泽';若保留结构色说法,加'一般认为'并补引昆虫结构色文献。
- **compliance** → fail
  - 断言:这种结构色来自甲壳表面的微结构,而非色素
    问题:2 确定性口径:成因机理写成定论,所引来源并未论证该机制。
    建议:改为“一般认为这种光泽是结构色——由甲壳表面的微结构对光的作用产生,而不是色素”。
  - 断言:在博物馆的灯光下转动标本,能看到光泽随角度变化。
    问题:[可选] 8 受众适配:本馆为线上博物馆,观众看到的是 3D 模型而非实物标本,易造成误解。
    建议:改为“在光线下转动实物标本(或本馆的 3D 模型),能看到光泽随角度变化。”

### focus:xylocopa-violacea-worker/leg
- **fact-check** → uncertain
  - 断言:后足有集粉毛用于携粉
    问题:本种页面未提及;Carpenter bee 属页面(未引用)说后足全毛、无花粉筐,可作间接支持
    依据:Carpenter bee(未引用):'females lack the bare corbicula of bumblebees; the hind leg is entirely hairy'
    建议:补引 Wikipedia 'Carpenter bee'
  - 断言:飞行声音低沉,常被误认为大型熊蜂或蝇类
    问题:声音低沉:任何来源未提及;误认为熊蜂:仅 Carpenter bee 属页面间接提及与熊蜂的区别
    依据:未提及
    建议:删去'飞行声音低沉'或补引可核来源;'常被误认为熊蜂'可补引 Wikipedia 'Carpenter bee'

### organ:organ-proboscis
- **compliance** → fail
  - 断言:按前端方案 §8.1 要求在此注明。
    问题:8/9 受众适配与模型说明:内部文档引用(“前端方案 §8.1”)出现在面向公众的 modelNote 中,观众无从理解,应删除;模型省略的说明本身是诚实且值得保留的。
    建议:改为“当前首屏高精度模型未雕刻口器,标注点位于头部下前方的近似位置;程序化标本模型包含简化口器。”并删去“按前端方案 §8.1 要求在此注明”。
  - 断言:bee-hero.glb
    问题:[可选] 8 受众适配:文件名对观众无意义。
    建议:改为“首屏高精度模型”。

### organ:organ-abdomen
- **refutation** → uncertain
  - 断言:腹部……容纳蜜胃、消化道、蜡腺与螫针等结构(castes: worker/queen/drone)
    问题:该条目挂在三种职型下,但蜡腺仅工蜂具有功能性发育,螫针雄蜂完全没有;在雄蜂视图里讲'腹部含蜡腺与螫针'是张冠李戴。
    依据:Britannica《Honeybee》与 Wikipedia《Worker bee》: wax glands are on worker abdominal sternites; drones lack a sting(https://en.wikipedia.org/wiki/Worker_bee)。
    建议:改为'腹部容纳蜜胃与消化道;工蜂腹面另有蜡腺,雌性末端有螫针(雄蜂无)',或按职型分别显示。
- **compliance** → fail
  - 断言:容纳蜜胃、消化道、蜡腺与螫针等结构
    问题:5 名称规范/职型一致:本条 castes 包含雄蜂,但雄蜂无螫针、也无蜡腺;在雄蜂视图下展示此句与“雄蜂无螫针”的多处表述直接矛盾。
    建议:改为“容纳蜜胃、消化道等结构;工蜂腹部还有蜡腺,雌性(工蜂、蜂王)腹末有螫针,雄蜂则没有”。
  - 断言:泌蜡与呼吸运动
    问题:[可选] 8 受众适配:“泌蜡”可加简释。
    建议:改为“分泌蜂蜡与呼吸运动”。

### organ:organ-sting
- **fact-check** → uncertain
  - 断言:由产卵器特化而来的防御器官;雄蜂无螫针
    问题:Worker bee 页面未提及产卵器来源和雄蜂无螫针;Britannica 不可达。倒钩与脱落致死已被支持
    依据:Worker bee: 'Bee stings against mammals and birds typically leave the stinger embedded in the victim...The bee will die after losing its stinger';Western honey bee(未引用):'Since they do not have ovipositors, they do not have stingers'
    建议:补引 src-wikipedia-western-honey-bee(同时覆盖产卵器来源与雄蜂无螫针)
- **compliance** → fail
  - 断言:工蜂螫刺哺乳动物后螫针常脱落导致其死亡
    问题:8 受众适配/3 安全暗示:“其”指代不清,可读作“导致哺乳动物(人)死亡”,对中小学观众有误导和恐吓风险。
    建议:改为“工蜂螫刺哺乳动物后,带倒钩的螫针常留在皮肤里而脱落,工蜂自己随后死亡”。
  - 断言:由产卵器特化而来的防御器官,带倒钩
    问题:[可选] 3 安全提示:涉及螫刺的条目可附一句安全提示。
    建议:在 summary 末尾补充“野外遇到蜂群请保持距离;被螫后尽快移除螫针,出现过敏反应应立即就医。”

### organ:organ-bombus-fur
- **fact-check** → uncertain
  - 断言:黑黄白的分带是警戒色;厚毛被帮助熊蜂在凉爽天气维持飞行所需的体温
    问题:Bombus terrestris 页面全文无 aposematic/insulation 内容;Britannica 不可达
    依据:未提及;Wikipedia 'Bumblebee'(未引用)支持:'The black-and-yellow coloration of bumblebees acts as an aposematic (warning) signal to predators' 与 'The thick pile ... acts as insulation to keep bumblebees warm in cold weather'
    建议:补引 Wikipedia 'Bumblebee'
- **refutation** → uncertain
  - 断言:functionNote: 保温、拟态警示与携粉
    问题:术语混用。黑黄白分带是警戒色(aposematism),'拟态'(mimicry)指模仿他种;熊蜂之间的相似属缪勒拟态,但 functionNote 里'拟态警示'四字把两个概念糊在一起。
    依据:Wikipedia《Bombus terrestris》/Britannica《Bumblebee》使用 aposematic coloration 描述;缪勒拟态需另行说明。
    建议:改为'保温、警戒色与携粉',如需提拟态则写'与其他熊蜂形成缪勒拟态环'。

### organ:organ-bombus-sting
- **fact-check** → uncertain
  - 断言:熊蜂螫针光滑无倒钩,可以重复螫刺而不致自身死亡;熊蜂性情温和,极少主动攻击
    问题:Bombus terrestris 页面全文无 sting/barb/aggressive 内容;Britannica 不可达
    依据:未提及;Wikipedia 'Bumblebee'(未引用)支持:'a bumblebee's stinger lacks barbs, so the bee can sting repeatedly without leaving the stinger in the wound' 与 'Bumblebee species are not normally aggressive, but may sting in defence of their nest, or if harmed'
    建议:补引 Wikipedia 'Bumblebee'
- **compliance** → fail
  - 断言:但熊蜂性情温和,极少主动攻击
    问题:3 安全与健康暗示:评价性判断可能让中小学观众认为可以接近或触碰野生熊蜂;熊蜂被捏握、巢穴受扰时会螫刺,且可重复螫刺,过敏者风险相同。
    建议:改为“熊蜂通常不主动攻击人,但被捏握或巢穴受扰时会螫刺。野外观察请保持距离,不要触碰;对蜂毒过敏者被螫后应立即就医。”

### organ:organ-osmia-scopa
- **fact-check** → uncertain
  - 断言:访花时把干燥花粉刷附其上
    问题:Scopa 页面未讨论花粉干湿状态;其余断言(腹面成排刚毛、切叶蜂科共同特征、与花粉筐是两条路线)均被支持
    依据:Scopa: 'the Megachilidae, lack modified leg hairs, but have an extensive scopa on the underside of the abdomen';干燥:未提及
    建议:补引 Bosch & Kemp 2001 或删去'干燥'

### organ:organ-osmia-horns
- **fact-check** → uncertain
  - 断言:推测与搬运和加工泥土有关
    问题:页面未提及角突功能推测
    依据:仅支持存在角突:'horn-like extensions originating from its lower face'
    建议:删去功能推测,或补引壁蜂形态功能文献(如 Rust 1974 等)

### organ:organ-osmia-mandible
- **fact-check** → uncertain
  - 断言:大颚用于衔泥筑巢和封闭巢室;口器吸取花蜜,与花粉一同调制成巢室内的花粉球
    问题:页面支持用泥封巢和放置花粉球,但未提及大颚,也未提及花蜜与花粉混合
    依据:'the female bee closes off the cell with mud';'disperse the pollen as a pollen ball. Eggs are placed on top of the pollen ball';大颚、花蜜:未提及
    建议:补引 Wikipedia 'Mason bee' 或 Bosch & Kemp 2001
- **compliance** → uncertain
  - 断言:(缺少 modelNote)
    问题:9 模型说明诚实性:本条锚点借用 proboscis,与切叶蜂、木蜂的大颚条目情形相同,但后两者都注明“当前模型未单独雕刻大颚”,本条没有任何模型说明;无法判断壁蜂模型是否真的雕刻了大颚。
    建议:若模型未单独雕刻大颚,补充 modelNote“当前模型未单独雕刻大颚,以口器锚点讲解”;若已雕刻,注明锚点为何借用口器。

### organ:organ-megachile-scopa
- **fact-check** → uncertain
  - 断言:访花时刷附干燥花粉
    问题:两个来源均未讨论花粉干燥状态;先吐蜜再抖花粉、供幼虫食用已被支持
    依据:Megachile rotundata: 'females first regurgitate the nectar they have provisioned into the cell and then transfer the pollen ... on top of the nectar';干燥:未提及
    建议:删去'干燥'或补引来源(同 organ-osmia-scopa)

### organ:organ-megachile-hair-bands
- **fact-check** → uncertain
  - 断言:腹部各背板后缘的白色细毛带,与深灰底色形成条带外观,是野外辨识切叶蜂属的常见线索
    问题:页面未提及毛带(band/stripe/fasciae),只说雌蜂全身白毛
    依据:'Females have white hairs all over their bodies, including on their scopae'
    建议:补引 Discover Life 或 BugGuide 的 Megachile 形态说明(腹部 tergal fasciae),否则改写为'腹部覆白色细毛'

### organ:organ-xylocopa-integument
- **fact-check** → uncertain
  - 断言:黑色甲壳表面的微结构对光产生干涉,呈现随角度变化的蓝紫金属光泽;这是结构色,不是色素;可能兼具体温调节意义
    问题:Xylocopa violacea 页面没有任何体色、结构色或体温调节内容
    依据:未提及
    建议:补引昆虫结构色文献(如 Seago et al. 2009)及形态描述来源;'体温调节意义'若无来源应删去
- **refutation** → uncertain
  - 断言:光滑坚硬的甲壳呈黑色并带蓝紫金属光泽——这种结构色来自甲壳表面的微结构,而非色素。
    问题:无来源的机理断言。X. violacea 的标志性蓝紫虹彩主要在翅膜(薄膜干涉),身体基本是黑色、仅有微弱光泽;所引 Wikipedia 页面完全没有讨论体表颜色成因。把'结构色/非色素'写成定论超出证据。
    依据:Wikipedia《Xylocopa violacea》对体色成因无任何描述(https://en.wikipedia.org/wiki/Xylocopa_violacea);多处科普来源描述为 'robust jet-black body' 与 'metallic violet-blue wings'(https://www.buzzaboutbees.net/violet-carpenter-bee.html)。
    建议:把结构色的表述限定在翅膜,身体改为'黑色,带微弱金属光泽';若保留结构色说法,加'一般认为'并补引昆虫结构色文献。
  - 断言:functionNote: 可能兼具体温调节意义
    问题:推测无出处。所引来源没有讨论金属光泽的热学功能。
    依据:Wikipedia《Xylocopa violacea》无相关内容(https://en.wikipedia.org/wiki/Xylocopa_violacea)。
    建议:删去,或改为'功能尚不清楚'。
- **compliance** → fail
  - 断言:这是结构色,不是色素。
    问题:2 确定性口径:成因机理写成定论(与 focus 腹部条目同一问题),所引来源未论证该机制。
    建议:改为“一般认为这是结构色——由甲壳表面微结构对光的干涉产生,而不是色素。”
  - 断言:对光产生干涉
    问题:[可选] 8 受众适配:“干涉”为物理术语。
    建议:改为“对光产生干涉(不同方向反射的光相互叠加)”。

### organ:organ-xylocopa-wing
- **fact-check** → uncertain
  - 断言:深色翅膜带蓝紫虹彩
    问题:本种页面无翅色描述
    依据:未提及
    建议:补引形态描述来源
  - 断言:木蜂属能以飞行肌高频震动进行振动授粉
    问题:Buzz pollination 页面以 Xylocopa frontalis 为例支持属级论断
    依据:'Xylocopa frontalis' 列于 'Examples of buzz pollinating bee species'
    建议:无需修改
- **compliance** → fail
  - 断言:木蜂属能以飞行肌高频震动进行振动授粉
    问题:2 确定性口径:同一物种的 focus 翅条目写“木蜂属被认为能进行振动授粉”,本条写成定论,两处口径不一致。
    建议:改为“木蜂属被认为能以飞行肌高频震动进行振动授粉”。
  - 断言:(缺少 modelNote)
    问题:[可选] 9 模型说明:未说明模型翅膜是否表现了烟紫色虹彩。
    建议:补充 modelNote,如“模型翅膜以半透明深色近似,未表现随角度变化的虹彩”。

### compare:row-body-length
- **fact-check** → uncertain
  - 断言:工蜂约 12–15 mm;蜂王约 18–20 mm;雄蜂约 15–17 mm
    问题:引用的 Honey bee 页面没有任何体长数字;Britannica 不可达。工蜂 12–15 mm 可由 Worker bee 页面(本条未引用)支持;蜂王与雄蜂数字目前无可达来源
    依据:Honey bee: 无体长数字;Worker bee(未引用)表格:'Body Length: 12–15 mm'
    建议:补引 src-wikipedia-worker-bee 覆盖工蜂;为蜂王 18–20 mm、雄蜂 15–17 mm 补引养蜂学教材(如 Winston 1987《The Biology of the Honey Bee》)或改用带来源的区间
- **refutation** → uncertain
  - 断言:worker: 约 12–15 mm
    问题:下限偏高。多数权威资料给工蜂体长 10–15 mm(Britannica 给约 12 mm 的典型值),12–15 mm 把范围收窄了。
    依据:Animal Diversity Web《Apis mellifera》: 'workers ... 10-15 mm long; queens 18-20 mm; drones 15-17 mm'(https://animaldiversity.org/accounts/Apis_mellifera/)。
    建议:改为'约 10–15 mm'(蜂王 18–20、雄蜂 15–17 可保留)。

### compare:row-corbicula
- **fact-check** → uncertain
  - 断言:蜂王:无;雄蜂:无
    问题:Pollen basket 页面只说'female of certain species',未区分蜂王与雄蜂
    依据:'part of the tibia on the hind legs of the female of certain species of bees';Honey bee(未引用):'Workers have morphological specializations, including the pollen basket (corbicula)'
    建议:补引 src-wikipedia-honey-bee

### compare:row-sting
- **refutation** → uncertain
  - 断言:queen: 有,无倒钩
    问题:过度简化。蜂王螫针并非无倒钩,而是倒钩更小、更少,因此可以拔出重复使用;'无倒钩'是熊蜂螫针的特征,套到蜂王身上不准确。
    依据:Honey Bee Suite: queen 'stinger has smaller, smoother barbs' allowing repeated stinging(https://www.honeybeesuite.com/nine-facts-about-bee-stingers/);Wikipedia《Western honey bee》: worker stingers are barbed 'unlike those of ... queen stingers'(仅说不同,未说无)。
    建议:改为'有,倒钩细小,可重复螫刺'。

### compare:row-eyes
- **fact-check** → uncertain
  - 断言:工蜂常规比例;蜂王相对较小;雄蜂显著增大,向头顶靠拢
    问题:唯一来源 Britannica 不可达;'蜂王复眼相对较小'尚无可达来源
    依据:来源不可达;Honey bee(未引用)可支持雄蜂:'Drones have large eyes used to locate queens during mating flights'
    建议:补引 src-wikipedia-honey-bee(雄蜂)与 src-snodgrass-anatomy(蜂王小眼数少于工蜂,属教科书内容)

### compare:row-cerana-corbicula
- **fact-check** → uncertain
  - 断言:蜂王:无;雄蜂:无
    问题:Apis cerana 页面只说工蜂后足有 pollen press,未提蜂王/雄蜂;Pollen basket 亦未区分
    依据:'Worker bees are characterized by a pollen press on the hind leg to transport pollen'
    建议:补引 src-wikipedia-honey-bee

### compare:row-cerana-sting
- **refutation** → uncertain
  - 断言:queen: 有,无倒钩
    问题:过度简化。蜂王螫针并非无倒钩,而是倒钩更小、更少,因此可以拔出重复使用;'无倒钩'是熊蜂螫针的特征,套到蜂王身上不准确。
    依据:Honey Bee Suite: queen 'stinger has smaller, smoother barbs' allowing repeated stinging(https://www.honeybeesuite.com/nine-facts-about-bee-stingers/);Wikipedia《Western honey bee》: worker stingers are barbed 'unlike those of ... queen stingers'(仅说不同,未说无)。
    建议:改为'有,倒钩细小,可重复螫刺'。

### compare:row-cerana-eyes
- **fact-check** → uncertain
  - 断言:蜂王:相对较小
    问题:两个来源均未提及蜂王复眼大小;雄蜂增大已被支持
    依据:Apis cerana: 'Drones ... defined by larger eyes';蜂王:未提及
    建议:补引 src-snodgrass-anatomy 或改为'与工蜂相近'

### compare:row-cerana-colony
- **refutation** → uncertain
  - 断言:一个成熟蜂群通常只有约 6000–7000 只工蜂
    问题:数字过窄且偏低。6000–7000 只是 Wikipedia 转引的单一数据,其他资料给出 6000–10000 只,中国饲养的中蜂强群可达一两万只;亚种与季节差异很大,写成'通常只有 6000–7000'以偏概全。
    依据:Wikipedia《Apis cerana》: 'around 6,000 to 7,000 workers'(https://en.wikipedia.org/wiki/Apis_cerana);Bees for Development / HoneyBee & Co.: 'Typical managed colonies of Apis cerana contain 6,000 to 10,000 workers'(https://resources.beesfordevelopment.org/rc/apis-cerana-group/ , https://honeybeeandco.uk/eastern-honeybee/)。
    建议:改为'通常数千至一万余只,明显小于西方蜜蜂群体',并注明随亚种与季节变化。

### species:apis-mellifera
- **fact-check** → uncertain
  - 断言:workerBodyLengthMm 12–15
    问题:三个引用来源中可达的两个 Wikipedia 页面都没有体长数字;Britannica 不可达
    依据:Worker bee(未引用)表格:'Body Length: 12–15 mm'
    建议:补引 src-wikipedia-worker-bee
  - 断言:原产欧洲、非洲与西亚
    问题:来源措辞为非洲/亚洲起源并自然扩散至非洲、中东与欧洲,可视为支持
    依据:Western honey bee: 'believed to have originated in Africa or Asia, and it spread naturally through Africa, the Middle East and Europe'
    建议:无需修改
- **refutation** → uncertain
  - 断言:worker: 约 12–15 mm
    问题:下限偏高。多数权威资料给工蜂体长 10–15 mm(Britannica 给约 12 mm 的典型值),12–15 mm 把范围收窄了。
    依据:Animal Diversity Web《Apis mellifera》: 'workers ... 10-15 mm long; queens 18-20 mm; drones 15-17 mm'(https://animaldiversity.org/accounts/Apis_mellifera/)。
    建议:改为'约 10–15 mm'(蜂王 18–20、雄蜂 15–17 可保留)。

### species:apis-cerana
- **fact-check** → uncertain
  - 断言:中国本土传统饲养的主要蜂种
    问题:Apis cerana 页面未提及传统养蜂;Britannica 不可达
    依据:未提及(Honey bee 页面有 'the traditional honey bee of southern and eastern Asia' 但未被本条引用)
    建议:补引 src-wikipedia-honey-bee
  - 断言:耐低温、善于利用零星蜜源
    问题:页面只说能在 12–36 °C 环境维持体温,未提零星蜜源
    依据:'A. cerana maintain body temperatures in a range of 33–35.5 °C even while ambient temperatures vary between 12 and 36 °C'
    建议:补引中国养蜂学文献或删去
  - 断言:腹部环纹更均匀清晰
    问题:无比较依据
    依据:'black in color, with four yellow abdominal stripes'
    建议:改为'腹部有四条黄色环纹'

### species:bombus-terrestris
- **fact-check** → uncertain
  - 断言:能进行振动授粉,番茄等温室作物高度依赖它
    问题:本条引用的 Bombus terrestris 页面只说它是温室授粉主力,全文不含 buzz;Britannica 不可达。Buzz pollination 页面可支持但未被本条引用
    依据:Bombus terrestris: 'one of the main species used in greenhouse pollination';Buzz pollination(未引用):'In greenhouses worldwide, up to 50 bumblebee colonies are used per hectare'
    建议:在 sourceIds 中补引 src-wikipedia-buzz-pollination
  - 断言:巢内为不规则蜡罐
    问题:来源只说巢多在地下鼠洞,巢结构描述为 comb-like,未说'不规则蜡罐'
    依据:'Nests are usually found underground, such as in abandoned rodent dens'
    建议:改为'巢内为不规则排列的蜡质育幼室和蜜罐'并补引 Wikipedia 'Bumblebee' Nests 段

### species:osmia-cornifrons
- **fact-check** → uncertain
  - 断言:workerBodyLengthMm 11–13
    问题:两个来源均无体长数字
    依据:Osmia cornifrons 页面只有卵长 'typically 1/10 the length of the female body'
    建议:补引带体长的来源(如 Penn State Extension 'Japanese Orchard Bee' 或 Bosch & Kemp 2001),核对 11–13 mm
- **refutation** → fail
  - 断言:workerBodyLengthMm: 11–13
    问题:数字与权威鉴定资料不符。USDA/APHIS Exotic Bee ID 给出雌蜂 8–12 mm、雄蜂 8–10 mm;11–13 mm 超出了雌蜂上限,且无来源(所引 Wikipedia 页面根本没有体长数据)。
    依据:Exotic Bee ID《Osmia cornifrons》: 'Female body length ranges from 8–12 mm ... male body length ranges from 8–10 mm'(https://idtools.org/exotic_bee/index.cfm?packageID=1185&entityID=9062);Wikipedia《Osmia cornifrons》未给体长。
    建议:改为 min 8 / max 12(雌蜂),并把来源换成 Exotic Bee ID。

### species:megachile-rotundata
- **fact-check** → uncertain
  - 断言:深灰体色配白色毛带
    问题:来源只说全身白毛,未提毛带
    依据:'Megachile rotundata bees are a dark grey color. Females have white hairs all over their bodies'
    建议:改为'深灰体色覆白色细毛'或补引形态来源

### species:xylocopa-violacea
- **fact-check** → uncertain
  - 断言:workerBodyLengthMm 20–23
    问题:两个来源均无体长数字
    依据:未提及
    建议:补引带体长的来源(如 Wikipedia 德文/意文版或 NatureSpot 物种页),核对 20–23 mm
  - 断言:黑色身体泛蓝紫金属光泽,翅呈烟紫色
    问题:来源无体色描述
    依据:未提及
    建议:补引形态描述来源
  - 断言:欧亚最大的蜂类之一
    问题:来源为'欧洲最大'
    依据:'one of the largest bees in Europe'
    建议:改为'欧洲最大的蜂类之一'
  - 断言:分布:欧洲向东横跨亚洲至中国中部,主要分布于北纬 30° 以北;夏末羽化越冬,春季活动;能进行振动授粉
    问题:均被支持
    依据:'extends from Europe eastward across Asia as far as central China, restricted to latitudes above 30 degrees';'The adults emerge in late summer then hibernate';Buzz pollination 列 Xylocopa frontalis
    建议:无需修改
- **refutation** → uncertain
  - 断言:紫木蜂是欧亚大陆最大的蜂类之一
    问题:范围扩大。来源只说它是'欧洲最大的蜂类之一';亚洲有体长 4 cm 级的华莱士巨蜂(Megachile pluto)及更大的热带木蜂,'欧亚最大之一'难以成立。
    依据:Wikipedia《Xylocopa violacea》: 'one of the largest bees in Europe'(https://en.wikipedia.org/wiki/Xylocopa_violacea)。
    建议:改为'欧洲最大的蜂类之一'。
  - 断言:workerBodyLengthMm: 20–23
    问题:上限偏低且无来源。所引 Wikipedia 页面无体长数据;其他资料给 20–28 mm、'可达 3 cm'或 20–22 mm,各来源不一致。
    依据:Wikipedia《Xylocopa violacea》无体长(https://en.wikipedia.org/wiki/Xylocopa_violacea);biocommunication.org 'A shiny giant' 与 pollinatorflowers.com 给 20–28 mm(https://biocommunication.org/en/insects360/amazing-pollinators/a-shiny-giant-the-violet-carpenter-bee/)。
    建议:改为约 20–28 mm,并补一个给出体长的来源。
- **compliance** → fail
  - 断言:能进行振动授粉
    问题:2 确定性口径:focus 翅条目写“被认为能”,species 与 organ 条目写成定论,同一物种三处口径不一致。
    建议:改为“被认为能进行振动授粉”。
  - 断言:主要分布于北纬 30° 以北
    问题:[可选] 6 数字口径:纯文本中“30°”在部分字体下不易辨识,且与前半句“至中国中部”并列略显重复。
    建议:改为“主要分布于北纬 30 度以北”。

## 通过条目(可选润色建议)

- focus:apis-mellifera-worker/whole:改为“……群体中的一种职型(caste,即按分工形成的不同类型个体)”。
- focus:apis-mellifera-worker/leg:改为“蜜蜂的花粉团位于后足,而不是腹部(壁蜂等则相反)”。
- focus:apis-cerana-worker/leg:改为“花粉筐是蜜蜂属的共同特征(熊蜂等也有),不是某一种蜜蜂独有。”
- focus:bombus-terrestris-worker/abdomen:改为“英文名 buff-tailed bumblebee(皮黄尾熊蜂)一般认为得名于蜂王的尾色”。;统一为“工蜂尾端近白色”。
- focus:megachile-rotundata-worker/leg:改为“人们提供带有成千上万个孔的人工巢板”。
- organ:organ-compound-eye:全站统一 latinName 口径,建议统一用英文解剖学通用名或统一用拉丁名,并在字段说明中注明。
- organ:organ-antenna:改为“是蜜蜂主要的化学感知器官”。
- organ:organ-thorax:改为“内部充满飞行肌;这些肌肉并不直接拉动翅,而是通过让胸壁变形来带动翅高频振动”。
- organ:organ-corbicula:改为“仅见于蜜蜂属、熊蜂属等少数蜂类”。
- organ:organ-foreleg-cleaner:改为“前足上有一个半圆形凹口,与旁边一根小刺(胫节距)合成一个夹子,蜜蜂把触角从中拉过就能刮掉花粉和尘粒”。;改为“strigilis”或全站统一该字段的语言口径。
- organ:organ-bombus-flight-muscle:改为“温室番茄授粉在很大程度上依赖这一能力”。;改为“蜜蜂属不具备此行为”。