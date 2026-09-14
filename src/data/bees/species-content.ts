import type { BeeCaste } from "../../three/bees/types";
import type { OrganEntry } from "../schemas/content";
import type { BeeSpeciesId } from "./species-index";
import { getWesternHoneyBeeFocus, type BeeFocusItem } from "./western-honeybee-worker";
import { westernHoneyBeeWorkerOrgans } from "./western-honeybee-worker-organs";
import { getEasternHoneyBeeFocus } from "./eastern-honeybee";
import { bombusOrgans, getBombusFocus } from "./bombus-terrestris";
import { getOsmiaFocus, osmiaOrgans } from "./osmia-cornifrons";
import { getMegachileFocus, megachileOrgans } from "./megachile-rotundata";
import { getXylocopaFocus, xylocopaOrgans } from "./xylocopa-violacea";

/** 物种 → 观察条目/器官条目 的统一入口;新增蜂种只需在此登记一行 */
export interface SpeciesContent {
  focus: (caste: BeeCaste) => BeeFocusItem[];
  organs: OrganEntry[];
  /** 首屏引导语(整体观察时) */
  hero: string;
}

export const speciesContent: Record<BeeSpeciesId, SpeciesContent> = {
  "apis-mellifera": {
    focus: (caste) => getWesternHoneyBeeFocus(caste),
    organs: westernHoneyBeeWorkerOrgans,
    hero: "",
  },
  "apis-cerana": {
    focus: (caste) => getEasternHoneyBeeFocus(caste),
    organs: westernHoneyBeeWorkerOrgans, // 蜜蜂属通用器官内容(审校时按物种确认)
    hero: "观察一只东方蜜蜂:约 10 毫米的身体,四条清晰的黄色环纹。",
  },
  "bombus-terrestris": {
    focus: () => getBombusFocus(),
    organs: bombusOrgans,
    hero: "观察一只欧洲熊蜂:黑黄白分区的浓密毛被,和振动授粉的绝活。",
  },
  "osmia-cornifrons": {
    focus: () => getOsmiaFocus(),
    organs: osmiaOrgans,
    hero: "观察一只角额壁蜂:独居、泥筑巢室,花粉背在肚子底下。",
  },
  "megachile-rotundata": {
    focus: () => getMegachileFocus(),
    organs: megachileOrgans,
    hero: "观察一只苜蓿切叶蜂:会剪树叶的小蜂,腹面白毛携粉。",
  },
  "xylocopa-violacea": {
    focus: () => getXylocopaFocus(),
    organs: xylocopaOrgans,
    hero: "观察一只紫木蜂:黑色甲壳的蓝紫金属光泽,和钻木筑巢的大颚。",
  },
};
