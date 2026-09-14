import type { FlowerSpecies } from "../schemas/content";
import { brassicaNapus } from "./brassica-napus";
import { robiniaPseudoacacia } from "./robinia-pseudoacacia";
import { helianthusAnnuus } from "./helianthus-annuus";
import { vacciniumCorymbosum } from "./vaccinium-corymbosum";
import { trifoliumRepens } from "./trifolium-repens";
import { lavandulaAngustifolia } from "./lavandula-angustifolia";
import { medicagoSativa } from "./medicago-sativa";

/** 花朵与四季馆的全部花朵(首期 7 种);新增一种只需在此登记 */
export const flowers: Record<string, FlowerSpecies> = {
  [brassicaNapus.id]: brassicaNapus,
  [robiniaPseudoacacia.id]: robiniaPseudoacacia,
  [helianthusAnnuus.id]: helianthusAnnuus,
  [vacciniumCorymbosum.id]: vacciniumCorymbosum,
  [trifoliumRepens.id]: trifoliumRepens,
  [lavandulaAngustifolia.id]: lavandulaAngustifolia,
  [medicagoSativa.id]: medicagoSativa,
};
export const FLOWER_IDS = Object.keys(flowers);
