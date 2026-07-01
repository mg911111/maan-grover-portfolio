import { useGLTF } from "@react-three/drei";
import { Model } from "../assets/Model";
import { MODEL_PATHS } from "../../constants/modelPaths";

// Scale keeps the imported GLB visually proportional to the arcade road width.
const CAR_MODEL_SCALE = 1.35;
// Y offset aligns the GLB origin with the Rapier body without changing physics.
const CAR_MODEL_Y_OFFSET = -0.32;
// Rotation offset corrects the imported model heading if the GLB faces off-axis.
const CAR_MODEL_ROTATION_OFFSET = [0, 0, 0];
// Ride height is the final fine lift so the tyres touch the road instead of clipping.
const CAR_MODEL_RIDE_HEIGHT = 0.08;

const CAR_MODEL_POSITION = [
  0,
  CAR_MODEL_Y_OFFSET + CAR_MODEL_RIDE_HEIGHT,
  0,
];

useGLTF.preload(MODEL_PATHS.car);

export function Car({ boostTrailRef }) {
  return (
    <group name="portfolio-car">
      <Model
        path={MODEL_PATHS.car}
        scale={CAR_MODEL_SCALE}
        rotation={CAR_MODEL_ROTATION_OFFSET}
        position={CAR_MODEL_POSITION}
        shadows="cast"
        fallback={null}
      />
      <BoostTrail boostTrailRef={boostTrailRef} />
    </group>
  );
}

function BoostTrail({ boostTrailRef }) {
  return (
    <group ref={boostTrailRef} visible={false} position={[0, 0.22, -1.86]}>
      {[-0.46, 0.46].map((x) => (
        <mesh key={x} position={[x, 0, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.18, 1.35, 18]} />
          <meshBasicMaterial color="#78d3f0" transparent opacity={0.72} />
        </mesh>
      ))}
      <pointLight position={[0, 0.1, -0.72]} color="#69cff0" intensity={1.1} distance={8} />
    </group>
  );
}
