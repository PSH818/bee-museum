import type { BeeCaste } from "../../three/bees/types";
import {
  getWesternHoneyBeeFocus,
  type BeeFocusItem,
} from "./western-honeybee-worker";

// 东方蜜蜂 Apis cerana · 三职型观察条目。
// 头/翅/腹为蜜蜂属通用解剖内容,与西方蜜蜂共享;全身与六足条目按职型物种特化。
// 条目由 AI 起草,reviewStatus 均为 draft。

const WHOLE: Record<BeeCaste, BeeFocusItem> = {
  worker: {
    id: "whole",
    index: "00",
    short: "工蜂",
    title: "更小的身体,同样完整的采集系统",
    latin: "Apis cerana · worker",
    description:
      "东方蜜蜂工蜂体长约 10–11 mm(西方蜜蜂工蜂约 12–15 mm;不同资料略有差异),腹部有四条黄色环纹;它能在较大的环境温差下维持稳定的巢温,是亚洲本土传统养蜂的主角。",
    fact: "中华蜜蜂(中蜂)是东方蜜蜂的亚种;面对胡蜂,东方蜜蜂会形成蜂团将其围困过热致死。",
    sourceIds: ["src-wikipedia-apis-cerana", "src-wikipedia-honey-bee", "src-wikipedia-worker-bee"],
    reviewStatus: "ai-reviewed",
  },
  queen: {
    id: "whole",
    index: "00",
    short: "蜂王",
    title: "同样的长腹,更小的群体",
    latin: "Apis cerana · queen",
    description:
      "东方蜜蜂蜂王同为雌性,腹部延长、生殖系统高度发育;一个蜂群通常约有 6000–7000 只工蜂(不同资料因亚种与季节差异较大),明显小于西方蜜蜂群体。",
    fact: "东方蜜蜂比西方蜜蜂更容易迁飞(整群弃巢)——蜂王带着整群离开旧巢,是本土养蜂要面对的日常。",
    sourceIds: ["src-wikipedia-apis-cerana", "src-wikipedia-western-honey-bee"],
    reviewStatus: "ai-reviewed",
  },
  drone: {
    id: "whole",
    index: "00",
    short: "雄蜂",
    title: "宽大复眼、无螫针,和西方蜜蜂雄蜂如出一辙",
    latin: "Apis cerana · drone",
    description:
      "东方蜜蜂雄蜂同样复眼巨大、胸部粗壮,主要职能是与新蜂王交配;它没有螫针,也没有花粉筐。",
    fact: "雄蜂一般由未受精卵发育而来,只有母亲没有父亲——这种单倍二倍性性别决定方式见于整个膜翅目(蜂、胡蜂、蚂蚁等);极少数情况下也会出现由受精卵发育的二倍体雄蜂。",
    sourceIds: ["src-wikipedia-apis-cerana", "src-wikipedia-western-honey-bee", "src-wikipedia-honey-bee", "src-snodgrass-anatomy", "src-wikipedia-haplodiploidy"],
    reviewStatus: "ai-reviewed",
  },
};

const LEG: Record<BeeCaste, BeeFocusItem> = {
  worker: {
    id: "leg",
    index: "04",
    short: "六足",
    title: "后足花粉筐,与西方蜜蜂同源",
    latin: "coxa · femur · tibia · tarsus · corbicula",
    description:
      "东方蜜蜂工蜂后足胫节同样特化出花粉筐,花粉压实后附着其上;足的分节结构与西方蜜蜂一致。",
    fact: "花粉筐是蜜蜂属的共同特征,不是某一种蜜蜂独有。",
    sourceIds: ["src-wikipedia-pollen-basket", "src-wikipedia-apis-cerana"],
    reviewStatus: "ai-reviewed",
  },
  queen: {
    id: "leg",
    index: "04",
    short: "六足",
    title: "蜂王有完整六足,但没有采集型花粉筐",
    latin: "coxa · femur · tibia · tarsus",
    description:
      "蜂王的足保持昆虫典型分节,但不承担采集,因此后足没有工蜂式的花粉筐轮廓。",
    fact: "蜂王几乎不外出采集,后足没有花粉筐,也不会带回花粉团。",
    sourceIds: ["src-wikipedia-pollen-basket", "src-wikipedia-western-honey-bee", "src-wikipedia-honey-bee"],
    reviewStatus: "ai-reviewed",
  },
  drone: {
    id: "leg",
    index: "04",
    short: "六足",
    title: "雄蜂的足适合活动,不用于采集",
    latin: "coxa · femur · tibia · tarsus",
    description:
      "雄蜂没有工蜂式花粉筐;足部依然由基节、转节、股节、胫节和跗节等结构构成。",
    fact: "雄蜂不采集花粉,也没有螫针——既不会带回花粉团,也不会螫人。不过野外很难一眼认出雄蜂,请不要据此去触碰任何蜂。",
    sourceIds: ["src-wikipedia-pollen-basket", "src-wikipedia-western-honey-bee", "src-wikipedia-honey-bee"],
    reviewStatus: "ai-reviewed",
  },
};

export function getEasternHoneyBeeFocus(caste: BeeCaste = "worker"): BeeFocusItem[] {
  return getWesternHoneyBeeFocus(caste).map((item) =>
    item.id === "whole" ? WHOLE[caste] : item.id === "leg" ? LEG[caste] : item,
  );
}
