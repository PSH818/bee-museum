import type { FlowerSpecies } from "../schemas/content";

export const robiniaPseudoacacia: FlowerSpecies = {
  id: "flower-robinia-pseudoacacia",
  reviewStatus: "ai-reviewed",
  name: "刺槐",
  scientificName: "Robinia pseudoacacia",
  englishName: "black locust",
  family: "豆科 Fabaceae",
  form: "papilionaceous",
  bloom: {
    "region-china-east": { from: 4, to: 6 },
    "region-central-europe": { from: 5, to: 6 },
    "region-north-america-east": { from: 4, to: 6 },
  },
  nectar: "花蜜量大、含糖高;“洋槐蜜(槐花蜜)”水白近无色、味清淡、果糖高、长期保持液态、不易结晶。",
  pollen: "花粉的产量和营养价值,本馆尚未找到足以展出的系统数据。",
  summary:
    "垂挂的白色蝶形花序,香气浓烈,一株只开七到十天,却是中国北方、欧洲与美国东部都举足轻重的蜜源树。市售“槐花蜜”的槐花指的是它(洋槐),而不是国槐。",
  entries: [
    {
      id: "corolla",
      reviewStatus: "ai-reviewed",
      index: "01",
      short: "花冠",
      title: "白色的蝶形花",
      latin: "papilionaceous corolla",
      description:
        "蝶形花:旗瓣立在上方、翼瓣在两侧、龙骨瓣包住雌雄蕊,花宽约 2.5 厘米,乳白色带一点淡黄斑。花的构造把雄蕊和雌蕊隔开,通常不自花授粉,依赖昆虫——主要是蜂类——传粉。",
      fact: "刺槐原产美国东部,17 世纪传入欧洲,后来经欧洲传入中国,青岛一带最早成片栽植;如今华北平原与黄淮流域广泛造林。",
      sourceIds: ["src-wikipedia-black-locust", "src-frps-robinia"],
    },
    {
      id: "stamen",
      reviewStatus: "ai-reviewed",
      index: "02",
      short: "花蕊",
      title: "花蜜多而甜",
      latin: "nectar · stamens",
      description:
        "花蜜含糖约 34–59%;据德文维基百科引用的养蜂资料估算,一株成年树一个花季分泌的花蜜可供蜜蜂酿出接近 1 公斤蜂蜜。花粉的产量和营养价值,本馆尚未找到足以展出的系统数据。",
      fact: "洋槐蜜果糖含量高,一般认为这是它能长期保持液态、不易结晶的原因。",
      sourceIds: ["src-wikipedia-black-locust", "src-dewiki-robinie", "src-wikipedia-monofloral-honey"],
    },
    {
      id: "inflorescence",
      reviewStatus: "ai-reviewed",
      index: "03",
      short: "花序",
      title: "十天的盛宴",
      latin: "pendulous raceme",
      description:
        "腋生的下垂总状花序长 10–20 厘米,每序 10–25 朵;展叶之后开花,一株只开七到十天。中国东部 4–6 月,中欧 5–6 月,美国东部 4 月下旬至 6 月中旬。",
      fact: "花期短而集中,养蜂人往往要追着花期转场。",
      sourceIds: ["src-wikipedia-black-locust", "src-frps-robinia", "src-dewiki-robinie", "src-usda-robinia"],
    },
  ],
  sourceIds: ["src-wikipedia-black-locust", "src-zhwiki-robinia", "src-frps-robinia", "src-dewiki-robinie", "src-usda-robinia", "src-wikipedia-monofloral-honey"],
};
