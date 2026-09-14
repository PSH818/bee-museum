import type { FlowerSpecies } from "../schemas/content";

export const brassicaNapus: FlowerSpecies = {
  id: "flower-brassica-napus",
  reviewStatus: "ai-reviewed",
  name: "油菜",
  scientificName: "Brassica napus",
  englishName: "rapeseed / canola",
  family: "十字花科 Brassicaceae",
  form: "radial",
  bloom: {
    "region-china-east": { from: 3, to: 4 },
    "region-central-europe": { from: 4, to: 6 },
  },
  nectar: "重要大宗蜜源,常被列为蜜蜂最重要的蜜粉源作物之一;单花蜜白色至乳黄、味微辛,极易结晶,结晶细腻呈脂状。",
  pollen: "花粉丰富,色黄。",
  summary:
    "早春最先大面积开放的蜜源之一。四片鲜黄花瓣排成十字,总状花序自下而上依次开放,一株通常能开三到五周。它没有深花冠管,花蜜位置浅,几乎所有蜂都够得着。中文里叫“油菜”的植物不止一种:本馆说的是花田里大面积种植的甘蓝型油菜,菜市场的小油菜是它的近亲,不是同一种。",
  entries: [
    {
      id: "corolla",
      reviewStatus: "ai-reviewed",
      index: "01",
      short: "花冠",
      title: "十字形的四瓣",
      latin: "corolla · four petals",
      description:
        "花瓣四枚,鲜黄色,排成典型的十字形,与四枚萼片交错;花朵直径约 10–17 毫米(不同资料略有差异)。没有深的花冠管,花蜜位置浅——这是一朵向所有蜂开放的花,访花者种类很广。",
      fact: "油菜是自交亲和的植物,自己也能结实;但中国小农油菜田的研究显示,有蜂类传粉时结实率与产量会明显提高。",
      sourceIds: ["src-wikipedia-rapeseed", "src-frps-brassica-napus", "src-dewiki-raps", "src-zou-2017-osr-china"],
    },
    {
      id: "stamen",
      reviewStatus: "ai-reviewed",
      index: "02",
      short: "花蕊",
      title: "花粉与花蜜都慷慨",
      latin: "stamens · nectaries",
      description:
        "雄蕊围着花柱排成一圈,花粉量大、呈饱黄色。泌蜜非常丰富;据德文维基百科,一朵花一昼夜分泌的花蜜含糖约在零点几到两毫克之间。",
      fact: "英国的田间研究发现,一片油菜田里大部分花蜜其实并没有被昆虫采走。",
      sourceIds: ["src-honigmacher-raps", "src-dewiki-raps", "src-harris-2024-osr-nectar"],
    },
    {
      id: "inflorescence",
      reviewStatus: "ai-reviewed",
      index: "03",
      short: "花序",
      title: "从下往上开的总状花序",
      latin: "raceme · indeterminate",
      description:
        "花朵在花枝上排成总状花序,从下往上依次开放,一株通常能开三到五周。冬油菜秋播、早春开花:中国东部 3–4 月,中欧 4 月下半到 6 月初。",
      fact: "单朵花通常只开一两天,整片田却能黄上几个星期,靠的就是这种依次开放。",
      sourceIds: ["src-wikipedia-rapeseed", "src-frps-brassica-napus", "src-honigmacher-raps", "src-dewiki-raps"],
    },
  ],
  sourceIds: ["src-wikipedia-rapeseed", "src-frps-brassica-napus", "src-honigmacher-raps", "src-dewiki-raps"],
};
