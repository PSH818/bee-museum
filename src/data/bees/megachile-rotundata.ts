import type { OrganEntry } from "../schemas/content";
import type { BeeFocusItem } from "./western-honeybee-worker";

// 苜蓿切叶蜂 Megachile rotundata · 雌蜂观察与器官条目。
// 首期表现重点:切叶筑巢与腹部集粉毛。条目由 AI 起草,均为 draft。

const MEGACHILE_FOCUS: BeeFocusItem[] = [
  {
    id: "whole",
    index: "00",
    short: "雌蜂",
    title: "会裁剪树叶的小蜂",
    latin: "Megachile rotundata · female",
    description:
      "苜蓿切叶蜂体长仅 6–9 mm,深灰色身体披白色细毛。它是独居蜂,不筑群、不储蜜;雌蜂用大颚从叶片上剪下圆片,卷成顶针状的巢室。原产欧洲(部分资料认为其原产地延伸至西亚);传入北美后被用于给生产种子的苜蓿田授粉(是否为有意引入各资料说法不一),并被有意引入新西兰和澳大利亚。",
    fact: "一间巢室大约要用 15 片叶子;雌蜂先吐入花蜜,再把集粉毛上的花粉抖在上面,最后产卵封室。",
    sourceIds: ["src-wikipedia-megachile-rotundata"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "head",
    index: "01",
    short: "头部",
    title: "大颚是它的剪刀",
    latin: "mandibles",
    description:
      "切叶蜂的大颚能像剪刀一样从叶缘剪下近圆形的叶片,再运回巢管内拼接。",
    fact: "叶片切口整齐得像被打孔器打过——花园里叶缘的圆形缺口常是切叶蜂留下的。",
    sourceIds: ["src-wikipedia-megachile-rotundata", "src-wikipedia-megachile"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "wing",
    index: "02",
    short: "翅",
    title: "带着叶片飞回巢",
    latin: "forewing · hindwing",
    description:
      "雌蜂把剪下的叶片带回巢管,翅膀要额外承担这份载荷;前后翅以翅钩联动,结构与蜜蜂相同。",
    fact: "它是高效的苜蓿、胡萝卜和多种蔬果的授粉者;取食时把喙插入苜蓿花的龙骨瓣,花粉随之刷到集粉毛上。",
    sourceIds: ["src-wikipedia-megachile-rotundata", "src-wikipedia-megachile", "src-wikipedia-hamulus"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "abdomen",
    index: "03",
    short: "腹部",
    title: "白色细毛与腹面集粉毛",
    latin: "white pubescence · ventral scopa",
    description:
      "深灰底色上覆白色细毛;腹面则是密集的集粉毛,花粉直接刷附在腹部下方带回巢中。",
    fact: "雄蜂腹部有白色和黄色斑点,且体型比雌蜂小。",
    sourceIds: ["src-wikipedia-megachile-rotundata", "src-wikipedia-scopa", "src-wikipedia-megachile"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "leg",
    index: "04",
    short: "六足",
    title: "抓叶片的六条腿",
    latin: "coxa · femur · tibia · tarsus",
    description:
      "切叶蜂后足没有花粉筐;六足用于抓握叶片、在巢管中定位和固定身体。",
    fact: "管理化饲养时,人们提供纸管或钻孔木块等人工巢材,雌蜂会自行进驻筑巢。",
    sourceIds: ["src-wikipedia-megachile-rotundata", "src-wikipedia-scopa"],
    reviewStatus: "ai-reviewed",
  },
];

export function getMegachileFocus(): BeeFocusItem[] {
  return MEGACHILE_FOCUS;
}

export const megachileOrgans: OrganEntry[] = [
  {
    id: "organ-megachile-mandible",
    castes: ["worker"],
    anchorIds: ["proboscis"],
    focusId: "head",
    name: "切叶大颚",
    latinName: "mandibles",
    summary:
      "边缘锋利的大颚从叶片剪下圆形叶片,每个巢室约需 15 片;这是\"切叶蜂\"名称的由来。",
    functionNote: "剪叶、搬运与拼接巢室。",
    modelNote: "本模型未单独雕刻大颚,标注点位于口器位置。",
    sourceIds: ["src-wikipedia-megachile-rotundata"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
  {
    id: "organ-megachile-scopa",
    castes: ["worker"],
    anchorIds: ["abdomen"],
    focusId: "abdomen",
    name: "腹面集粉毛",
    latinName: "scopa",
    summary:
      "腹部腹面的密集刚毛,访花时刷附花粉;回巢后雌蜂把花粉抖落在预先吐入的花蜜上,作为幼虫的食物。",
    functionNote: "携粉;巢室供粮。",
    modelNote: "本模型以腹部下方的浅色绒毛表现集粉毛。",
    sourceIds: ["src-wikipedia-scopa", "src-wikipedia-megachile-rotundata"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
  {
    id: "organ-megachile-hair-bands",
    castes: ["worker"],
    anchorIds: ["hindWingL", "hindWingR"],
    focusId: "wing",
    name: "白色细毛",
    latinName: "white pubescence",
    summary:
      "雌蜂全身覆白色细毛,与深灰底色相间,是野外辨识本种的常见线索之一。",
    functionNote: "物种识别特征。",
    modelNote: "本模型以腹部浅色绒毛近似表现白毛;标注点位于腹部前段背面、翅根附近。",
    sourceIds: ["src-wikipedia-megachile-rotundata", "src-wikipedia-megachile"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
];
