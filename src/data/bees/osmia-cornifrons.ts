import type { OrganEntry } from "../schemas/content";
import type { BeeFocusItem } from "./western-honeybee-worker";

// 角额壁蜂 Osmia cornifrons · 雌蜂观察与器官条目(独居蜂代表,产品方案 §5.1)。
// 首期表现重点:筑巢与花粉搬运(腹面集粉毛)。条目由 AI 起草,均为 draft。

const OSMIA_FOCUS: BeeFocusItem[] = [
  {
    id: "whole",
    index: "00",
    short: "雌蜂",
    title: "没有蜂群的蜂:一只雌蜂独自筑巢育幼",
    latin: "Osmia cornifrons · female",
    description:
      "角额壁蜂是独居蜂:没有蜂王、工蜂之分,每只雌蜂独自选巢、采粉、产卵、封巢。它原产东亚;据报道,自 1940 年代起推广约五十年后,日本半数以上的苹果园曾用它授粉;据报道 1977 年前后它被引入美国东部,此后在美国东部与中西部定殖(在野外稳定繁殖、长期存在)。",
    fact: "它用泥土在竹管、芦苇管等细长空腔里隔出一间间巢室,每室放一个花粉球和一枚卵——壁蜂这一类蜂的英文统称 mason bee(泥匠蜂)由此而来。",
    sourceIds: ["src-wikipedia-osmia-cornifrons", "src-exotic-bee-id", "src-wikipedia-mason-bee"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "head",
    index: "01",
    short: "头部",
    title: "脸上的\"角\",是它名字的来源",
    latin: "clypeal horns · mandibles",
    description:
      "雌蜂下脸长有一对角状突起,学名 cornifrons 意为\"有角的额\";雌蜂用泥土分隔并封闭巢室。",
    fact: "它是昼行性蜂,白天 6 点到晚 8 点都可能在活动。",
    sourceIds: ["src-wikipedia-osmia-cornifrons", "src-wikipedia-mason-bee"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "wing",
    index: "02",
    short: "翅",
    title: "短途飞行的专家",
    latin: "forewing · hindwing",
    description:
      "壁蜂是典型的短距离采集者,巢址通常建在作物田 130 米以内;翅膀结构与蜜蜂类同,前后翅以翅钩联动。",
    fact: "活动季集中在早春果树开花期,雄蜂约四月先羽化。",
    sourceIds: ["src-wikipedia-osmia-cornifrons", "src-wikipedia-hamulus"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "abdomen",
    index: "03",
    short: "腹部",
    title: "花粉背在肚子底下",
    latin: "ventral scopa",
    description:
      "壁蜂没有蜜蜂那样的后足花粉筐,而是在腹部腹面长着一片密集的集粉毛(scopa):访花时花粉直接刷附在腹部下方,带回巢中。",
    fact: "花粉刷附在毛间带回巢中,不像花粉筐那样压实;这种腹面携粉方式是切叶蜂科多数种类的特征。",
    sourceIds: ["src-wikipedia-scopa", "src-wikipedia-osmia-cornifrons", "src-wikipedia-pollen-basket"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "leg",
    index: "04",
    short: "六足",
    title: "后足没有花粉筐",
    latin: "coxa · femur · tibia · tarsus",
    description:
      "与蜜蜂、熊蜂不同,壁蜂后足胫节没有光滑的花粉筐;六足主要用于抓握花朵、搬运泥土和在巢管内进退。",
    fact: "花粉筐(corbicula)只见于蜜蜂科的少数几族(蜜蜂、熊蜂、无刺蜂、兰花蜂);多数其他蜂类用后足的集粉毛携粉,把花粉带在腹面则主要见于切叶蜂科。",
    sourceIds: ["src-wikipedia-scopa", "src-wikipedia-pollen-basket"],
    reviewStatus: "ai-reviewed",
  },
];

export function getOsmiaFocus(): BeeFocusItem[] {
  return OSMIA_FOCUS;
}

export const osmiaOrgans: OrganEntry[] = [
  {
    id: "organ-osmia-scopa",
    castes: ["worker"],
    anchorIds: ["abdomen"],
    focusId: "abdomen",
    name: "腹面集粉毛",
    latinName: "scopa",
    summary:
      "腹部腹面成排的密集刚毛,访花时把花粉刷附其上;这是切叶蜂科多数种类的特征,与蜜蜂的后足花粉筐是两条不同的携粉路线。",
    functionNote: "携带松散花粉回巢。",
    modelNote: "本模型以腹部下方的浅色绒毛表现集粉毛。",
    sourceIds: ["src-wikipedia-scopa"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
  {
    id: "organ-osmia-horns",
    castes: ["worker"],
    anchorIds: ["head"],
    focusId: "head",
    name: "唇基角突",
    latinName: "clypeal horns",
    summary:
      "雌蜂下脸的一对角状突起,是本种命名依据;其功能尚不明确。",
    functionNote: "物种识别特征。",
    modelNote: "本模型未雕刻角突,标注点位于头部。",
    sourceIds: ["src-wikipedia-osmia-cornifrons"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
  {
    id: "organ-osmia-mandible",
    castes: ["worker"],
    anchorIds: ["proboscis"],
    focusId: "head",
    name: "大颚与口器",
    latinName: "mandibles · proboscis",
    summary:
      "雌蜂用泥土分隔并封闭巢室;口器吸取花蜜,与花粉一同存入巢室供幼虫取食。",
    functionNote: "筑巢、取食与巢室供粮。",
    modelNote: "本模型未单独雕刻大颚,标注点位于口器位置。",
    sourceIds: ["src-wikipedia-osmia-cornifrons", "src-wikipedia-mason-bee"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
];
