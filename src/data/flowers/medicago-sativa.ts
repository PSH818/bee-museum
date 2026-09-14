import type { FlowerSpecies } from "../schemas/content";

export const medicagoSativa: FlowerSpecies = {
  id: "flower-medicago-sativa",
  reviewStatus: "ai-reviewed",
  name: "紫花苜蓿",
  scientificName: "Medicago sativa",
  englishName: "alfalfa / lucerne",
  family: "豆科 Fabaceae",
  form: "papilionaceous",
  bloom: {
    "region-china-east": { from: 5, to: 7 },
    "region-central-europe": { from: 6, to: 7 },
    "region-north-america-east": { from: 6, to: 9 },
  },
  nectar: "重要蜜源:泌蜜量大,苜蓿蜜白色至特浅琥珀色、味淡雅;在美国西部是最重要的蜜源植物之一。",
  pollen: "对蜜蜂而言是劣质花粉源,通常只在没有别的选择时才采。",
  summary:
    "紫色的蝶形小花藏着一个“机关”:龙骨瓣绷着雌雄蕊柱,蜂一压就弹开,啪地打在蜂头下方——花粉就这样送出去。蜜蜂多从花侧吸蜜避开这一击,所以给苜蓿留种,常要靠切叶蜂这类不躲机关的蜂。",
  entries: [
    {
      id: "corolla",
      reviewStatus: "ai-reviewed",
      index: "01",
      short: "花冠",
      title: "会弹开的花",
      latin: "tripping mechanism",
      description:
        "蝶形花,花冠多为紫色,也有蓝、黄、乳白。龙骨瓣在张力下包裹着雌雄蕊柱;蜂压下龙骨瓣时,柱体弹出撞向旗瓣,这一动作叫“弹花”(tripping)。",
      fact: "没被弹开的花几乎不结籽;即使自行弹开(没有蜂经手),能结籽的也不到 1%——苜蓿留种必须有传粉者。",
      sourceIds: ["src-wikipedia-alfalfa", "src-foc-medicago", "src-mcgregor-1976-alfalfa"],
    },
    {
      id: "stamen",
      reviewStatus: "ai-reviewed",
      index: "02",
      short: "花蕊",
      title: "蜜蜂学会了绕开机关",
      latin: "nectar · pollen",
      description:
        "西方蜜蜂会从花的侧面吸蜜,避免被弹起的柱体打到头——它拿走了花蜜,却几乎不带走花粉、不传粉。苜蓿切叶蜂不躲这一击,逐蜂授粉效率远高于蜜蜂,因此被大量用于苜蓿种子生产。",
      fact: "对蜜蜂来说,苜蓿是很好的蜜源,却是很差的花粉源。",
      sourceIds: ["src-wikipedia-alfalfa", "src-wikipedia-monofloral-honey", "src-mcgregor-1976-alfalfa"],
    },
    {
      id: "inflorescence",
      reviewStatus: "ai-reviewed",
      index: "03",
      short: "花序",
      title: "夏天的紫色花序",
      latin: "raceme · 5–30 flowers",
      description:
        "腋生总状或头状花序,5–30 朵小花,长 1–2.5 厘米。中国各地大致 5–7 月开花,欧洲西部与中部约 6–7 月(据英国资料),美国中西部 6–9 月。",
      fact: "紫花苜蓿原产亚洲北部与西南部(可能还包括南欧),如今遍布全球温带。",
      sourceIds: ["src-foc-medicago", "src-pfaf-medicago", "src-mnwild-alfalfa"],
    },
  ],
  sourceIds: ["src-wikipedia-alfalfa", "src-foc-medicago", "src-pfaf-medicago", "src-mnwild-alfalfa", "src-mcgregor-1976-alfalfa", "src-wikipedia-monofloral-honey"],
};
