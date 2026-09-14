import * as THREE from "three";
import type { MuseumSpecimen } from "../../core/specimen";
import type { BeeAnchorId, BeeRigId } from "../types";

type BeeSpecimen = MuseumSpecimen<BeeAnchorId, BeeRigId>;

export function applyHoneyBeeIdleMotion(
  specimen: BeeSpecimen,
  elapsedSeconds: number,
  enabled: boolean,
): void {
  const amount = enabled ? 1 : 0;
  const flap = Math.sin(elapsedSeconds * 32) * 0.12 * amount;
  const slow = Math.sin(elapsedSeconds * 1.5) * 0.018 * amount;

  specimen.rig.foreWingL.rotation.x = 0.28 + flap;
  specimen.rig.foreWingR.rotation.x = -0.28 - flap;
  specimen.rig.hindWingL.rotation.x = 0.2 + flap * 0.65;
  specimen.rig.hindWingR.rotation.x = -0.2 - flap * 0.65;
  specimen.rig.abdomen.rotation.z = slow;
  specimen.rig.body.rotation.y = Math.sin(elapsedSeconds * 0.55) * 0.035 * amount;

  const antennaDrift = Math.sin(elapsedSeconds * 2.1) * 0.025 * amount;
  specimen.rig.antennaL.rotation.z = antennaDrift;
  specimen.rig.antennaR.rotation.z = -antennaDrift;
}

export function resetWorkerIdleMotion(specimen: BeeSpecimen): void {
  applyHoneyBeeIdleMotion(specimen, 0, false);
  specimen.rig.body.rotation.copy(new THREE.Euler());
}

export const applyWorkerIdleMotion = applyHoneyBeeIdleMotion;
