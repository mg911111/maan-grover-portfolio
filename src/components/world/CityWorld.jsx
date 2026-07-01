import { Text } from "@react-three/drei";
import { CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";
import { KitModel } from "../assets/KitModel";
import { BLOCKY_CHARACTER_KIT } from "../../data/kitAssets";
import {
  NAVIGATION_DESTINATIONS,
  WORLD_COLORS,
} from "../../data/districtMap";
import { INTERACTION_RADIUS } from "../../data/sections";
import { BuildingLabel } from "./BuildingLabel";
import { GlowStrip, MeshBox } from "./GlowStrip";

const ROAD_Y = 0.01;
const MARKING_Y = 0.035;
const SIDEWALK_Y = 0.06;
const ACCESS_Y = 0.112;
const ROAD_COLOR = "#3f474d";
const SIDEWALK_COLOR = "#b9bdba";
const CURB_COLOR = "#e0ded4";

const VERTICAL_ROADS = [
  { x: -48, z: 0, width: 12, length: 196 },
  { x: 0, z: -11, width: 16, length: 170 },
  { x: 48, z: 0, width: 12, length: 196 },
];

const HORIZONTAL_ROADS = [-48, 0, 48].map((z) => ({ x: 0, z, width: 196, depth: 12 }));

const CITY_BLOCKS = [
  [-78, -78, 46, 44], [-26, -78, 30, 44], [26, -78, 30, 44], [78, -78, 46, 44],
  [-78, -24, 46, 34], [-26, -24, 30, 34], [26, -24, 30, 34], [78, -24, 46, 34],
  [-78, 24, 46, 34], [-26, 24, 30, 34], [26, 24, 30, 34], [78, 24, 46, 34],
  [-78, 78, 46, 44], [-26, 78, 30, 44], [26, 78, 30, 44], [78, 78, 46, 44],
];

const BUILDING_STYLES = {
  projects: { label: "PROJECTS", height: 18, color: "#273642", secondary: "#3c5362" },
  skills: { label: "SKILLS LAB", height: 16, color: "#31434a", secondary: "#47716f" },
  experience: { label: "EXPERIENCE", height: 14, color: "#3f3b4d", secondary: "#625d72" },
  resume: { label: "ABOUT", height: 13, color: "#4b4338", secondary: "#746854" },
  socials: { label: "CONTACT", height: 24, color: "#293d49", secondary: "#3d6473" },
  interests: { label: "PLAYGROUND", height: 12, color: "#3f463d", secondary: "#63705d" },
};

const PARK_TREES = [
  [-35, 12, 1.2], [-25, 12, 1.05], [-15, 12, 1.15],
  [-35, 34, 1.1], [-25, 34, 1.2], [-15, 34, 1.05],
  [-36, 22, 1.0], [-14, 23, 1.05],
];

const PEDESTRIANS = [
  { asset: BLOCKY_CHARACTER_KIT.characterA, position: [-62, -13], rotation: Math.PI / 2 },
  { asset: BLOCKY_CHARACTER_KIT.characterD, position: [63, -34], rotation: -Math.PI / 2 },
  { asset: BLOCKY_CHARACTER_KIT.characterH, position: [-64, 53], rotation: Math.PI },
  { asset: BLOCKY_CHARACTER_KIT.characterA, position: [62, 53], rotation: Math.PI },
  { asset: BLOCKY_CHARACTER_KIT.characterD, position: [19, -58], rotation: 0 },
  { asset: BLOCKY_CHARACTER_KIT.characterH, position: [-11, 31], rotation: -Math.PI / 2 },
];

function RoadGrid() {
  const verticalDashes = VERTICAL_ROADS.flatMap((road) =>
    Array.from({ length: Math.floor(road.length / 12) }, (_, index) => ({
      x: road.x,
      z: road.z - road.length * 0.5 + 7 + index * 12,
    }))
  );
  const horizontalDashes = HORIZONTAL_ROADS.flatMap((road) =>
    Array.from({ length: 16 }, (_, index) => ({
      x: -90 + index * 12,
      z: road.z,
    }))
  );

  return (
    <group>
      <MeshBox position={[0, -0.035, 0]} args={[218, 0.05, 218]} color="#737f73" roughness={0.96} receiveShadow />
      {CITY_BLOCKS.map(([x, z, width, depth]) => (
        <group key={`block-${x}-${z}`}>
          <MeshBox position={[x, SIDEWALK_Y, z]} args={[width, 0.08, depth]} color={SIDEWALK_COLOR} roughness={0.9} receiveShadow />
          <MeshBox position={[x, SIDEWALK_Y + 0.043, z - depth * 0.5 + 0.22]} args={[width, 0.035, 0.28]} color={CURB_COLOR} roughness={0.82} />
        </group>
      ))}
      {VERTICAL_ROADS.map(({ x, z, width, length }) => (
        <MeshBox key={`vertical-road-${x}`} position={[x, ROAD_Y, z]} args={[width, 0.04, length]} color={ROAD_COLOR} roughness={0.94} receiveShadow />
      ))}
      {HORIZONTAL_ROADS.map(({ x, z, width, depth }) => (
        <MeshBox key={`horizontal-road-${z}`} position={[x, ROAD_Y + 0.001, z]} args={[width, 0.04, depth]} color={ROAD_COLOR} roughness={0.94} receiveShadow />
      ))}
      {verticalDashes.map(({ x, z }) => (
        <MeshBox key={`v-dash-${x}-${z}`} position={[x, MARKING_Y, z]} args={[0.16, 0.012, 4.4]} color="#eee9d8" roughness={0.72} />
      ))}
      {horizontalDashes.map(({ x, z }) => (
        <MeshBox key={`h-dash-${x}-${z}`} position={[x, MARKING_Y + 0.001, z]} args={[4.4, 0.012, 0.16]} color="#eee9d8" roughness={0.72} />
      ))}
    </group>
  );
}

function Crosswalk({ position, across = "vertical" }) {
  return (
    <group position={[position[0], MARKING_Y + 0.008, position[1]]}>
      {[-3, -2, -1, 0, 1, 2, 3].map((step) => (
        <MeshBox
          key={step}
          position={across === "vertical" ? [0, 0, step * 0.9] : [step * 0.9, 0, 0]}
          args={across === "vertical" ? [10.5, 0.012, 0.48] : [0.48, 0.012, 9.2]}
          color="#f5f1e5"
          roughness={0.7}
          opacity={0.9}
        />
      ))}
    </group>
  );
}

function SpawnPlaza() {
  return (
    <group position={[0, 0, -86]}>
      <mesh position={[0, ROAD_Y + 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[11.5, 11.5, 0.045, 64]} />
        <meshStandardMaterial color="#454e53" roughness={0.92} />
      </mesh>
      <mesh position={[0, MARKING_Y + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.8, 9.15, 64]} />
        <meshStandardMaterial color="#ece6d5" roughness={0.74} />
      </mesh>
      <MeshBox position={[-10.7, SIDEWALK_Y, 0]} args={[2.0, 0.08, 15]} color={SIDEWALK_COLOR} roughness={0.9} />
      <MeshBox position={[10.7, SIDEWALK_Y, 0]} args={[2.0, 0.08, 15]} color={SIDEWALK_COLOR} roughness={0.9} />
    </group>
  );
}

function CityTree({ position, scale = 1 }) {
  return (
    <group position={[position[0], SIDEWALK_Y + 0.04, position[1]]} scale={scale}>
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.23, 2.5, 9]} />
        <meshStandardMaterial color="#6d5038" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.0, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.45, 0]} />
        <meshStandardMaterial color="#47734f" roughness={0.92} />
      </mesh>
    </group>
  );
}

function CentralPark() {
  return (
    <group>
      <MeshBox position={[-25, 0.115, 23]} args={[30, 0.1, 32]} color="#527c54" roughness={0.96} receiveShadow />
      <MeshBox position={[-25, 0.172, 23]} rotation={[0, -0.13, 0]} args={[4.2, 0.025, 29]} color="#d2c9ae" roughness={0.92} receiveShadow />
      <MeshBox position={[-25, 0.174, 23]} rotation={[0, Math.PI / 2, 0]} args={[3.2, 0.025, 26]} color="#d2c9ae" roughness={0.92} receiveShadow />
      <GlowStrip position={[-25, 0.19, 7.2]} args={[20, 0.025, 0.05]} color={WORLD_COLORS.cyan} intensity={0.08} opacity={0.6} />
      {PARK_TREES.map(([x, z, scale]) => <CityTree key={`${x}-${z}`} position={[x, z]} scale={scale} />)}
      {[[-31, 18, 0], [-19, 28, Math.PI]].map(([x, z, rotation]) => (
        <group key={`${x}-${z}`} position={[x, 0.25, z]} rotation={[0, rotation, 0]}>
          <MeshBox args={[3.1, 0.22, 0.7]} color="#8a6848" roughness={0.78} castShadow />
          <MeshBox position={[-1.2, -0.35, 0]} args={[0.18, 0.7, 0.55]} color="#3e4747" roughness={0.6} />
          <MeshBox position={[1.2, -0.35, 0]} args={[0.18, 0.7, 0.55]} color="#3e4747" roughness={0.6} />
        </group>
      ))}
      <Text position={[-25, 0.29, 7.35]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.05} color="#f3efe3" anchorX="center" anchorY="middle" material-side={THREE.DoubleSide}>
        CENTRAL GARDEN
      </Text>
    </group>
  );
}

function WindowGrid({ width, depth, height, color }) {
  const columns = Math.max(3, Math.floor(width / 3.5));
  const rows = Math.max(2, Math.floor(height / 4));
  return (
    <group>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: columns }, (_, column) => {
          const x = (column - (columns - 1) * 0.5) * ((width - 3) / Math.max(1, columns - 1));
          const y = 3.3 + row * ((height - 5) / Math.max(1, rows - 1));
          return <MeshBox key={`${row}-${column}`} position={[x, y, depth * 0.5 + 0.035]} args={[1.45, 1.35, 0.055]} color={color} emissive={color} emissiveIntensity={0.045} roughness={0.28} metalness={0.22} />;
        })
      )}
    </group>
  );
}

function CityBuilding({ destination, active, discovered }) {
  const style = BUILDING_STYLES[destination.id];
  const [width, depth] = destination.colliderSize;
  const accent = destination.accent;
  const signWidth = Math.min(width - 3, Math.max(10, style.label.length * 0.92));

  return (
    <group position={[destination.buildingPosition[0], 0.1, destination.buildingPosition[1]]} rotation={[0, destination.rotationY, 0]}>
      <MeshBox position={[0, style.height * 0.5, 0]} args={[width, style.height, depth]} color={style.color} roughness={0.66} metalness={0.12} castShadow receiveShadow />
      <MeshBox position={[0, style.height - 1.6, -0.2]} args={[width + 0.65, 2.1, depth + 0.65]} color={style.secondary} roughness={0.58} metalness={0.16} castShadow />
      <MeshBox position={[0, 1.45, depth * 0.5 + 0.16]} args={[4.8, 2.7, 0.28]} color="#111b21" roughness={0.3} metalness={0.25} />
      <WindowGrid width={width} depth={depth} height={style.height} color="#91b9c7" />
      <BuildingLabel text={style.label} position={[0, style.height * 0.62, depth * 0.5 + 0.12]} width={signWidth} height={1.25} fontSize={0.72} accent={accent} />
      <GlowStrip position={[0, 0.18, depth * 0.5 + 0.52]} args={[active || discovered ? width * 0.72 : width * 0.38, 0.055, 0.12]} color={accent} intensity={active ? 0.38 : 0.16} opacity={active || discovered ? 0.95 : 0.55} />
      <CuboidCollider args={[width * 0.5, style.height * 0.5, depth * 0.5]} position={[0, style.height * 0.5, 0]} friction={1.1} restitution={0.02} />
    </group>
  );
}

function AccessPad({ destination, selected }) {
  const [x, z] = destination.accessPosition;
  return (
    <group position={[x, ACCESS_Y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.4, 40]} />
        <meshStandardMaterial color="#273238" roughness={0.82} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.45, 3.72, 40]} />
        <meshStandardMaterial color={destination.accent} emissive={destination.accent} emissiveIntensity={selected ? 0.34 : 0.1} />
      </mesh>
      <group position={[4.9, 1.35, 0]}>
        <MeshBox args={[0.18, 2.7, 0.18]} color="#202a2f" metalness={0.2} roughness={0.5} />
        <MeshBox position={[0, 1.15, 0]} args={[1.7, 0.78, 0.16]} color="#172125" roughness={0.35} />
        <Text position={[0, 1.16, 0.095]} fontSize={0.38} color="#f6f1e7" anchorX="center" anchorY="middle">{destination.interactionKey}</Text>
      </group>
      {selected ? (
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 2.2, 8]} />
          <meshStandardMaterial color={destination.accent} emissive={destination.accent} emissiveIntensity={0.55} transparent opacity={0.62} />
        </mesh>
      ) : null}
    </group>
  );
}

function AccessDebug({ selectedDestinationId }) {
  return (
    <group>
      {NAVIGATION_DESTINATIONS.map((destination) => {
        const [x, z] = destination.accessPosition;
        return (
          <mesh key={destination.id} position={[x, ACCESS_Y + 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[INTERACTION_RADIUS - 0.08, INTERACTION_RADIUS + 0.08, 48]} />
            <meshBasicMaterial color={destination.id === selectedDestinationId ? "#ffffff" : destination.accent} transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function Pedestrians() {
  return (
    <group>
      {PEDESTRIANS.map(({ asset, position, rotation }) => (
        <KitModel key={`${position[0]}-${position[1]}`} asset={asset} position={[position[0], 0.1, position[1]]} rotation={[0, rotation, 0]} scale={[1.15, 1.15, 1.15]} shadows="cast" />
      ))}
    </group>
  );
}

export function CityWorld({ activeSectionId, discoveredSectionIds, selectedDestinationId, showAccessDebug }) {
  return (
    <group>
      <RoadGrid />
      <SpawnPlaza />
      {[-48, 0, 48].flatMap((z) => [
        <Crosswalk key={`crosswalk-main-a-${z}`} position={[0, z - 8.5]} across="vertical" />,
        <Crosswalk key={`crosswalk-main-b-${z}`} position={[0, z + 8.5]} across="vertical" />,
      ])}
      <Crosswalk position={[-48, 0]} across="horizontal" />
      <Crosswalk position={[48, 0]} across="horizontal" />
      <CentralPark />
      {NAVIGATION_DESTINATIONS.map((destination) => (
        <CityBuilding key={destination.id} destination={destination} active={destination.id === activeSectionId} discovered={discoveredSectionIds.includes(destination.id)} />
      ))}
      {NAVIGATION_DESTINATIONS.map((destination) => (
        <AccessPad key={destination.id} destination={destination} selected={destination.id === selectedDestinationId} />
      ))}
      <Pedestrians />
      {showAccessDebug ? <AccessDebug selectedDestinationId={selectedDestinationId} /> : null}
    </group>
  );
}
