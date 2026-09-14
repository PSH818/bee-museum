import type { HoneyVariety } from "../schemas/content";

// M5 蜂蜜工坊 · 这瓶蜜来自哪朵花(与花朵馆七种花一一对应)。
// 口径约定:感官描述尽量沿用花朵卡已过审的表述;没有可靠资料的如实写"未找到"。
export const honeyVarieties: HoneyVariety[] = [
  {
    id: "honey-rapeseed",
    reviewStatus: "ai-reviewed",
    name: "油菜蜜",
    flowerId: "flower-brassica-napus",
    traits: "白色至乳黄,味微辛;极易结晶,结晶细腻呈脂状。",
    regionNote: "春季大宗蜜种;中国与欧洲的油菜产区皆有出产。",
    sourceIds: [
      "src-honigmacher-raps",
      "src-dewiki-raps",
      "src-wikipedia-rapeseed",
      "src-wikipedia-monofloral-honey",
    ],
  },
  {
    id: "honey-black-locust",
    reviewStatus: "ai-reviewed",
    name: "洋槐蜜(槐花蜜)",
    flowerId: "flower-robinia-pseudoacacia",
    traits:
      "市售“槐花蜜”的槐花通常指洋槐(刺槐),而不是国槐。洋槐蜜色浅至近无色,味清淡带花香,果糖比例高、久不结晶——与油菜蜜的“极易结晶”恰成对照。据德文维基百科引用的养蜂资料,一株成年树一个花季分泌的花蜜约可酿出 0.7–1.4 公斤蜂蜜。",
    regionNote: "中国北方、欧洲与美国东部;德语区市场多以“Akazienhonig(阿卡西亚蜜)”为名出售。",
    sourceIds: [
      "src-dewiki-robinie",
      "src-zhwiki-robinia",
      "src-mo-2025-cerana-acacia-honey",
      "src-wikipedia-monofloral-honey",
    ],
  },
  {
    id: "honey-sunflower",
    reviewStatus: "ai-reviewed",
    name: "向日葵蜜",
    flowerId: "flower-helianthus-annuus",
    traits: "浅黄,葡萄糖比例高,结晶快。",
    regionNote: "向日葵种植区的夏季蜜种。",
    sourceIds: ["src-pmc-sunflower-nutrition", "src-wikipedia-monofloral-honey"],
  },
  {
    id: "honey-blueberry",
    reviewStatus: "ai-reviewed",
    name: "蓝莓蜜",
    flowerId: "flower-vaccinium-corymbosum",
    traits:
      "产区有以“蓝莓蜜”为名的单花蜜;它的色泽与风味,本馆尚未找到足以展出的系统资料。",
    regionNote: "北美等蓝莓集中栽培区。",
    sourceIds: ["src-wikipedia-monofloral-honey", "src-cnhnb-blueberry"],
  },
  {
    id: "honey-clover",
    reviewStatus: "ai-reviewed",
    name: "三叶草蜜",
    flowerId: "flower-trifolium-repens",
    traits:
      "在北美、新西兰等牧场多的地方,“三叶草蜜”是最常见的单花蜜之一;它来自白车轴草等车轴草属牧草,在北美还大量来自近缘的草木樨属(sweet clover)。它的色泽与风味,本馆尚未找到足以展出的系统资料。",
    regionNote: "北美、新西兰等温带牧区。",
    sourceIds: [
      "src-wikipedia-monofloral-honey",
      "src-mnwild-white-clover",
      "src-wikipedia-white-clover",
      "src-msu-sweet-clovers",
    ],
  },
  {
    id: "honey-lavender",
    reviewStatus: "ai-reviewed",
    name: "薰衣草蜜",
    flowerId: "flower-lavandula-angustifolia",
    traits: "色淡黄;“薰衣草蜜”主产于地中海周边。",
    regionNote: "地中海周边薰衣草产区。",
    sourceIds: ["src-pfaf-lavandula", "src-kozuharova-2022-lavender", "src-wikipedia-monofloral-honey"],
  },
  {
    id: "honey-alfalfa",
    reviewStatus: "ai-reviewed",
    name: "苜蓿蜜",
    flowerId: "flower-medicago-sativa",
    traits: "白色至特浅琥珀色,味淡雅。",
    regionNote: "在美国西部,紫花苜蓿是最重要的蜜源植物之一。",
    sourceIds: ["src-mcgregor-1976-alfalfa", "src-mnwild-alfalfa", "src-wikipedia-monofloral-honey"],
  },
];
