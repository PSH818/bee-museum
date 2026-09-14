import type { HoneyStage } from "../schemas/content";

// M5 蜂蜜工坊 · 一滴花蜜的旅程(docs/m5-honey-workshop-plan.md 支柱 1)。
// 六站:采集 → 携带 → 交接 → 转化 → 浓缩 → 封盖。
// 口径约定:不写无来源的具体数字;各资料有出入的写进 boundary。
export const honeyStages: HoneyStage[] = [
  {
    id: "honey-stage-gather",
    reviewStatus: "ai-reviewed",
    index: "01",
    short: "采集",
    title: "采集 · 一切从花蜜开始",
    latin: "FORAGING · INTO THE FLOWER",
    summary:
      "外勤蜂把喙伸进花冠,吸取花蜜——蜂蜜最主要的原料。花蜜是花朵蜜腺分泌的含糖液体,主要成分是蔗糖、葡萄糖、果糖和水,含糖比例随花种差别很大。",
    detail:
      "一只外勤蜂一趟采集通常要连续拜访许多朵花,把蜜胃装满才回巢。花蜜位置有深有浅:油菜的花蜜几乎所有蜂都够得着,薰衣草则要看喙的长短——这正是花朵馆里“口器与花冠”故事的另一面。",
    boundary:
      "少数蜜种不以花蜜为原料:欧洲市场的“甘露蜜(森林蜜)”来自蚜虫等昆虫的含糖分泌物;本馆的旅程只讲花蜜这条主线。",
    related: [{ kind: "organ", id: "organ-proboscis", label: "喙 · 吸取花蜜的工具" }],
    sourceIds: [
      "src-wikipedia-honey",
      "src-britannica-honey",
      "src-honigmacher-raps",
      "src-balfour-2013-lavender",
    ],
  },
  {
    id: "honey-stage-carry",
    reviewStatus: "ai-reviewed",
    index: "02",
    short: "携带",
    title: "携带 · 蜜胃不是胃",
    latin: "HONEY STOMACH · THE CROP",
    summary:
      "吸进来的花蜜不进消化道,而是存进蜜胃——食道末端一个能胀大的储袋,也叫蜜囊。蜜胃与消化道之间有一道阀门(前胃)把关:大部分花蜜留在蜜胃里带回巢,只有蜂自己取食的一小部分、和被滤出的花粉,经阀门进入消化道。",
    detail:
      "归巢路上,加工已经开始:蜜胃里的花蜜,混入了蜂头部腺体分泌的酶。",
    related: [{ kind: "organ", id: "organ-abdomen", label: "腹部 · 蜜胃藏在这里" }],
    sourceIds: ["src-snodgrass-anatomy", "src-wikipedia-honey"],
  },
  {
    id: "honey-stage-handoff",
    reviewStatus: "ai-reviewed",
    index: "03",
    short: "交接",
    title: "交接 · 口对口的传递",
    latin: "TROPHALLAXIS · THE HANDOFF",
    summary:
      "回巢后,外勤蜂把蜜胃里的花蜜口对口吐给内勤蜂,这种传递叫交哺。花蜜就此换手:外勤蜂转身再去采集,内勤蜂接着加工。",
    detail:
      "内勤蜂会反复把蜜滴吐出又吸回,在口器上摊成薄膜——既继续混入酶,也让水分开始蒸发。一滴花蜜从进巢到入房,常常经过不止一只蜂的口。",
    related: [{ kind: "species", id: "apis-mellifera", label: "西方蜜蜂 · 分工采酿" }],
    sourceIds: ["src-wikipedia-trophallaxis", "src-wikipedia-honey"],
  },
  {
    id: "honey-stage-transform",
    reviewStatus: "ai-reviewed",
    index: "04",
    short: "转化",
    title: "转化 · 酶改写糖",
    latin: "ENZYMES · SUGARS REWRITTEN",
    summary:
      "腺体分泌的转化酶把花蜜里的蔗糖水解成葡萄糖和果糖——这是蜂蜜以单糖为主的原因;另一种酶(葡萄糖氧化酶)把部分葡萄糖转成葡萄糖酸,并产生微量过氧化氢。",
    detail:
      "偏酸只是第一步;等下一站把水分收干、糖浓到能把微生物体内的水“吸”出来,微生物才真正难以生长繁殖。成熟封盖的蜜能在巢房里长期储存而不腐败,靠的是这套化学,不是防腐剂。不过“难以繁殖”不等于“不存在”:蜂蜜里可能有休眠的肉毒杆菌芽孢,所以一岁以下的婴儿不能喂食蜂蜜。",
    related: [],
    sourceIds: ["src-wikipedia-honey"],
  },
  {
    id: "honey-stage-condense",
    reviewStatus: "ai-reviewed",
    index: "05",
    short: "浓缩",
    title: "浓缩 · 扇出来的稠度",
    latin: "EVAPORATION · FANNING",
    summary:
      "刚采回的花蜜通常一半以上是水,直接储存会发酵。工蜂把蜜液薄薄摊进巢房,再成群扇动翅膀通风,让水分蒸发。",
    detail:
      "水分收到大约两成以下——更严的口径要到 18% 以下——花蜜才算酿成了蜂蜜。巢内通风是集体劳动:一部分工蜂专职在巢脾上扇翅,让气流掠过一格格摊着蜜的巢房。",
    boundary:
      "“酿成”的含水量各资料口径不一:维基百科给约 15.5%–18%,不少法规与教材以 20% 为上限;花蜜的初始含水量随花种与天气差别更大。",
    related: [{ kind: "organ", id: "organ-forewing", label: "前翅 · 也是通风工具" }],
    sourceIds: ["src-wikipedia-honey", "src-britannica-honey"],
  },
  {
    id: "honey-stage-cap",
    reviewStatus: "ai-reviewed",
    index: "06",
    short: "封盖",
    title: "封盖 · 存粮入库",
    latin: "CAPPING · SEALED IN WAX",
    summary:
      "蜜酿熟后,工蜂用腹部蜡腺分泌的蜂蜡把巢房口封平。封盖是“这格蜜已酿成”的标志,也是养蜂人判断取蜜时机的依据。",
    detail:
      "封盖之下的蜂蜜是蜂群的存粮:蜜蜂属靠它撑过缺花的季节——温带是冬天,热带则是断蜜的旱季或雨季。这也是蜜蜂大量储蜜、而多数蜂不储蜜的原因——“谁在酿蜜”一节会展开。",
    related: [{ kind: "cycle", id: "cycle-apis-mellifera-worker", label: "工蜂的一生 · 酿蜜与筑巢" }],
    sourceIds: ["src-wikipedia-honey", "src-wikipedia-beeswax"],
  },
];
