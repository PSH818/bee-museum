import type { FlowerSpecies } from "../schemas/content";

export const lavandulaAngustifolia: FlowerSpecies = {
  id: "flower-lavandula-angustifolia",
  reviewStatus: "ai-reviewed",
  name: "薰衣草",
  scientificName: "Lavandula angustifolia",
  englishName: "English lavender",
  family: "唇形科 Lamiaceae",
  form: "spike",
  bloom: {
    "region-central-europe": { from: 6, to: 8 },
    "region-north-america-east": { from: 6, to: 8 },
  },
  nectar: "重要蜜源:花蜜丰富,“薰衣草蜜”主产于地中海周边,色淡黄。",
  pollen: "花粉也较丰富(据园艺植物数据库)。",
  summary:
    "紫色的穗状花序由一轮轮小花叠成,每朵小花是唇形科典型的二唇形管状花。花冠有 8–10 毫米长——舌长不同的蜂,在这里吃到蜜的速度大不一样。",
  entries: [
    {
      id: "corolla",
      reviewStatus: "ai-reviewed",
      index: "01",
      short: "花冠",
      title: "管子里的蜜",
      latin: "bilabiate corolla",
      description:
        "每朵小花是两侧对称的二唇形花,花冠全长 8–10 毫米,花萼 4–5 毫米。花蜜在管底,舌越长的蜂取蜜越快。",
      fact: "英国在杂交薰衣草(‘Grosso’)上的研究发现,熊蜂在一朵花上只停 1.1–1.4 秒,蜜蜂要 3.5 秒——研究者认为差别主要来自舌的长短。",
      sourceIds: ["src-foc-lavandula", "src-sussex-lavender-2013", "src-balfour-2013-lavender"],
    },
    {
      id: "stamen",
      reviewStatus: "ai-reviewed",
      index: "02",
      short: "花蕊",
      title: "不靠自己结实",
      latin: "stamens · pollinator dependence",
      description:
        "保加利亚的隔离试验里,隔绝传粉者的花结实率为零,对照约 86%——薰衣草几乎完全依赖昆虫传粉;观察到的访花者几乎都是蜂类。",
      fact: "薰衣草原产地中海盆地;中国的主产区在新疆伊犁,并不在东部。",
      sourceIds: ["src-kozuharova-2022-lavender", "src-wikipedia-lavandula-angustifolia", "src-xj-weather-lavender-2023"],
    },
    {
      id: "inflorescence",
      reviewStatus: "ai-reviewed",
      index: "03",
      short: "花序",
      title: "一轮轮叠上去的花穗",
      latin: "verticillasters · spike",
      description:
        "6–10 朵小花组成一轮(轮伞花序),许多轮密集排成约 3–5 厘米长的顶生穗状花序,生在细长无叶的花枝顶端。花期在夏季:不同地区的资料从 6 月到 9 月不一。",
      fact: "据薰衣草油生产者的经验,没有授粉的花会提前脱落;精油产量与授粉的关系,还有待研究证实。",
      sourceIds: ["src-foc-lavandula", "src-pfaf-lavandula", "src-wikipedia-lavandula-angustifolia", "src-kozuharova-2022-lavender"],
    },
  ],
  sourceIds: ["src-wikipedia-lavandula-angustifolia", "src-wikipedia-lavandula", "src-foc-lavandula", "src-pfaf-lavandula", "src-kozuharova-2022-lavender", "src-ncsu-lavandula", "src-wikipedia-monofloral-honey"],
};
