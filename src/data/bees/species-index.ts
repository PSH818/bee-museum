import type { BeeCaste } from "../../three/bees/types";
import type { BeeSpeciesRecord } from "../schemas/content";

// 蜂种索引(产品方案 §5.1 MVP 蜂种,六种已全部上线)。
// 条目由 AI 起草,reviewStatus 均为 draft,发布前需人工核对。

export type BeeSpeciesId =
  | "apis-mellifera"
  | "apis-cerana"
  | "bombus-terrestris"
  | "osmia-cornifrons"
  | "megachile-rotundata"
  | "xylocopa-violacea";

export const beeSpecies: Record<BeeSpeciesId, BeeSpeciesRecord> = {
  "apis-mellifera": {
    id: "apis-mellifera",
    name: "西方蜜蜂",
    scientificName: "Apis mellifera",
    englishName: "Western honey bee",
    family: "蜜蜂科 Apidae",
    distribution: "原产欧洲、非洲与西亚,现随养蜂业遍布全球",
    socialStructure: "高度社会性,群体由蜂王、工蜂和季节性雄蜂构成",
    nesting: "洞穴或蜂箱内营多脾垂直蜡巢",
    workerBodyLengthMm: { min: 12, max: 15 },
    summary:
      "全球养蜂业与农业授粉最主要的蜂种,也是研究最充分的蜜蜂;本馆以它讲解职型分工与蜜蜂身体结构。",
    sourceIds: [
      "src-wikipedia-western-honey-bee",
      "src-wikipedia-honey-bee",
      "src-wikipedia-worker-bee",
    ],
    reviewStatus: "ai-reviewed",
  },
  "apis-cerana": {
    id: "apis-cerana",
    name: "东方蜜蜂",
    scientificName: "Apis cerana",
    englishName: "Eastern honey bee",
    family: "蜜蜂科 Apidae",
    distribution: "亚洲南部与东部的传统饲养蜂种;中华蜜蜂(Apis cerana cerana)是它在中国的主要亚种",
    socialStructure: "高度社会性(蜂王、工蜂与雄蜂分工协作、共同生活),群体结构与西方蜜蜂(Apis mellifera)相近",
    nesting: "在树洞等隐蔽空腔内筑巢,巢由多片平行悬挂的蜡质巢脾(蜂巢片)组成",
    workerBodyLengthMm: { min: 10, max: 11 },
    summary:
      "工蜂体长约 10–11 mm(不同资料记载的范围略有差异,约 9–13 mm),腹部有黄黑相间的环纹(常描述为四条黄纹,色泽因亚种与地区而异);作为亚洲原生蜂种,长期是当地传统养蜂的主要蜂种;面对胡蜂等天敌时,会聚成蜂团把入侵者围住,使其过热而死(称为“热球防御”)。",
    sourceIds: ["src-wikipedia-apis-cerana", "src-wikipedia-honey-bee"],
    reviewStatus: "ai-reviewed",
  },
  "bombus-terrestris": {
    id: "bombus-terrestris",
    name: "欧洲熊蜂",
    scientificName: "Bombus terrestris",
    englishName: "Buff-tailed bumblebee",
    family: "蜜蜂科 Apidae · 熊蜂属",
    distribution: "欧洲、北非与西亚;作为温室授粉蜂被广泛引入世界各地",
    socialStructure: "通常为一年生社会性:蜂王越冬后独立建群,群体规模远小于蜜蜂",
    nesting: "多利用地下鼠洞等腔穴筑巢,巢内为不规则排列的蜡质育幼室与蜜罐",
    workerBodyLengthMm: { min: 11, max: 17 },
    summary:
      "圆胖多毛的授粉能手:黑底绒毛带黄色带纹,尾端白色至皮黄色;能进行振动授粉,番茄等温室作物高度依赖它。",
    sourceIds: ["src-wikipedia-bombus-terrestris", "src-wikipedia-bumblebee", "src-wikipedia-buzz-pollination"],
    reviewStatus: "ai-reviewed",
  },
  "osmia-cornifrons": {
    id: "osmia-cornifrons",
    name: "角额壁蜂",
    scientificName: "Osmia cornifrons",
    englishName: "Hornfaced bee",
    family: "切叶蜂科 Megachilidae · 壁蜂属",
    distribution: "原产东亚(日本、朝鲜半岛、中国、俄罗斯远东);1977 年引入美国东部,此后在美国东部与中西部定殖",
    socialStructure: "独居:每只雌蜂独立筑巢、采粉、产卵",
    nesting: "利用竹管、芦苇及树木现成孔洞,以泥土分隔巢室并封口",
    workerBodyLengthMm: { min: 8, max: 12 },
    summary:
      "独居蜂代表,曾是日本苹果园的主力授粉蜂之一;花粉粘附在腹面的集粉毛上,而不是像蜜蜂那样装在后足花粉筐里。",
    sourceIds: ["src-wikipedia-osmia-cornifrons", "src-wikipedia-scopa", "src-exotic-bee-id"],
    reviewStatus: "ai-reviewed",
  },
  "megachile-rotundata": {
    id: "megachile-rotundata",
    name: "苜蓿切叶蜂",
    scientificName: "Megachile rotundata",
    englishName: "Alfalfa leafcutter bee",
    family: "切叶蜂科 Megachilidae · 切叶蜂属",
    distribution: "原产欧洲(部分资料认为延伸至西亚);传入北美后成为苜蓿制种的授粉蜂,并被有意引入新西兰、澳大利亚",
    socialStructure: "独居:不筑群、不储蜜,雌蜂独立供养巢室",
    nesting: "在现成孔洞内用大颚剪下的叶片圆片卷成顶针状巢室",
    workerBodyLengthMm: { min: 6, max: 9 },
    summary:
      "会裁剪树叶筑巢的小型独居蜂,深灰体色覆白色细毛,腹面集粉毛携粉;苜蓿制种业的重要授粉蜂。",
    sourceIds: ["src-wikipedia-megachile-rotundata", "src-wikipedia-scopa"],
    reviewStatus: "ai-reviewed",
  },
  "xylocopa-violacea": {
    id: "xylocopa-violacea",
    name: "紫木蜂",
    scientificName: "Xylocopa violacea",
    englishName: "Violet carpenter bee",
    family: "蜜蜂科 Apidae · 木蜂属",
    distribution: "以欧洲为主,向东延伸至亚洲(分布东界各资料记载不一,部分资料称可达中国中部);主要分布于北纬 30 度以北",
    socialStructure: "独居:雌蜂独自筑巢",
    nesting: "在枯木中用大颚啃出隧道状巢穴",
    workerBodyLengthMm: { min: 20, max: 28 },
    summary:
      "欧洲最大的蜂类之一:黑色身体带微弱光泽,翅呈烟紫色并带蓝紫虹彩;夏末羽化越冬,春季活动,被认为能进行振动授粉(用身体高频振动把花粉从花药里震出来)。",
    sourceIds: ["src-wikipedia-xylocopa-violacea", "src-dewiki-blaue-holzbiene", "src-wikipedia-carpenter-bee", "src-wikipedia-buzz-pollination"],
    reviewStatus: "ai-reviewed",
  },
};

/** 各蜂种当前可展出的职型/形态(独居蜂内部沿用 worker 通道,界面显示为"雌蜂") */
export const speciesCastes: Record<BeeSpeciesId, readonly BeeCaste[]> = {
  "apis-mellifera": ["worker", "queen", "drone"],
  "apis-cerana": ["worker", "queen", "drone"],
  "bombus-terrestris": ["worker"],
  "osmia-cornifrons": ["worker"],
  "megachile-rotundata": ["worker"],
  "xylocopa-violacea": ["worker"],
};

/** 独居蜂没有职型,界面把 worker 通道显示为"雌蜂" */
export const casteLabelOverrides: Partial<
  Record<BeeSpeciesId, Partial<Record<BeeCaste, string>>>
> = {
  "osmia-cornifrons": { worker: "雌蜂" },
  "megachile-rotundata": { worker: "雌蜂" },
  "xylocopa-violacea": { worker: "雌蜂" },
};

export const BEE_SPECIES_IDS = Object.keys(beeSpecies) as BeeSpeciesId[];
