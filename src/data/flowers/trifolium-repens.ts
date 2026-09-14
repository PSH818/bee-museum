import type { FlowerSpecies } from "../schemas/content";

export const trifoliumRepens: FlowerSpecies = {
  id: "flower-trifolium-repens",
  reviewStatus: "ai-reviewed",
  name: "白车轴草",
  scientificName: "Trifolium repens",
  englishName: "white clover",
  family: "豆科 Fabaceae",
  form: "papilionaceous",
  bloom: {
    "region-china-east": { from: 5, to: 10 },
    "region-central-europe": { from: 5, to: 10 },
    "region-north-america-east": { from: 5, to: 10 },
  },
  nectar: "重要蜜源:花蜜在雄蕊管基部,舌短的蜂也够得着;“三叶草蜜”是常见的单花蜜——“三叶草”泛指车轴草属的几种牧草,白车轴草是其中最主要的一种。",
  pollen: "花粉营养价值良好(据德文维基百科)。",
  summary:
    "草坪和牧场里最常见的白色小球花,其实是几十朵蝶形小花挤成的头状花序。它是重要的蜜源植物,也是一朵“要用体重压开”的花。",
  entries: [
    {
      id: "corolla",
      reviewStatus: "ai-reviewed",
      index: "01",
      short: "花冠",
      title: "几十朵小蝶形花挤成一球",
      latin: "globose head · papilionaceous florets",
      description:
        "头状花序球形,直径 15–40 毫米,由 20–50 朵(有时更多)小花密集组成;每朵小花是典型的蝶形花,花长约 7–12 毫米,白色带粉或乳黄。",
      fact: "开过的小花会变褐下垂,所以一个花球上常常同时看到新开的白花和垂下的褐花。",
      sourceIds: ["src-frps-trifolium-repens", "src-wikipedia-white-clover", "src-wikipedia-clover", "src-bsbi-white-clover"],
    },
    {
      id: "stamen",
      reviewStatus: "ai-reviewed",
      index: "02",
      short: "花蕊",
      title: "压开翼瓣才吃得到",
      latin: "staminal tube · nectar",
      description:
        "花蜜藏在雄蕊管基部,位置不深,舌短的蜂也够得着;但要先用体重把翼瓣和龙骨瓣压下去,露出蜜和花粉。",
      fact: "白车轴草基本自交不亲和,种子生产依赖蜂类传粉——新西兰的种子田通常会放进蜜蜂蜂群。",
      sourceIds: ["src-bsbi-white-clover", "src-nz-2018-clover-bombus", "src-wikipedia-white-clover"],
    },
    {
      id: "inflorescence",
      reviewStatus: "ai-reviewed",
      index: "03",
      short: "花序",
      title: "开一整个夏天",
      latin: "capitate raceme",
      description:
        "花期很长:从 5 月一直开到 10 月,中国东部、中欧与北美温带大致相同;7 月前后最盛。",
      fact: "在北美、新西兰等牧场多的地方,“三叶草蜜”是最常见的单花蜜之一;它来自白车轴草等车轴草属牧草,北美的“三叶草蜜”也常来自近缘的草木樨。",
      sourceIds: ["src-frps-trifolium-repens", "src-dewiki-weissklee", "src-mnwild-white-clover", "src-bsbi-white-clover", "src-wikipedia-monofloral-honey", "src-msu-sweet-clovers"],
    },
  ],
  sourceIds: ["src-wikipedia-white-clover", "src-frps-trifolium-repens", "src-bsbi-white-clover", "src-dewiki-weissklee", "src-mnwild-white-clover", "src-wikipedia-monofloral-honey"],
};
