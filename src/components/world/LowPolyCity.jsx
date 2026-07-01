import { useGLTF } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  CITY_BOUNDARY_COLLIDERS,
  CITY_MANUAL_COLLIDERS,
  CITY_MODEL_TRANSFORM,
} from "../../data/cityPhysics";

const CITY_MODEL_PATH = "/models/city/candidate_new_city.glb";
const SHOW_CITY_COLLIDERS = false;

function prepareTexture(texture, colorTexture, maxAnisotropy) {
  texture.colorSpace = colorTexture ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
}

export function LowPolyCity({ timeOfDay = "night" }) {
  const { scene } = useGLTF(CITY_MODEL_PATH);
  const { gl } = useThree();
  const isDay = timeOfDay === "dawn";
  const preparedScene = useMemo(() => {
    const clone = scene.clone(true);
    const textureClones = new Map();
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    clone.traverse((object) => {
      if (!object.isMesh) return;
      // The imported atlas already contains its low-poly shading. Allowing this
      // dense GLB to self-shadow creates severe acne bands on coplanar surfaces.
      object.castShadow = false;
      object.receiveShadow = false;

      const hierarchyName = [object.name, object.parent?.name, object.parent?.parent?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (hierarchyName.includes("nuvole")) {
        object.visible = false;
        return;
      }
      const isLightFixture = /lamp|light|window|finestr|semaforo/.test(hierarchyName);
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      const isDuplicateGroundSlab =
        /^strada/i.test(object.parent?.name || "") &&
        object.geometry.boundingBox?.min.y < -5;
      if (isDuplicateGroundSlab) {
        // Keep the GLB's authored base ground, but separate its coplanar top
        // from the road layer enough to prevent z-fighting stripes.
        object.position.y -= 0.06;
      }
      const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const materials = sourceMaterials.map((sourceMaterial) => {
        const material = sourceMaterial.clone();

        Object.keys(material).forEach((key) => {
          const sourceTexture = material[key];
          if (!sourceTexture?.isTexture) return;
          if (!textureClones.has(sourceTexture)) {
            const texture = sourceTexture.clone();
            prepareTexture(
              texture,
              key === "map" || key === "emissiveMap",
              maxAnisotropy
            );
            textureClones.set(sourceTexture, texture);
          }
          material[key] = textureClones.get(sourceTexture);
        });

        material.roughness = Math.min(material.roughness ?? 1, 0.82);
        if (isLightFixture && material.color) {
          material.emissive = new THREE.Color("#ffb45f");
          material.emissiveIntensity = 0.75;
          material.userData.portfolioLightFixture = true;
        }
        material.needsUpdate = true;
        return material;
      });

      object.material = Array.isArray(object.material) ? materials : materials[0];
    });

    return clone;
  }, [gl, scene]);

  useEffect(() => {
    preparedScene.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (!material?.userData?.portfolioLightFixture) return;
        material.emissiveIntensity = isDay ? 0.08 : 0.75;
        material.needsUpdate = true;
      });
    });
  }, [isDay, preparedScene]);

  return (
    <group>
      <primitive
        object={preparedScene}
        position={CITY_MODEL_TRANSFORM.position}
        rotation={CITY_MODEL_TRANSFORM.rotation}
        scale={CITY_MODEL_TRANSFORM.scale}
      />
      <RigidBody type="fixed" colliders={false}>
        {CITY_MANUAL_COLLIDERS.map((collider) => (
          <CuboidCollider
            key={collider.name}
            args={collider.halfExtents}
            position={collider.center}
            friction={0.35}
            restitution={0}
          />
        ))}
      </RigidBody>
      {SHOW_CITY_COLLIDERS ? (
        <group name="city-collider-debug">
          {[...CITY_MANUAL_COLLIDERS, ...CITY_BOUNDARY_COLLIDERS].map((collider) => (
            <mesh key={`debug-${collider.name}`} position={collider.center}>
              <boxGeometry args={collider.halfExtents.map((extent) => extent * 2)} />
              <meshBasicMaterial color="#ff3b5c" wireframe transparent opacity={0.7} depthTest={false} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
}

useGLTF.preload(CITY_MODEL_PATH);
