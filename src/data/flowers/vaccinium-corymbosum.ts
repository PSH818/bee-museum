import type { FlowerSpecies } from "../schemas/content";

export const vacciniumCorymbosum: FlowerSpecies = {
  id: "flower-vaccinium-corymbosum",
  reviewStatus: "ai-reviewed",
  name: "高丛蓝莓",
  scientificName: "Vaccinium corymbosum",
  englishName: "highbush blueberry",
  family: "杜鹃花科 Ericaceae",
  form: "radial",
  bloom: {
    "region-china-east": { from: 4, to: 5 },
    "region-central-europe": { from: 5, to: 5 },
    "region-north-america-east": { from: 5, to: 6 },
  },
  nectar: "有花蜜,蜜腺在花萼基部;可产“蓝莓蜜”。",
  pollen: "花粉藏在孔裂的花药里,要靠振动才抖得出来。",
  summary:
    "白色到淡粉的小钟铃倒挂成串,花药顶端只有小孔——花粉不会自己掉出来,得有蜂“嗡”一下把它震出来。这让熊蜂这类会振动授粉的蜂,以及通常每次访花都会接触花药和柱头的壁蜂,在蓝莓园里特别重要。",
  entries: [
    {
      id: "corolla",
      reviewStatus: "ai-reviewed",
      index: "01",
      short: "花冠",
      title: "倒挂的小钟",
      latin: "urn-shaped corolla",
      description:
        "花冠钟形至坛状,五枚花瓣合生成筒,白色到很浅的粉色,长约 6–12 毫米,口朝下。总状花序上每簇约 8–10 朵。",
      fact: "高丛蓝莓是四倍体植物;多数栽培品种用自己的花粉也能结果,但异花授粉常能让果实更大、成熟更早。",
      sourceIds: ["src-wikipedia-highbush-blueberry", "src-usda-vaccinium", "src-msu-blueberry-pollination"],
    },
    {
      id: "stamen",
      reviewStatus: "ai-reviewed",
      index: "02",
      short: "花蕊",
      title: "要震一震才给花粉",
      latin: "poricidal anthers",
      description:
        "花药顶端开孔(孔裂),花粉不会自然散落;熊蜂等能抓住花朵高频振动,把花粉震出来,这叫振动授粉。蜜蜂不会振动授粉,但仍是果园常用的管理传粉者。",
      fact: "有的木蜂会在花筒侧面咬个缝直接取蜜,蜜蜂随后也从这些现成的缝里取蜜;盗蜜的蜂也会带走一些花粉,少量盗蜜通常不影响坐果(密歇根州立大学资料)。",
      sourceIds: ["src-wikipedia-buzz-pollination", "src-msu-blueberry-pollination"],
    },
    {
      id: "inflorescence",
      reviewStatus: "ai-reviewed",
      index: "03",
      short: "花序",
      title: "春天的花串",
      latin: "raceme",
      description:
        "总状花序,通常与展叶同时开放。中欧主花期多在 5 月前两周;美国东北部 5–6 月;中国北方栽培区大致 4–5 月(据农业技术网站介绍,仅供参考)。",
      fact: "高丛蓝莓原产北美东部,是全球栽培蓝莓的主要来源。",
      sourceIds: ["src-dewiki-kulturheidelbeere", "src-wildflower-vaco", "src-cnhnb-blueberry", "src-gobotany-vaco", "src-wikipedia-highbush-blueberry"],
    },
  ],
  sourceIds: ["src-wikipedia-highbush-blueberry", "src-usda-vaccinium", "src-dewiki-kulturheidelbeere", "src-cnhnb-blueberry", "src-sare-osmia-blueberry", "src-wikipedia-monofloral-honey", "src-wikipedia-buzz-pollination"],
};
