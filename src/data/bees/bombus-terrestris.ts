import type { OrganEntry } from "../schemas/content";
import type { BeeFocusItem } from "./western-honeybee-worker";

// 欧洲熊蜂 Bombus terrestris · 工蜂观察与器官条目。
// 首期表现重点(产品方案 §5.1):毛发、振动授粉概念。
// 条目由 AI 起草,reviewStatus 均为 draft。

const BOMBUS_FOCUS: BeeFocusItem[] = [
  {
    id: "whole",
    index: "00",
    short: "工蜂",
    title: "圆胖多毛,是保温也是身份",
    latin: "Bombus terrestris · worker",
    description:
      "欧洲熊蜂通体覆盖浓密长绒毛:黑底之上带黄色带纹,尾端一撮白毛,是野外辨识它的第一线索。厚厚的毛被有助于保温,让它在较凉的天气也能出勤访花。",
    fact: "熊蜂会进行振动授粉:飞行肌高频震动把花粉从番茄等植物的管状花药里\"摇\"出来,这是蜜蜂做不到的。",
    sourceIds: [
      "src-wikipedia-bombus-terrestris",
      "src-wikipedia-buzz-pollination",
      "src-wikipedia-bumblebee",
    ],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "head",
    index: "01",
    short: "头部",
    title: "够不到的花蜜,就咬个孔",
    latin: "compound eyes · antennae · proboscis",
    description:
      "熊蜂头部同样由复眼、单眼、触角和口器构成。遇到花冠很深、舌头够不到花蜜的花,熊蜂(据记载也包括欧洲熊蜂)有时会在花冠基部咬孔取蜜,这种行为叫\"盗蜜\"(nectar robbing)——这只是一个行为名称,并不带贬义。",
    fact: "熊蜂个体间体型差异很大:同一巢的工蜂胸部大小可差约 3 倍,体重可差近十倍(不同资料 8–11 倍)。",
    sourceIds: ["src-wikipedia-bombus-terrestris", "src-wikipedia-bumblebee", "src-wikipedia-nectar-robbing", "src-snodgrass-anatomy"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "wing",
    index: "02",
    short: "翅",
    title: "小翅膀扛起圆身体",
    latin: "forewing · hindwing · wing coupling",
    description:
      "相对滚圆的身体,熊蜂的翅显得偏小;它依靠高频扇动维持飞行,前后翅同样以翅钩联动。",
    fact: "\"按空气动力学熊蜂不会飞\"是流传已久的误解:翅膀快速拍动时会在翅面上方卷起小旋涡,这些旋涡提供额外升力——用静止机翼的公式算不出来,但空气动力学研究已经解释清楚。",
    sourceIds: ["src-wikipedia-bumblebee", "src-wikipedia-bombus-terrestris", "src-wikipedia-hamulus"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "abdomen",
    index: "03",
    short: "腹部",
    title: "读懂尾色,就认出了这种熊蜂",
    latin: "banded fur · buff/white tail",
    description:
      "腹部的毛色分带是熊蜂分类的重要线索:欧洲熊蜂腹前有黄带、尾端污白;不同熊蜂种的带纹组合各不相同。",
    fact: "蜂王尾端偏皮黄色(buff),工蜂近白色——英文名 buff-tailed bumblebee 来自蜂王。",
    sourceIds: ["src-wikipedia-bombus-terrestris"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "leg",
    index: "04",
    short: "六足",
    title: "后足同样带着花粉筐",
    latin: "corbicula · pollen basket",
    description:
      "熊蜂与蜜蜂同科,工蜂和蜂王后足胫节同样特化出光滑的花粉筐,访花归来时常能看到腿上鲜艳的花粉团。",
    fact: "在番茄、蓝莓等依赖振动授粉的作物上,熊蜂能完成蜜蜂做不到的授粉工作。",
    sourceIds: ["src-wikipedia-pollen-basket", "src-wikipedia-bumblebee", "src-wikipedia-buzz-pollination"],
    reviewStatus: "ai-reviewed",
  },
];

export function getBombusFocus(): BeeFocusItem[] {
  return BOMBUS_FOCUS;
}

export const bombusOrgans: OrganEntry[] = [
  {
    id: "organ-bombus-fur",
    castes: ["worker", "queen", "drone"],
    anchorIds: ["thorax"],
    focusId: "whole",
    name: "毛被与警戒色",
    latinName: "pile",
    summary:
      "浓密长绒毛兼具保温与信号功能:黑黄白的分带是警戒色,厚毛被帮助熊蜂在凉爽天气维持飞行所需的体温。",
    functionNote: "保温、警戒色与携粉。",
    sourceIds: ["src-wikipedia-bumblebee", "src-wikipedia-bombus-terrestris"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
  {
    id: "organ-bombus-flight-muscle",
    castes: ["worker", "queen"],
    anchorIds: ["foreWingL", "foreWingR"],
    focusId: "wing",
    name: "振动授粉",
    latinName: "buzz pollination · sonication",
    summary:
      "熊蜂抱住花朵,用飞行肌高频震动使花朵和花药一起振动,将番茄、蓝莓等管状花药中的花粉震落——温室番茄授粉产业正建立在这一能力上。",
    functionNote: "声震取粉;蜜蜂不具备此行为。",
    sourceIds: ["src-wikipedia-buzz-pollination"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
  {
    id: "organ-bombus-corbicula",
    castes: ["worker", "queen"],
    anchorIds: ["hindLegL", "hindLegR"],
    focusId: "leg",
    name: "后足花粉筐",
    latinName: "corbicula",
    summary:
      "与蜜蜂同源的携粉结构:后足胫节外侧的光滑凹面,边缘环绕长毛,花粉压实后固定其中。",
    functionNote: "花粉的压实与运输。",
    sourceIds: ["src-wikipedia-pollen-basket"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
  {
    id: "organ-bombus-sting",
    castes: ["worker", "queen"],
    anchorIds: ["sting"],
    focusId: "abdomen",
    name: "螫针(无倒钩)",
    latinName: "aculeus",
    summary:
      "熊蜂螫针光滑无倒钩,可以重复螫刺而不致自身死亡。熊蜂通常不主动攻击人,但被捏握或巢穴受扰时会螫刺;野外观察请保持距离、不要触碰,对蜂毒过敏者被螫后应立即就医。",
    functionNote: "防御;可重复使用,与蜜蜂的倒钩螫针不同。",
    sourceIds: ["src-wikipedia-bumblebee", "src-wikipedia-bombus-terrestris"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
];
