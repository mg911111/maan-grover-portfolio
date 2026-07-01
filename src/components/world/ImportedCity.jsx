import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

const IMPORTED_CITY_TRANSFORM = {
  position: [-25.667, 0.001, 30.837],
  rotation: [0, 0, 0],
  scale: 1,
};

const CITY_MODEL_PATH = "/models/city/procedural_city_3.glb";

export function ImportedCity() {
  const { scene } = useGLTF(CITY_MODEL_PATH);

  useEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={IMPORTED_CITY_TRANSFORM.position}
      rotation={IMPORTED_CITY_TRANSFORM.rotation}
      scale={IMPORTED_CITY_TRANSFORM.scale}
    />
  );
}

useGLTF.preload(CITY_MODEL_PATH);
