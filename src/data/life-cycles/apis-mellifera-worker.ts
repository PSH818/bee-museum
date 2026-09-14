import type { LifeCycle } from "../schemas/content";

// 西方蜜蜂工蜂的一生(产品方案 §4.5 社会性蜜蜂时间线)
// 时间轴单位:天;0 = 产卵。出房约第 21 天,之后按年龄分工,夏季工蜂约再活 2–6 周。
// 天数以 Bee brood / Worker bee 词条给出的常见值为准;不同资料略有出入,文中已注明。
export const apisMelliferaWorkerCycle: LifeCycle = {
  id: "cycle-apis-mellifera-worker",
  reviewStatus: "ai-reviewed",
  kind: "social",
  speciesId: "apis-mellifera",
  caste: "worker",
  title: "一只工蜂的一生",
  subtitle: "西方蜜蜂 · 工蜂 · 从卵到外勤",
  unit: "day",
  total: { from: 0, to: 63 },
  intro:
    "约 21 天从卵到成蜂,之后再活几周。工蜂的一生按年龄排班:先在巢内清洁、哺育、筑巢、守卫,最后飞出去采集。拖动时间轴,看看每一天发生了什么。",
  stages: [
    {
      id: "stage-mellifera-egg",
      reviewStatus: "ai-reviewed",
      name: "卵",
      short: "卵",
      phase: "egg",
      span: { from: 0, to: 3 },
      spanText: "第 0–3 天",
      summary: "蜂王把一枚受精卵产在巢房底部;约 3 天后孵化。",
      detail:
        "卵期约 3 天。工蜂、蜂王和雄蜂的卵期基本相同,差别从孵化后的喂养开始。雄蜂由未受精卵发育而来,产在更大的雄蜂房里。",
      related: [{ kind: "species", id: "apis-mellifera", label: "西方蜜蜂物种卡" }],
      sourceIds: ["src-wikipedia-bee-brood", "src-wikipedia-drone-bee"],
    },
    {
      id: "stage-mellifera-larva",
      reviewStatus: "ai-reviewed",
      name: "幼虫",
      short: "幼虫",
      phase: "larva",
      span: { from: 3, to: 9 },
      spanText: "第 3–9 天",
      summary:
        "孵化出的幼虫没有足也没有眼,由哺育蜂喂养:前三天吃蜂王浆,之后改吃花粉和花蜜调成的“蜂粮”。约第 9 天,巢房被封上蜡盖。",
      detail:
        "幼虫期约 6 天,身体迅速长大。是否一直吃蜂王浆,是这枚受精卵长成工蜂还是蜂王的关键差别之一:工蜂幼虫三天后换成蜂粮,蜂王幼虫则始终吃蜂王浆。",
      related: [],
      sourceIds: ["src-wikipedia-western-honey-bee", "src-wikipedia-bee-brood"],
    },
    {
      id: "stage-mellifera-pupa",
      reviewStatus: "ai-reviewed",
      name: "封盖与化蛹",
      short: "蛹",
      phase: "pupa",
      span: { from: 9, to: 21 },
      spanText: "第 9–21 天",
      summary:
        "封盖之后,幼虫在巢房里吐丝作茧、化为蛹,身体在蛹壳内重组成成虫的模样。约第 21 天,成蜂咬破蜡盖和茧,爬出巢房。",
      detail:
        "从封盖到出房约 12 天(其中蛹期约 10 天),是整个发育中最长的一段。三种职型走着不同的时间表:蜂王约 16 天出房,工蜂约 21 天,雄蜂约 24 天。场景中巢房蜡盖做了半透明剖视处理,真实的封盖巢房是看不到里面的。",
      related: [
        { kind: "compare", id: "apis-mellifera", label: "三职型比较台" },
        { kind: "focus", id: "wing", label: "成蜂的翅" },
      ],
      sourceIds: ["src-wikipedia-bee-brood", "src-wikipedia-worker-bee"],
    },
    {
      id: "stage-mellifera-cleaner",
      reviewStatus: "ai-reviewed",
      name: "清洁巢房",
      short: "清洁",
      phase: "adult",
      span: { from: 21, to: 23 },
      spanText: "出房后第 1–2 天(自产卵起第 21–22 天)",
      summary: "刚出房的工蜂最先做的是打扫:把用过的巢房清理干净,好让蜂王再次在里面产卵。",
      detail:
        "工蜂一生的工作大致按年龄排班:先做巢内的活,再做巢外的活。不同资料给出的分段天数略有出入,这里按常见的分段标注,实际会随蜂群需要调整。",
      related: [{ kind: "species", id: "apis-mellifera", label: "西方蜜蜂物种卡" }],
      sourceIds: ["src-wikipedia-worker-bee", "src-wikipedia-western-honey-bee"],
    },
    {
      id: "stage-mellifera-nurse",
      reviewStatus: "ai-reviewed",
      name: "哺育幼虫",
      short: "哺育",
      phase: "adult",
      span: { from: 23, to: 33 },
      spanText: "出房后第 3–12 天(自产卵起第 23–32 天)",
      summary:
        "哺育蜂用腺体分泌的乳状食物喂养工蜂幼虫(常称“工蜂浆”,与蜂王浆来自同一类腺体);其中一部分(约出房后第 7–11 天)也会给蜂王喂食、梳理体表。",
      detail:
        "哺育蜂喂养幼虫约 6 天;幼虫自产卵起约第 9 天被封在巢房里,随后化蛹。",
      related: [{ kind: "organ", id: "organ-proboscis", label: "口器" }],
      sourceIds: ["src-wikipedia-worker-bee", "src-wikipedia-western-honey-bee", "src-wikipedia-bee-brood"],
    },
    {
      id: "stage-mellifera-builder",
      reviewStatus: "ai-reviewed",
      name: "筑巢与储存",
      short: "筑巢",
      phase: "adult",
      span: { from: 33, to: 38 },
      spanText: "出房后第 13–17 天(自产卵起第 33–37 天)",
      summary:
        "腹部的蜡腺开始分泌蜡片,工蜂用它筑造和修补巢房,并把外勤蜂带回的花蜜和花粉接手储存。",
      detail:
        "花蜜在巢内经工蜂反复传递、加入酶并蒸发水分,最终酿成蜂蜜。不同资料对这一阶段的分段天数略有出入。场景中新造的巢房以浅色区分。",
      related: [{ kind: "focus", id: "abdomen", label: "腹部" }],
      sourceIds: ["src-wikipedia-worker-bee", "src-wikipedia-western-honey-bee"],
    },
    {
      id: "stage-mellifera-guard",
      reviewStatus: "ai-reviewed",
      name: "守卫巢门",
      short: "守卫",
      phase: "adult",
      span: { from: 38, to: 41 },
      spanText: "出房后第 18–20 天(自产卵起第 38–40 天)",
      summary: "出房两三周后,一部分工蜂在巢门口值守,检查进出者、抵御入侵。",
      detail: "一般认为并非每只工蜂都会经历守卫阶段;分工会随蜂群的需要调整,有的工蜂会提前或推后转为外勤。",
      related: [{ kind: "organ", id: "organ-sting", label: "螫针" }],
      sourceIds: ["src-wikipedia-worker-bee"],
    },
    {
      id: "stage-mellifera-forager",
      reviewStatus: "ai-reviewed",
      name: "外勤采集",
      short: "采集",
      phase: "adult",
      span: { from: 41, to: 63 },
      spanText: "出房后第 21 天起(自产卵起第 41 天起)",
      summary:
        "此后工蜂离开巢内工作,成为外勤蜂:可飞到约 3 公里外(据记载有时更远)采集花蜜、花粉、蜂胶和水,直到生命结束。",
      detail:
        "夏季工蜂从出房算起通常只活几周(常见文献约 2–6 周,外勤只是其中最后一段);秋天出生的越冬蜂在巢内结团过冬,可活数月(不同资料约 20 周或更长)。",
      related: [
        { kind: "organ", id: "organ-corbicula", label: "花粉筐" },
        { kind: "focus", id: "leg", label: "六足" },
      ],
      sourceIds: ["src-wikipedia-worker-bee", "src-wikipedia-western-honey-bee"],
    },
  ],
  branches: [
    {
      id: "branch-mellifera-queen",
      reviewStatus: "ai-reviewed",
      title: "同一枚受精卵,也可能长成蜂王",
      text:
        "被选作蜂王培育的幼虫在特制的、形似花生的王台里发育,整个幼虫期只吃蜂王浆,约 16 天出房。出房后约第 6–10 天进行婚飞交配,回巢后 2–3 天开始产卵;春季高峰期一只优良蜂王每天可产约 1500 枚卵。蜂王可活数年(常见文献约 2–5 年,亦有更长的记录)。",
      sourceIds: ["src-wikipedia-queen-bee", "src-wikipedia-western-honey-bee", "src-wikipedia-bee-brood"],
    },
    {
      id: "branch-mellifera-drone",
      reviewStatus: "ai-reviewed",
      title: "雄蜂:另一张时间表",
      text:
        "雄蜂由未受精卵发育而来,巢房比工蜂房大,约 24 天出房。它不采集、不筑巢,任务是与其他蜂群的蜂王交配——交配成功者随即死亡。温带地区,雄蜂在入冬前会被工蜂逐出巢外。",
      sourceIds: ["src-wikipedia-drone-bee", "src-wikipedia-bee-brood", "src-wikipedia-western-honey-bee"],
    },
    {
      id: "branch-mellifera-winter",
      reviewStatus: "ai-reviewed",
      title: "夏蜂与冬蜂",
      text:
        "春夏出生的工蜂劳作强度大,只活几周;秋季出生的工蜂在巢内结团越冬,可活数月。冬季蜂群不育幼或很少育幼,靠储存的蜂蜜和结团产生的热量度过寒冷。",
      sourceIds: ["src-wikipedia-western-honey-bee", "src-wikipedia-worker-bee"],
    },
  ],
  sourceIds: ["src-wikipedia-bee-brood", "src-wikipedia-worker-bee", "src-wikipedia-western-honey-bee"],
};
