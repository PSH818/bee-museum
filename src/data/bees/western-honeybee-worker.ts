import type { BeeCaste } from "../../three/bees/types";
import type { ReviewStatus } from "../schemas/content";

export type BeeFocusId = "whole" | "head" | "wing" | "abdomen" | "leg";

export interface BeeFocusItem {
  id: BeeFocusId;
  index: string;
  short: string;
  title: string;
  latin: string;
  description: string;
  fact: string;
  /** 引用的来源记录 id(见 data/sources/records.ts) */
  sourceIds: string[];
  /** 审校状态(产品方案 §9.2):正式展出要求至少 reviewed */
  reviewStatus: ReviewStatus;
}

export interface BeeCastePresentation {
  id: BeeCaste;
  name: string;
  english: string;
  role: string;
  hero: string;
}

export const westernHoneyBeeCastes: Record<BeeCaste, BeeCastePresentation> = {
  worker: {
    id: "worker",
    name: "工蜂",
    english: "worker",
    role: "雌性 · 采集与群体劳动",
    hero: "认识一只工蜂如何感知、飞行与采集。",
  },
  queen: {
    id: "queen",
    name: "蜂王",
    english: "queen",
    role: "雌性 · 群体主要繁殖个体",
    hero: "观察蜂王为繁殖形成的长腹部与不同身体比例。",
  },
  drone: {
    id: "drone",
    name: "雄蜂",
    english: "drone",
    role: "雄性 · 主要参与交配",
    hero: "观察雄蜂宽大的复眼、粗壮胸部与无螫针结构。",
  },
};

const sharedFocus: Record<Exclude<BeeFocusId, "whole" | "leg">, BeeFocusItem> = {
  head: {
    id: "head",
    index: "01",
    short: "头部",
    title: "它看到的世界，与我们并不相同",
    latin: "compound eyes · antennae · mouthparts",
    description: "复眼、三只单眼、分节触角与口器共同构成感知和取食系统。靠近头部，可以看到大颚、下唇须(口器两侧的须状附肢)和可伸出的中唇舌(吸食花蜜的“舌”)。",
    fact: "雄蜂的复眼显著增大并向头顶延伸；工蜂和蜂王的复眼比例更克制。",
    sourceIds: ["src-snodgrass-anatomy", "src-britannica-honeybee"],
    reviewStatus: "ai-reviewed",
  },
  wing: {
    id: "wing",
    index: "02",
    short: "翅",
    title: "两对翅在飞行中会连成一个翼面",
    latin: "forewing · hindwing · venation",
    description: "前翅与后翅通过翅钩联动。翅膜不是空白薄片，纵脉与横脉构成具有辨识价值的翅室网络。",
    fact: "蜂王腹部长但翅不会等比例变长；雄蜂的翅在三种职型中绝对尺寸最大。",
    sourceIds: ["src-wikipedia-hamulus", "src-snodgrass-anatomy", "src-wikipedia-western-honey-bee"],
    reviewStatus: "ai-reviewed",
  },
  abdomen: {
    id: "abdomen",
    index: "03",
    short: "腹部",
    title: "腹部轮廓记录了不同职型的生活方式",
    latin: "segmented abdomen · metasoma",
    description: "腹部由连续体节构成，表面有坚硬的甲壳、深浅相间的色带和短毛。蜂王腹部细长，雄蜂末端较钝，工蜂则介于两者之间。",
    fact: "工蜂腹部有 6 个可见体节，末端藏有螫针；蜂王腹部明显更长，雄蜂末端较钝且无螫针。",
    sourceIds: ["src-snodgrass-anatomy", "src-britannica-honeybee"],
    reviewStatus: "ai-reviewed",
  },
};

export function getWesternHoneyBeeFocus(caste: BeeCaste): BeeFocusItem[] {
  const presentation = westernHoneyBeeCastes[caste];
  const wholeByCaste: Record<BeeCaste, BeeFocusItem> = {
    worker: {
      id: "whole",
      index: "00",
      short: "工蜂",
      title: "一只工蜂，就是一套精密的采集系统",
      latin: "Apis mellifera · worker",
      description: "工蜂是雌性，身体承担育幼、筑巢、防御和采集等多种任务，后足具有花粉筐。",
      fact: "工蜂不是一个独立物种，而是社会性蜜蜂群体中的一种职型。",
      sourceIds: ["src-wikipedia-worker-bee", "src-britannica-honeybee"],
      reviewStatus: "ai-reviewed",
    },
    queen: {
      id: "whole",
      index: "00",
      short: "蜂王",
      title: "蜂王不是更大的工蜂，而是不同的发育结果",
      latin: "Apis mellifera · queen",
      description: "蜂王同为雌性，但腹部更长，生殖系统高度发育；成熟群体通常围绕一只主要产卵蜂王组织。",
      fact: "蜂王没有工蜂式花粉筐，也不负责日常采集。",
      sourceIds: ["src-wikipedia-western-honey-bee", "src-wikipedia-honey-bee", "src-britannica-honeybee"],
      reviewStatus: "ai-reviewed",
    },
    drone: {
      id: "whole",
      index: "00",
      short: "雄蜂",
      title: "宽大的复眼，是雄蜂最醒目的身份线索",
      latin: "Apis mellifera · drone",
      description: "雄蜂是雄性，胸部粗壮、复眼巨大，主要功能与交配相关；它没有螫针，也没有工蜂式花粉筐。",
      fact: "雄蜂体型并非简单放大的工蜂，头、眼、腹部末端和足部结构都不同。",
      sourceIds: ["src-wikipedia-western-honey-bee", "src-wikipedia-honey-bee", "src-snodgrass-anatomy"],
      reviewStatus: "ai-reviewed",
    },
  };

  const legByCaste: Record<BeeCaste, BeeFocusItem> = {
    worker: {
      id: "leg",
      index: "04",
      short: "六足",
      title: "后足是工蜂的花粉运输工具",
      latin: "coxa · femur · tibia · tarsus · corbicula",
      description: "每条足都由多个关节段组成。工蜂后足胫节外侧形成花粉筐，花粉被梳理和压实后附着其上。",
      fact: "花粉团位于后足，而不是腹部；前足还参与触角清洁。",
      sourceIds: ["src-wikipedia-pollen-basket", "src-snodgrass-anatomy"],
      reviewStatus: "ai-reviewed",
    },
    queen: {
      id: "leg",
      index: "04",
      short: "六足",
      title: "蜂王有完整六足，但没有采集型花粉筐",
      latin: "coxa · femur · tibia · tarsus",
      description: "蜂王的足仍保持昆虫典型分节，但不承担工蜂式花粉采集，因此后足轮廓不同。",
      fact: "蜂王一生几乎不外出采集，后足没有花粉筐，也不会带回花粉团。",
      sourceIds: ["src-wikipedia-pollen-basket", "src-wikipedia-honey-bee", "src-wikipedia-western-honey-bee"],
      reviewStatus: "ai-reviewed",
    },
    drone: {
      id: "leg",
      index: "04",
      short: "六足",
      title: "雄蜂的足适合活动，但不用于采集花粉",
      latin: "coxa · femur · tibia · tarsus",
      description: "雄蜂没有工蜂式花粉筐。足部依然由基节、转节、股节、胫节和跗节等结构构成。",
      fact: "雄蜂不采集花粉，也没有螫针——它既不会带回花粉团，也不会螫人。不过野外很难一眼认出雄蜂，请不要据此去触碰任何蜂。",
      sourceIds: ["src-wikipedia-pollen-basket", "src-wikipedia-western-honey-bee", "src-wikipedia-honey-bee"],
      reviewStatus: "ai-reviewed",
    },
  };

  return [
    wholeByCaste[caste],
    sharedFocus.head,
    sharedFocus.wing,
    sharedFocus.abdomen,
    legByCaste[caste],
  ].map((item) => ({
    ...item,
    latin: item.id === "whole"
      ? `Apis mellifera · ${presentation.english}`
      : item.latin,
  }));
}

export const westernHoneyBeeWorkerFocus = getWesternHoneyBeeFocus("worker");
