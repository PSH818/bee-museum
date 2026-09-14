import { Html, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import {
  bodyLengthBySpecies,
  bodyLengthTextBySpecies,
} from "../../data/bees/western-honeybee-compare";
import {
  casteLabelOverrides,
  speciesCastes,
  type BeeSpeciesId,
} from "../../data/bees/species-index";
import { westernHoneyBeeCastes } from "../../data/bees/western-honeybee-worker";
import { DEFAULT_BEE_ROTATION } from "../core/coordinates";
import type { BeeCaste } from "../bees/types";
import { applyHoneyBeeIdleMotion } from "../bees/motion/worker-idle";
import { applyHeroIdleMotion } from "../bees/species/apis-mellifera-worker-hero";
import type { WesternHoneyBeeSpecimen } from "../bees/species/apis-mellifera-worker";
import { loadSpecimen, type SpecimenId } from "../registry/specimen-registry";
import { StageSetting } from "./WesternHoneyBeeViewer";

const GROUND_Y = -0.79;
const BASE_SCALE = 0.5; // 与单体观察一致的舞台基准
const GAP = 0.7;

interface PlacedSpecimen {
  caste: BeeCaste;
  specimen: WesternHoneyBeeSpecimen;
  position: THREE.Vector3Tuple;
  scale: number;
  labelX: number;
  width: number;
}

/** 比较台:三职型并排,按真实体长比例缩放(产品方案 §8.2) */
export function CompareStage({
  species = "apis-mellifera",
  motion,
  interactive,
}: {
  species?: BeeSpeciesId;
  motion: boolean;
  interactive: boolean;
}) {
  const CASTES = speciesCastes[species];
  const bodyLength = bodyLengthBySpecies[species];
  const bodyLengthText = bodyLengthTextBySpecies[species];
  const [specimens, setSpecimens] = useState<
    Record<BeeCaste, WesternHoneyBeeSpecimen> | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    const owned: WesternHoneyBeeSpecimen[] = [];
    window.__specimenReady = false;
    void Promise.all(
      CASTES.map((caste) =>
        loadSpecimen(`${species}-${caste}-hero` as SpecimenId, {
          caste,
          quality: "high",
          seed: 1,
          pollenLoad: caste === "worker" ? 0.55 : 0,
        }).catch(() =>
          loadSpecimen(`${species}-${caste}` as SpecimenId, { caste }),
        ),
      ),
    ).then((loaded) => {
      if (cancelled) {
        loaded.forEach((s) => s.dispose());
        return;
      }
      owned.push(...loaded);
      const byCaste = Object.fromEntries(
        CASTES.map((caste, index) => [caste, loaded[index]]),
      ) as Record<BeeCaste, WesternHoneyBeeSpecimen>;
      setSpecimens(byCaste);
      window.__specimenReady = true;
      window.__specimenGeneration = (window.__specimenGeneration ?? 0) + 1;
    });
    return () => {
      cancelled = true;
      owned.forEach((s) => s.dispose());
    };
  }, [species]);

  // 布局:真实体长比例(以工蜂为基准),足尖对齐地面,按宽度排开
  const placed = useMemo<PlacedSpecimen[]>(() => {
    if (!specimens) return [];
    const size = (s: WesternHoneyBeeSpecimen) =>
      s.bounds.getSize(new THREE.Vector3());
    const workerLength = size(specimens.worker).x;
    const items = CASTES.map((caste) => {
      const specimen = specimens[caste];
      const modelLength = size(specimen).x;
      // si: 让模型体长比 == 真实体长比;缺体长数据的物种按模型原比例
      const si = bodyLength
        ? (bodyLength[caste] / bodyLength.worker) / (modelLength / workerLength)
        : 1;
      const width = modelLength * si * BASE_SCALE;
      return { caste, specimen, si, width };
    });
    const totalWidth =
      items.reduce((sum, item) => sum + item.width, 0) + GAP * 2;
    let cursor = -totalWidth / 2;
    return items.map(({ caste, specimen, si, width }) => {
      const center = specimen.bounds.getCenter(new THREE.Vector3());
      const labelX = cursor + width / 2;
      // 旋转(绕 Y 轴 ≈ π)后模型局部中心近似取反,这里把包围盒中心移回槽位中心
      const x = labelX + center.x * si * BASE_SCALE;
      const y = GROUND_Y - specimen.bounds.min.y * si * BASE_SCALE;
      cursor += width + GAP;
      return {
        caste,
        specimen,
        position: [x, y, 0] as THREE.Vector3Tuple,
        scale: si * BASE_SCALE,
        labelX,
        width,
      };
    });
  }, [specimens, bodyLength]);

  useFrame((state) => {
    for (const { specimen } of placed) {
      if (specimen.metadata.id.endsWith("-hero")) {
        applyHeroIdleMotion(specimen, state.clock.elapsedTime, motion);
      } else {
        applyHoneyBeeIdleMotion(specimen, state.clock.elapsedTime, motion);
      }
    }
  });

  return (
    <>
      <StageSetting fogRange={[14, 24]} />
      <CompareCamera placed={placed} interactive={interactive} />
      {placed.map(({ caste, specimen, position, scale, labelX }) => (
        <group key={caste}>
          <group
            position={position}
            rotation={DEFAULT_BEE_ROTATION}
            scale={scale}
          >
            <primitive object={specimen.root} />
          </group>
          <Html position={[labelX, GROUND_Y - 0.34, 0.9]} center>
            <div className="compare-label">
              <b>{casteLabelOverrides[species]?.[caste] ?? westernHoneyBeeCastes[caste].name}</b>
              <span>{westernHoneyBeeCastes[caste].english}</span>
              {bodyLengthText && <i>{bodyLengthText[caste]}</i>}
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

function CompareCamera({
  placed,
  interactive,
}: {
  placed: PlacedSpecimen[];
  interactive: boolean;
}) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    if (placed.length === 0) return;
    const first = placed[0];
    const last = placed[placed.length - 1];
    const span = last.labelX + last.width / 2 - (first.labelX - first.width / 2);
    // 按视口纵横比计算能容纳整排标本的距离
    const perspective = camera as THREE.PerspectiveCamera;
    const tanHalfH =
      Math.tan((perspective.fov * Math.PI) / 360) * perspective.aspect;
    const distance = Math.max(8.5, ((span / 2) * 1.18) / tanHalfH + 1);
    camera.position.set(0, 0.8, distance);
    camera.lookAt(0, -0.1, 0);
    invalidate();
  }, [camera, placed, invalidate]);
  if (!interactive) return null;
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      minDistance={7}
      maxDistance={19}
      minPolarAngle={Math.PI * 0.28}
      maxPolarAngle={Math.PI * 0.7}
      target={[0, -0.1, 0]}
    />
  );
}
