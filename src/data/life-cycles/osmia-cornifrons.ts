import type { LifeCycle } from "../schemas/content";

// 角额壁蜂的一年(产品方案 §4.5 独居蜂时间线)
// 时间轴单位:月;0 = 4 月(成蜂出巢),12 = 次年 4 月。一年一代。
// 月份为大致区间:出巢时间随地区与当年气温变化。
export const osmiaCornifronsCycle: LifeCycle = {
  id: "cycle-osmia-cornifrons",
  reviewStatus: "ai-reviewed",
  kind: "solitary",
  speciesId: "osmia-cornifrons",
  title: "一根巢管里的一年",
  subtitle: "角额壁蜂 · 雌蜂 · 从春天到下一个春天",
  unit: "month",
  startMonth: 4,
  total: { from: 0, to: 12 },
  intro:
    "没有蜂群、没有分工:一只雌蜂独自筑巢、储粉、产卵、封巢,后代在巢管里吃、长、结茧、越冬,直到下一个春天。一年一代。",
  stages: [
    {
      id: "stage-osmia-emerge",
      reviewStatus: "ai-reviewed",
      name: "春天出巢",
      short: "出巢",
      phase: "emerge",
      span: { from: 0, to: 0.3 },
      spanText: "4 月前后",
      summary:
        "越冬的成蜂破茧而出,从巢管里钻出来。雄蜂先出,在巢口附近徘徊;雌蜂晚几天出来(不同资料从两三天到约一周),随即交配。",
      detail:
        "在原产地东亚(日本、朝鲜半岛、中国等)与引入地北美,出巢时间大致在 4 月,恰在苹果开花之前——这是它被用来给苹果园授粉的主要原因之一。美国的飞行记录从 3 月到 6 月都有,以 4 月最多。",
      related: [
        { kind: "species", id: "osmia-cornifrons", label: "角额壁蜂物种卡" },
        { kind: "organ", id: "organ-osmia-horns", label: "脸上的角" },
      ],
      sourceIds: ["src-wikipedia-osmia-cornifrons", "src-wikipedia-mason-bee", "src-exotic-bee-id"],
    },
    {
      id: "stage-osmia-nest",
      reviewStatus: "ai-reviewed",
      name: "筑巢与储粉",
      short: "筑巢",
      phase: "nest",
      span: { from: 0.3, to: 1 },
      spanText: "4–5 月",
      summary:
        "雌蜂独自选定一根芦苇、竹管或现成的孔洞,一趟趟把花粉运回巢管堆成花粉团,在花粉团上产下一枚卵,再用泥把这一间封起来——泥隔同时是下一间的后壁。",
      detail:
        "如此一间接一间,直到把巢管填满。一只雌蜂一生最多可产约 30 枚卵;采集半径可达约 130 米。花粉不是装在后足上,而是刷在腹面的毛里带回来的。",
      related: [
        { kind: "organ", id: "organ-osmia-scopa", label: "腹面集粉毛" },
        { kind: "organ", id: "organ-osmia-mandible", label: "大颚" },
      ],
      sourceIds: ["src-wikipedia-osmia-cornifrons", "src-wikipedia-mason-bee", "src-exotic-bee-id"],
    },
    {
      id: "stage-osmia-egg",
      reviewStatus: "ai-reviewed",
      name: "卵",
      short: "卵",
      phase: "egg",
      span: { from: 1, to: 1.4 },
      spanText: "5 月",
      summary: "卵产在花粉团上。孵化后,幼虫就趴在这团食物上开吃。",
      detail:
        "独居蜂的幼虫没有哺育蜂照料,雌蜂留下的这一团花粉和花蜜就是它从孵化到结茧的全部食物。",
      related: [],
      sourceIds: ["src-wikipedia-osmia-cornifrons", "src-wikipedia-mason-bee"],
    },
    {
      id: "stage-osmia-larva",
      reviewStatus: "ai-reviewed",
      name: "幼虫取食",
      short: "幼虫",
      phase: "larva",
      span: { from: 1.4, to: 2.8 },
      spanText: "5–6 月",
      summary: "幼虫在几周内吃完整团花粉,身体迅速长大。",
      detail: "巢管里的每一间都是一间独立的育儿室:泥隔把它们彼此隔开,幼虫之间互不接触。",
      related: [],
      sourceIds: ["src-wikipedia-mason-bee"],
    },
    {
      id: "stage-osmia-cocoon",
      reviewStatus: "ai-reviewed",
      name: "结茧与化蛹",
      short: "结茧",
      phase: "cocoon",
      span: { from: 2.8, to: 5.5 },
      spanText: "6–9 月",
      summary: "吃完花粉团的幼虫吐丝作茧,在茧里化蛹。夏天里,蛹在茧内逐渐变成成虫的模样。",
      detail: "据记载,成虫在秋季或冬季就已在茧内发育完成,但并不出来。场景中的茧做了半透明剖视处理,真实的茧是不透明的。",
      related: [],
      sourceIds: ["src-wikipedia-mason-bee", "src-wikipedia-osmia-cornifrons"],
    },
    {
      id: "stage-osmia-overwinter",
      reviewStatus: "ai-reviewed",
      name: "茧内越冬",
      short: "越冬",
      phase: "overwinter",
      span: { from: 5.5, to: 11.5 },
      spanText: "10 月至次年 3 月",
      summary: "已经成形的成蜂待在有保温作用的茧里度过整个冬天,直到来年春天气温回升。",
      detail:
        "这一点与蜜蜂截然不同:蜜蜂以整群结团、靠储蜜取暖越冬;角额壁蜂则是一只一只地在茧里休眠。",
      related: [{ kind: "cycle", id: "cycle-apis-mellifera-worker", label: "对比:蜜蜂工蜂的一生" }],
      sourceIds: ["src-wikipedia-mason-bee", "src-wikipedia-western-honey-bee"],
    },
    {
      id: "stage-osmia-next-spring",
      reviewStatus: "ai-reviewed",
      name: "又一个春天",
      short: "出巢",
      phase: "emerge",
      span: { from: 11.5, to: 12 },
      spanText: "次年 4 月",
      summary: "新一代成蜂咬破茧钻出巢管,雄蜂先行。一年一代,循环从头开始。",
      detail: "从产卵到出巢,几乎整整一年;其中成蜂在巢外活动的时间只有短短几周。",
      related: [{ kind: "species", id: "osmia-cornifrons", label: "角额壁蜂物种卡" }],
      sourceIds: ["src-wikipedia-mason-bee", "src-wikipedia-osmia-cornifrons"],
    },
  ],
  branches: [
    {
      id: "branch-osmia-solitary",
      reviewStatus: "ai-reviewed",
      title: "没有蜂王,也没有工蜂",
      text:
        "每一只雌蜂都能生育,各自筑巢、各自为后代备好食物,互不合作。所谓“独居蜂”,指的正是这一点。它们也不会像蜜蜂那样成群护巢,被打扰时通常只是飞走;但雌蜂仍有螫针,用手抓捏仍可能被刺——观察时请不要触碰,更不要把手指伸进巢管。",
      sourceIds: ["src-wikipedia-mason-bee"],
    },
  ],
  sourceIds: ["src-wikipedia-mason-bee", "src-wikipedia-osmia-cornifrons", "src-exotic-bee-id"],
};
