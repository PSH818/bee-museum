import type { OrganEntry } from "../schemas/content";
import type { BeeFocusItem } from "./western-honeybee-worker";

// 紫木蜂 Xylocopa violacea · 雌蜂观察与器官条目(木蜂属代表)。
// 首期表现重点:金属光泽、木洞筑巢。条目由 AI 起草,均为 draft。

const XYLOCOPA_FOCUS: BeeFocusItem[] = [
  {
    id: "whole",
    index: "00",
    short: "雌蜂",
    title: "会闪紫光的大蜂",
    latin: "Xylocopa violacea · female",
    description:
      "紫木蜂是欧洲最大的蜂类之一,通体黑色、带微弱光泽;标志性的蓝紫色虹彩主要来自它深色、泛紫光的翅膀。它是独居蜂,分布以欧洲为主,向东延伸至亚洲(分布东界各资料记载不一,部分资料称可达中国中部)。",
    fact: "成蜂夏末羽化(从蛹变为成虫)后越冬,次年春季(约三至五月,因地区而异)出来活动;雌蜂独自在枯木中钻洞筑巢。",
    sourceIds: ["src-wikipedia-xylocopa-violacea", "src-wikipedia-carpenter-bee", "src-dewiki-blaue-holzbiene"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "head",
    index: "01",
    short: "头部",
    title: "能啃穿木头的大颚",
    latin: "mandibles",
    description:
      "木蜂的大颚极为强壮,雌蜂用它在枯死的树干或木材中一点点啃出隧道状巢穴——\"木蜂\"因此得名。",
    fact: "它不吃木头,只是钻洞;木屑或被推出洞口,或被用来分隔巢室。",
    sourceIds: ["src-wikipedia-xylocopa-violacea", "src-wikipedia-carpenter-bee", "src-dewiki-blaue-holzbiene"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "wing",
    index: "02",
    short: "翅",
    title: "烟紫色的翅",
    latin: "smoky violet wings",
    description:
      "木蜂的翅膜呈烟褐色,在特定角度下反射出蓝紫虹彩(一般认为是薄膜干涉形成的结构色),与黑色身体相配;大体型意味着翅也需要更大、更有力。",
    fact: "木蜂属被认为能进行振动授粉,和熊蜂一样可以\"摇\"出管状花药中的花粉。",
    sourceIds: ["src-wikipedia-xylocopa-violacea", "src-wikipedia-buzz-pollination", "src-wikipedia-carpenter-bee", "src-dewiki-blaue-holzbiene"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "abdomen",
    index: "03",
    short: "腹部",
    title: "光滑的黑色甲壳",
    latin: "metallic integument",
    description:
      "与熊蜂的绒毛外衣相反,木蜂腹部几乎无毛,光滑坚硬的甲壳呈黑色,在光下带微弱的蓝紫光泽——一般认为这种光泽是结构色,由甲壳表面微结构对光的作用产生,而不是色素。",
    fact: "在光线下转动实物标本或本馆的 3D 模型,能看到光泽随角度变化。",
    sourceIds: ["src-wikipedia-xylocopa-violacea", "src-wikipedia-carpenter-bee", "src-dewiki-blaue-holzbiene"],
    reviewStatus: "ai-reviewed",
  },
  {
    id: "leg",
    index: "04",
    short: "六足",
    title: "满是绒毛的后足",
    latin: "coxa · femur · tibia · tarsus",
    description:
      "木蜂后足密布集粉毛用于携粉,没有蜜蜂那样的光滑花粉筐。",
    fact: "雌蜂体型大,常被误认为大型熊蜂。",
    sourceIds: ["src-wikipedia-xylocopa-violacea", "src-wikipedia-carpenter-bee", "src-dewiki-blaue-holzbiene"],
    reviewStatus: "ai-reviewed",
  },
];

export function getXylocopaFocus(): BeeFocusItem[] {
  return XYLOCOPA_FOCUS;
}

export const xylocopaOrgans: OrganEntry[] = [
  {
    id: "organ-xylocopa-integument",
    castes: ["worker"],
    anchorIds: ["abdomen"],
    focusId: "abdomen",
    name: "黑色甲壳与光泽",
    latinName: "metallic cuticle",
    summary:
      "黑色甲壳表面带微弱蓝紫光泽;一般认为这是结构色——由表面微结构对光产生干涉(不同方向反射的光相互叠加)而形成,而非色素。木蜂最醒目的蓝紫虹彩其实在翅膜上。",
    functionNote: "物种识别;光泽的功能尚不清楚。",
    modelNote: "本模型的甲壳以金属材质近似,光泽会随角度变化;真实标本的色调层次更细微。",
    sourceIds: ["src-wikipedia-xylocopa-violacea", "src-wikipedia-carpenter-bee", "src-dewiki-blaue-holzbiene"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
  {
    id: "organ-xylocopa-mandible",
    castes: ["worker"],
    anchorIds: ["proboscis"],
    focusId: "head",
    name: "钻木大颚",
    latinName: "mandibles",
    summary:
      "雌蜂用强壮的大颚在枯木中啃出隧道并分隔成巢室,每室存放花粉团与一枚卵。",
    functionNote: "在枯木中钻洞筑巢。",
    modelNote: "本模型未单独雕刻大颚,标注点位于口器位置。",
    sourceIds: ["src-wikipedia-xylocopa-violacea"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
  {
    id: "organ-xylocopa-wing",
    castes: ["worker"],
    anchorIds: ["foreWingL", "foreWingR"],
    focusId: "wing",
    name: "烟紫色翅膜与振动授粉",
    latinName: "iridescent wings · buzz pollination",
    summary:
      "深色翅膜带蓝紫虹彩;木蜂属被认为能以飞行肌高频震动进行振动授粉,取出管状花药中的花粉。",
    functionNote: "飞行;声震取粉。",
    modelNote: "本模型的翅膜以半透明深紫色近似,未表现随角度变化的虹彩。",
    sourceIds: ["src-wikipedia-buzz-pollination", "src-wikipedia-xylocopa-violacea", "src-dewiki-blaue-holzbiene"],
    reviewStatus: "ai-reviewed",
    lastReviewedOn: "2026-08-25",
  },
];
