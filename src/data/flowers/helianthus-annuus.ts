import type { FlowerSpecies } from "../schemas/content";

export const helianthusAnnuus: FlowerSpecies = {
  id: "flower-helianthus-annuus",
  reviewStatus: "ai-reviewed",
  name: "向日葵",
  scientificName: "Helianthus annuus",
  englishName: "common sunflower",
  family: "菊科 Asteraceae",
  form: "capitulum",
  bloom: {
    "region-china-east": { from: 7, to: 9 },
    "region-central-europe": { from: 7, to: 9 },
    "region-north-america-east": { from: 7, to: 9 },
  },
  nectar: "对多种蜂都是良好的蜜源;田间观测显示,泌蜜多在中午前后最旺。向日葵单花蜜浅黄、葡萄糖高、结晶快。",
  pollen: "花粉量大,但蛋白含量偏低。",
  summary:
    "我们叫“一朵”向日葵的东西,其实是成百上千朵小花组成的花盘:外圈黄色的舌状花像花瓣却不结实,中央的管状花才是真正开花结籽的部分,按螺旋排列。",
  entries: [
    {
      id: "corolla",
      reviewStatus: "ai-reviewed",
      index: "01",
      short: "花冠",
      title: "像花瓣的不是花瓣",
      latin: "ray florets · disc florets",
      description:
        "外圈鲜黄的“花瓣”是不育的舌状花,只负责招引;中央棕紫色的管状花是两性花,每朵五裂。花盘直径野生型约 7–12 厘米,栽培种可达 10–30 厘米。",
      fact: "幼嫩的花盘白天会跟着太阳转,成熟后多数固定朝东。",
      sourceIds: ["src-wikipedia-sunflower", "src-frps-helianthus"],
    },
    {
      id: "stamen",
      reviewStatus: "ai-reviewed",
      index: "02",
      short: "花蕊",
      title: "上午散粉,中午泌蜜",
      latin: "disc florets · anthers",
      description:
        "据印度的田间观测,小花的花粉多在上午 8–10 时散出,泌蜜在中午前后最旺。花粉量大,但蛋白含量偏低。",
      fact: "野生向日葵不能用自己的花粉结实(自交不亲和),高度依赖昆虫传粉;印度的罩网试验显示,加蜂群授粉比开放授粉增产约两到三成。",
      sourceIds: ["src-raja-2025-sunflower", "src-pmc-sunflower-nutrition"],
    },
    {
      id: "inflorescence",
      reviewStatus: "ai-reviewed",
      index: "03",
      short: "花序",
      title: "一盘花的排列",
      latin: "capitulum",
      description:
        "头状花序单生茎顶,常略下倾;管状花按螺旋排列。中国东部 7–9 月开花,中欧 7–9 月,北美温带在夏季到初秋。",
      fact: "一个花盘上的小花数以千计,具体数量随品种差别很大。",
      sourceIds: ["src-wikipedia-sunflower", "src-frps-helianthus", "src-dewiki-sonnenblume", "src-ncsu-sunflower"],
    },
  ],
  sourceIds: ["src-wikipedia-sunflower", "src-frps-helianthus", "src-dewiki-sonnenblume", "src-ncsu-sunflower", "src-pmc-sunflower-nutrition", "src-wikipedia-monofloral-honey"],
};
