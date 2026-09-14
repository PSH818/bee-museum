import type { SpecimenQuality } from "../core/specimen";

export type BeeCaste = "worker" | "queen" | "drone";

export type BeeAnchorId =
  | "whole"
  | "head"
  | "thorax"
  | "abdomen"
  | "compoundEyeL"
  | "compoundEyeR"
  | "antennaL"
  | "antennaR"
  | "proboscis"
  | "foreWingL"
  | "foreWingR"
  | "hindWingL"
  | "hindWingR"
  | "foreLegL"
  | "foreLegR"
  | "midLegL"
  | "midLegR"
  | "hindLegL"
  | "hindLegR"
  | "leg"
  | "sting";

export type BeeRigId =
  | "body"
  | "abdomen"
  | "foreWingL"
  | "foreWingR"
  | "hindWingL"
  | "hindWingR"
  | "antennaL"
  | "antennaR";

export interface BeeBuildOptions {
  caste: BeeCaste;
  quality: SpecimenQuality;
  seed: number;
  pollenLoad: number;
}

export interface BeeMorphologyProfile {
  caste: BeeCaste;
  headPositionX: number;
  headScale: [number, number, number];
  eyeScale: [number, number, number];
  eyeForward: number;
  thoraxPositionX: number;
  thoraxScale: [number, number, number];
  abdomenPositionX: number;
  abdomenLength: number;
  abdomenRadiusY: number;
  abdomenRadiusZ: number;
  foreWingScale: [number, number, number];
  hindWingScale: [number, number, number];
  mouthpartLength: number;
  legLength: number;
  hairDensity: number;
  hairLength: number;
  hasPollenBasket: boolean;
  hasSting: boolean;
  palette: {
    shell: string;
    thorax: string;
    abdomen: string;
    hairLight: string;
    hairDark: string;
  };
}
