import { Text } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { INTERACTION_RADIUS } from "../../data/sections";
import { NAVIGATION_DESTINATIONS, WORLD_COLORS } from "../../data/districtMap";
import { BuildingLabel } from "./BuildingLabel";
import { MeshBox } from "./GlowStrip";

const FLOWER_COLORS = ["#bd3f55", "#e36b74", "#f0b2ad", "#f3d2a2"];

function LoopRoad() {
  const dashes = Array.from({ length: 32 }, (_, index) => {
    const angle = (index / 32) * Math.PI * 2;
    return { angle, x: Math.sin(angle) * 50.5, z: Math.cos(angle) * 50.5 };
  });

  return (
    <group>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[42.5, 58.5, 128]} />
        <meshStandardMaterial color="#3f4849" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[42.72, 42.92, 128]} />
        <meshStandardMaterial color="#e9e2cf" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[58.08, 58.28, 128]} />
        <meshStandardMaterial color="#e9e2cf" roughness={0.8} />
      </mesh>
      {dashes.map(({ angle, x, z }, index) => (
        <MeshBox
          key={index}
          position={[x, 0.064, z]}
          rotation={[0, angle, 0]}
          args={[0.16, 0.018, 3.7]}
          color="#e7e1d2"
          roughness={0.78}
        />
      ))}
    </group>
  );
}

function RoseBed({ position, colorOffset = 0 }) {
  const flowers = Array.from({ length: 18 }, (_, index) => ({
    x: -5.2 + (index % 6) * 2.05,
    z: -2.1 + Math.floor(index / 6) * 2.05,
    color: FLOWER_COLORS[(index + colorOffset) % FLOWER_COLORS.length],
  }));

  return (
    <group position={position}>
      <MeshBox position={[0, 0.13, 0]} args={[12.8, 0.24, 7.8]} color="#315d36" roughness={0.96} receiveShadow />
      <MeshBox position={[0, 0.42, -3.8]} args={[13.1, 0.65, 0.42]} color="#3d7042" roughness={0.94} castShadow />
      <MeshBox position={[0, 0.42, 3.8]} args={[13.1, 0.65, 0.42]} color="#3d7042" roughness={0.94} castShadow />
      <MeshBox position={[-6.35, 0.42, 0]} args={[0.42, 0.65, 7.2]} color="#3d7042" roughness={0.94} castShadow />
      <MeshBox position={[6.35, 0.42, 0]} args={[0.42, 0.65, 7.2]} color="#3d7042" roughness={0.94} castShadow />
      {flowers.map((flower, index) => (
        <group key={index} position={[flower.x, 0.55, flower.z]}>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 0.45, 6]} />
            <meshStandardMaterial color="#517e43" roughness={0.9} />
          </mesh>
          <mesh castShadow>
            <dodecahedronGeometry args={[0.28, 0]} />
            <meshStandardMaterial color={flower.color} roughness={0.72} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Bench({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <MeshBox position={[0, 0.58, 0]} args={[3.4, 0.22, 0.72]} color="#8b6242" roughness={0.76} castShadow />
      <MeshBox position={[0, 1.02, 0.28]} args={[3.4, 0.62, 0.16]} color="#9a704b" roughness={0.76} castShadow />
      <MeshBox position={[-1.25, 0.28, 0]} args={[0.16, 0.58, 0.56]} color="#26383a" metalness={0.28} roughness={0.55} />
      <MeshBox position={[1.25, 0.28, 0]} args={[0.16, 0.58, 0.56]} color="#26383a" metalness={0.28} roughness={0.55} />
    </group>
  );
}

function Pergola() {
  return (
    <group position={[0, 0, 0]}>
      {[-2.8, 2.8].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.4, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.28, 4.8, 12]} />
            <meshStandardMaterial color="#e7deca" roughness={0.82} />
          </mesh>
          <mesh position={[x, 4.66, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 1.1, 10]} />
            <meshStandardMaterial color="#527a4e" roughness={0.88} />
          </mesh>
        </group>
      ))}
      <MeshBox position={[0, 4.72, 0]} args={[6.5, 0.34, 0.42]} color="#e7deca" roughness={0.82} castShadow />
      {[-2.4, -1.2, 0, 1.2, 2.4].map((x) => (
        <mesh key={x} position={[x, 4.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.09, 8, 14, Math.PI]} />
          <meshStandardMaterial color="#b94d62" roughness={0.74} />
        </mesh>
      ))}
    </group>
  );
}

function CentralGarden() {
  return (
    <group>
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 0.86, 1]} receiveShadow>
        <circleGeometry args={[32, 96]} />
        <meshStandardMaterial color="#5d8553" roughness={0.98} />
      </mesh>
      <MeshBox position={[0, 0.085, 0]} args={[5, 0.08, 50]} color="#d4cab2" roughness={0.9} receiveShadow />
      <MeshBox position={[0, 0.087, 0]} args={[68, 0.08, 4.5]} color="#d4cab2" roughness={0.9} receiveShadow />
      <RoseBed position={[-18, 0, -10]} />
      <RoseBed position={[18, 0, -10]} colorOffset={1} />
      <RoseBed position={[-18, 0, 10]} colorOffset={2} />
      <RoseBed position={[18, 0, 10]} colorOffset={3} />
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[5.2, 5.2, 0.3, 48]} />
        <meshStandardMaterial color="#c3b79c" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[3.9, 3.9, 0.32, 48]} />
        <meshStandardMaterial color="#658b72" roughness={0.5} metalness={0.08} />
      </mesh>
      <Pergola />
      <Bench position={[-31, 0, -17]} rotation={Math.PI / 2} />
      <Bench position={[31, 0, -17]} rotation={-Math.PI / 2} />
      <Bench position={[-31, 0, 17]} rotation={Math.PI / 2} />
      <Bench position={[31, 0, 17]} rotation={-Math.PI / 2} />
    </group>
  );
}

function FlagPlaza() {
  return (
    <group position={[0, 0, -34]}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[7.2, 7.2, 0.16, 48]} />
        <meshStandardMaterial color="#c9c2b1" roughness={0.86} />
      </mesh>
      <mesh position={[0, 5.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.15, 11, 12]} />
        <meshStandardMaterial color="#d7d9d4" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[1.05, 8.9, 0]}>
        <planeGeometry args={[2.1, 1.05]} />
        <meshStandardMaterial color="#2e6775" side={THREE.DoubleSide} roughness={0.72} />
      </mesh>
      <BuildingLabel text="MAAN GROVER · PORTFOLIO" position={[0, 1.25, 2.3]} width={8.4} height={1.0} fontSize={0.48} accent={WORLD_COLORS.amber} />
    </group>
  );
}

function Evergreen({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.34, 4.4, 8]} />
        <meshStandardMaterial color="#5c4633" roughness={0.95} />
      </mesh>
      {[3.5, 5.2, 6.8].map((y, index) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <coneGeometry args={[2.5 - index * 0.42, 3.8, 10]} />
          <meshStandardMaterial color={index % 2 ? "#2e5c48" : "#35674d"} roughness={0.96} />
        </mesh>
      ))}
    </group>
  );
}

function ScenicBackdrop() {
  const trees = [
    ...Array.from({ length: 10 }, (_, i) => [-82, -72 + i * 16]),
    ...Array.from({ length: 10 }, (_, i) => [82, -72 + i * 16]),
    ...Array.from({ length: 8 }, (_, i) => [-70 + i * 20, 79]),
  ];

  return (
    <group>
      <mesh position={[0, -0.4, 125]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[260, 95]} />
        <meshStandardMaterial color="#5b91a5" roughness={0.48} metalness={0.08} />
      </mesh>
      {[-82, -47, -12, 25, 63, 95].map((x, index) => (
        <mesh key={x} position={[x, 11 + (index % 3) * 3, 157]} scale={[1.7, 0.72, 1]}>
          <coneGeometry args={[18 + (index % 2) * 5, 30, 4]} />
          <meshStandardMaterial color={index % 2 ? "#60786f" : "#526c67"} roughness={0.98} flatShading />
        </mesh>
      ))}
      {trees.map(([x, z], index) => <Evergreen key={`${x}-${z}`} position={[x, 0, z]} scale={0.78 + (index % 3) * 0.09} />)}
    </group>
  );
}

function AccessPad({ destination, selected }) {
  const [x, z] = destination.accessPosition;
  return (
    <group position={[x, 0.09, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.1, 40]} />
        <meshStandardMaterial color="#bdb7a8" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.3, 3.55, 40]} />
        <meshStandardMaterial color={destination.accent} emissive={destination.accent} emissiveIntensity={selected ? 0.3 : 0.06} />
      </mesh>
    </group>
  );
}

function Pavilion({ destination, active, discovered }) {
  const [width, depth] = destination.colliderSize;
  const accent = destination.accent;
  return (
    <group position={[destination.buildingPosition[0], 0, destination.buildingPosition[1]]} rotation={[0, destination.rotationY, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[width / 2, 3.4, depth / 2]} position={[0, 3.4, 0]} friction={0.9} />
        <MeshBox position={[0, 3.25, 0]} args={[width, 6.5, depth]} color="#e1d8c5" roughness={0.82} castShadow receiveShadow />
        <MeshBox position={[0, 6.8, 0]} args={[width + 1.2, 0.65, depth + 1.2]} color="#334c4c" roughness={0.68} castShadow />
        <MeshBox position={[0, 2.1, depth / 2 + 0.08]} args={[4.1, 4.2, 0.2]} color="#425d60" roughness={0.38} metalness={0.12} />
      </RigidBody>
      <BuildingLabel text={destination.label} position={[0, 5.25, depth / 2 + 0.18]} width={15.5} height={1.35} fontSize={0.72} accent={accent} />
      <MeshBox position={[0, 0.22, depth / 2 + 0.42]} args={[active || discovered ? 12 : 7, 0.08, 0.16]} color={accent} emissive={accent} emissiveIntensity={active ? 0.35 : 0.12} />
    </group>
  );
}

function AccessDebug({ selectedDestinationId }) {
  return NAVIGATION_DESTINATIONS.map((destination) => (
    <mesh key={destination.id} position={[destination.accessPosition[0], 0.14, destination.accessPosition[1]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[INTERACTION_RADIUS - 0.08, INTERACTION_RADIUS + 0.08, 48]} />
      <meshBasicMaterial color={destination.id === selectedDestinationId ? "#ffffff" : destination.accent} transparent opacity={0.55} />
    </mesh>
  ));
}

export function RoseGardenWorld({ activeSectionId, discoveredSectionIds = [], selectedDestinationId, showAccessDebug }) {
  return (
    <group>
      <MeshBox position={[0, -0.3, 0]} args={[180, 0.6, 180]} color="#78906b" roughness={0.98} receiveShadow />
      <LoopRoad />
      <CentralGarden />
      <FlagPlaza />
      <ScenicBackdrop />
      {NAVIGATION_DESTINATIONS.map((destination) => (
        <Pavilion key={destination.id} destination={destination} active={destination.id === activeSectionId} discovered={discoveredSectionIds.includes(destination.id)} />
      ))}
      {NAVIGATION_DESTINATIONS.map((destination) => (
        <AccessPad key={destination.id} destination={destination} selected={destination.id === selectedDestinationId} />
      ))}
      {showAccessDebug ? <AccessDebug selectedDestinationId={selectedDestinationId} /> : null}
    </group>
  );
}
