import type { HoneyNote } from "../schemas/content";

// M5 蜂蜜工坊 · 两张纠偏卡(docs/m5-honey-workshop-plan.md 支柱 3、4)。
// 边界:不做任何蜂蜜/蜂王浆对人的营养或保健表述。
export const honeyNotes: HoneyNote[] = [
  {
    id: "honey-note-royal-jelly",
    reviewStatus: "ai-reviewed",
    title: "蜂王浆是什么,又不是什么",
    intro:
      "蜂王浆常和蜂蜜一起被售卖,也常被混在一起理解。它们其实是来源完全不同的两种东西。",
    points: [
      {
        label: "是什么",
        text: "哺育蜂头部腺体分泌的乳状食物。所有蜜蜂幼虫约头三天都吃它;被选作蜂王的幼虫整个幼虫期、以及成年蜂王的一生,都以它为食。",
      },
      {
        label: "不是什么",
        text: "它不是蜂蜜,也不是蜂蜜的原料或“浓缩版”。蜂蜜来自花蜜的采集与加工,蜂王浆来自蜂自身的腺体分泌——一个是蜂群的存粮,一个是育儿的食物。",
      },
      {
        label: "本馆的边界",
        text: "蜂王浆与人的健康有什么关系,不属于本馆的展出范围,本馆不做介绍、也不做评价;这里只讲它在蜂群里的角色。",
      },
    ],
    related: [
      { kind: "cycle", id: "cycle-apis-mellifera-worker", label: "工蜂的一生 · 哺育阶段" },
    ],
    sourceIds: ["src-wikipedia-royal-jelly", "src-wikipedia-queen-bee", "src-wikipedia-bee-brood"],
  },
  {
    id: "honey-note-who-makes-honey",
    reviewStatus: "ai-reviewed",
    title: "谁在酿蜜",
    intro:
      "“蜂蜜”几乎成了所有蜂的代名词,但会大量酿蜜储存的只是少数类群。本馆的六种蜂正好是一组对照。",
    points: [
      {
        label: "蜜蜂属(西方蜜蜂、东方蜜蜂)",
        text: "采集、酿造、封盖、储存,靠储蜜撑过缺花的季节——温带是冬天,热带是断蜜的旱雨季。本馆讲的酿蜜流程,就是它们的流程。",
      },
      {
        label: "熊蜂",
        text: "也会把花蜜存进巢里的蜡罐(用蜂蜡捏成的小罐),但存量小,通常只够蜂群吃上几天。在温带,熊蜂蜂群通常一年一代,秋末解散、只有新蜂王越冬,因此不需要大宗过冬存粮;在冬季温和的地区,也有欧洲熊蜂蜂群冬季仍在活动的记录。",
      },
      {
        label: "独居蜂(壁蜂、切叶蜂、木蜂)",
        text: "不酿蜜。雌蜂把花粉和花蜜揉成一团“蜂粮”,放进巢室、产一枚卵、封上巢室——幼虫吃着这份口粮长大,全程没有“蜂蜜”。",
      },
    ],
    related: [
      { kind: "species", id: "apis-mellifera", label: "西方蜜蜂" },
      { kind: "species", id: "bombus-terrestris", label: "欧洲熊蜂" },
      { kind: "species", id: "osmia-cornifrons", label: "角额壁蜂" },
    ],
    sourceIds: [
      "src-wikipedia-honey",
      "src-wikipedia-bumblebee",
      "src-wikipedia-bombus-terrestris",
      "src-plos-2010-winter-bumblebees",
      "src-wikipedia-mason-bee",
      "src-wikipedia-megachile",
    ],
  },
];
