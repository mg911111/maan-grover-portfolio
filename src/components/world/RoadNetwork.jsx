import { Text, useGLTF } from "@react-three/drei";
import { CuboidCollider } from "@react-three/rapier";
import { useMemo } from "react";
import * as THREE from "three";
import { KitModel } from "../assets/KitModel";
import {
  COMMERCIAL_KIT,
  INDUSTRIAL_KIT,
  MODULAR_BUILDING_KIT,
  NATURE_KIT,
  PRELOAD_KIT_ASSETS,
  ROAD_KIT,
} from "../../data/kitAssets";
import {
  DISTRICT_BOUNDS,
  NAVIGATION_DESTINATIONS,
  ROAD_SEGMENTS,
  SKYLINE_BLOCKS,
  WORLD_COLORS,
  getDistrictDestination,
} from "../../data/districtMap";
import { INTERACTION_RADIUS } from "../../data/sections";
import { GlowStrip, MeshBox } from "./GlowStrip";

PRELOAD_KIT_ASSETS.forEach((path) => useGLTF.preload(path));

const ROAD_TILE_SIZE = 12;
const BASE_PLANE_SIZE = Math.max(DISTRICT_BOUNDS.halfWidth, DISTRICT_BOUNDS.halfDepth) * 2.08;
const DISTRICT_CORE_SIZE = [202, 210];
const ROAD_VISUAL_Y = 0.025;
const ROAD_SLAB_Y = 0.028;
const ROAD_NODE_Y = 0.055;
const MARKING_Y = 0.118;
const ACCESS_PAD_Y = 0.112;
const PLAZA_Y = 0.005;
const SIDEWALK_Y = 0.075;
const CURB_Y = 0.09;
const BASE_PLANE_Y = -0.16;
const DISTRICT_CORE_POSITION = [0, -0.075, -1];
const CAMPUS_TILES = [];
const DISTRICT_PLAZAS = [
  { position: [0, PLAZA_Y, 0], args: [34, 0.04, 34], color: "#b4b8ae", accent: WORLD_COLORS.cyan },
  { position: [0, PLAZA_Y, 83], args: [48, 0.04, 26], color: "#bdc0b8", accent: WORLD_COLORS.cyan },
  { position: [68, PLAZA_Y, 36], args: [28, 0.04, 26], color: "#b8bcb3", accent: WORLD_COLORS.cyan },
  { position: [-68, PLAZA_Y, 34], args: [29, 0.04, 25], color: "#bdb9ae", accent: WORLD_COLORS.amber },
  { position: [-64, PLAZA_Y, -58], args: [28, 0.04, 25], color: "#bdb9ae", accent: WORLD_COLORS.amber },
  { position: [68, PLAZA_Y, -56], args: [28, 0.04, 25], color: "#b8bcb3", accent: WORLD_COLORS.cyan },
  { position: [0, PLAZA_Y, -88], args: [36, 0.04, 25], color: "#bdb9ae", accent: WORLD_COLORS.amber },
];
const ROAD_MAIN_STRIPES = [-90, -78, -66, -24, 18, 54, 72, 90];
const ROAD_CROSS_STRIPES = [-52, -24, 24, 52];
const ROAD_SERVICE_STRIPES = [-52, -28, 28, 52];
const CROSSWALK_OFFSETS = [-2.7, -1.62, -0.54, 0.54, 1.62, 2.7];
const SIDEWALK_SIDES = [-1, 1];
const ROAD_NODES = [
  { position: [0, 0], radius: 17.2, round: true },
  { position: [0, 36], size: [30, 24] },
  { position: [0, -56], size: [29, 24] },
  { position: [-68, 36], size: [24, 24] },
  { position: [68, 36], size: [24, 24] },
  { position: [-68, -56], size: [24, 24] },
  { position: [68, -56], size: [24, 24] },
  { position: [0, 72], size: [42, 17] },
  { position: [0, -76], size: [39, 17] },
];
const LANDSCAPE_ZONES = [
  { position: [31, -0.015, 4], args: [36, 0.035, 31], color: "#668d58" },
  { position: [-31, -0.014, 4], args: [34, 0.032, 31], color: "#8fa784" },
  { position: [-88, -0.014, 55], args: [30, 0.032, 58], color: "#7f9a73" },
  { position: [88, -0.014, 55], args: [30, 0.032, 58], color: "#7f9a73" },
  { position: [-88, -0.014, -67], args: [30, 0.032, 50], color: "#819b75" },
  { position: [88, -0.014, -67], args: [30, 0.032, 50], color: "#819b75" },
  { position: [0, -0.014, -104], args: [96, 0.032, 14], color: "#7f9a73" },
  { position: [0, -0.014, 104], args: [108, 0.032, 14], color: "#7f9a73" },
];
const SKYLINE_ASSETS = [
  COMMERCIAL_KIT.skylineA,
  COMMERCIAL_KIT.skylineB,
  COMMERCIAL_KIT.skyscraperA,
  COMMERCIAL_KIT.skyscraperC,
  INDUSTRIAL_KIT.buildingE,
  INDUSTRIAL_KIT.buildingK,
  MODULAR_BUILDING_KIT.towerA,
  MODULAR_BUILDING_KIT.towerC,
];
const SKYLINE_STRIP_HEIGHT_FACTORS = [0.42, 0.62, 0.82];
const EDGE_WALLS = [
  { position: [0, 0.72, 106.8], args: [206, 1.2, 1.1], accent: WORLD_COLORS.amber },
  { position: [-106.8, 0.72, 0], args: [1.1, 1.2, 208], accent: WORLD_COLORS.cyan },
  { position: [106.8, 0.72, 0], args: [1.1, 1.2, 208], accent: WORLD_COLORS.cyan },
  { position: [0, 0.72, -106.8], args: [206, 1.2, 1.1], accent: WORLD_COLORS.amber },
];
const CONSTRUCTION_ZONE_PROPS = [];
const PARK_ZONE = {
  center: [31, 0.118, 4],
  size: [30, 0.035, 25],
  paths: [
    { asset: NATURE_KIT.pathStoneCircle, position: [31, 0.15, 4], rotation: 0, scale: 4.2 },
    { asset: NATURE_KIT.groundPathStraight, position: [24.5, 0.15, 4], rotation: Math.PI / 2, scale: 3.2 },
    { asset: NATURE_KIT.groundPathStraight, position: [37.5, 0.15, 4], rotation: Math.PI / 2, scale: 3.2 },
    { asset: NATURE_KIT.pathStone, position: [31, 0.15, -4], rotation: 0, scale: 3.2 },
    { asset: NATURE_KIT.pathStone, position: [31, 0.15, 12], rotation: Math.PI, scale: 3.2 },
  ],
  grass: [
    { asset: NATURE_KIT.grassLarge, position: [22.5, 0.15, -4.5], rotation: 0, scale: 1.65 },
    { asset: NATURE_KIT.grassLeafsLarge, position: [39.5, 0.15, -4.5], rotation: 0.2, scale: 1.55 },
    { asset: NATURE_KIT.grassLarge, position: [23.5, 0.15, 12.2], rotation: -0.2, scale: 1.5 },
    { asset: NATURE_KIT.grass, position: [39.5, 0.15, 12], rotation: 0.12, scale: 1.5 },
    { asset: NATURE_KIT.grassLeafsLarge, position: [31, 0.15, -9], rotation: 0.45, scale: 1.35 },
    { asset: NATURE_KIT.grass, position: [31, 0.15, 17], rotation: -0.24, scale: 1.35 },
  ],
  trees: [
    { asset: NATURE_KIT.treeOak, position: [22, 0.14, -5.6], rotation: 0, scale: 2.7, radius: 0.95 },
    { asset: NATURE_KIT.treeDefault, position: [40.5, 0.14, -5.4], rotation: 0.15, scale: 2.55, radius: 0.95 },
    { asset: NATURE_KIT.treeSmall, position: [23.2, 0.14, 12.4], rotation: -0.08, scale: 2.35, radius: 0.82 },
    { asset: NATURE_KIT.treeDetailed, position: [40.2, 0.14, 12.1], rotation: 0.22, scale: 2.5, radius: 0.95 },
  ],
  shrubs: [
    { asset: NATURE_KIT.bushLarge, position: [25.8, 0.14, -8.6], rotation: 0, scale: 1.85 },
    { asset: NATURE_KIT.bushDetailed, position: [36.2, 0.14, -8.6], rotation: 0, scale: 1.85 },
    { asset: NATURE_KIT.bush, position: [25.2, 0.14, 16], rotation: 0.2, scale: 1.75 },
    { asset: NATURE_KIT.bushLarge, position: [36.8, 0.14, 16], rotation: -0.18, scale: 1.75 },
    { asset: NATURE_KIT.rockSmallFlat, position: [27.7, 0.15, 8.5], rotation: 0.45, scale: 1.45 },
    { asset: NATURE_KIT.rockSmall, position: [34.6, 0.15, -1.8], rotation: -0.38, scale: 1.25 },
  ],
};
const CAMPUS_LAMPS = [
  { position: [-12, 14], rotation: 0.1 },
  { position: [12, 14], rotation: -0.1 },
  { position: [-12, -14], rotation: Math.PI },
  { position: [12, -14], rotation: Math.PI },
  { position: [-7, 68], rotation: 0 },
  { position: [7, -72], rotation: Math.PI },
];
const GREEN_ISLANDS = [
  {
    anchor: [-23, 58],
    rotation: 0.25,
    items: [
      { asset: NATURE_KIT.grassLarge, offset: [0, 0], scale: 1.15 },
      { asset: NATURE_KIT.bushDetailed, offset: [-1.2, 0.7], scale: 1.15 },
      { asset: NATURE_KIT.rockSmallFlat, offset: [1.25, -0.8], scale: 0.85 },
    ],
  },
  {
    anchor: [23, 58],
    rotation: -0.18,
    items: [
      { asset: NATURE_KIT.grassLeafsLarge, offset: [0, 0], scale: 1.1 },
      { asset: NATURE_KIT.bush, offset: [1.15, 0.55], scale: 1.1 },
      { asset: NATURE_KIT.rockSmall, offset: [-1.1, -0.65], scale: 0.75 },
    ],
  },
  {
    anchor: [-49, 45],
    rotation: 0.36,
    items: [
      { asset: NATURE_KIT.grassLarge, offset: [0, 0], scale: 1.1 },
      { asset: NATURE_KIT.bushLarge, offset: [-1.05, 0.4], scale: 1.05 },
      { asset: NATURE_KIT.rockSmallFlat, offset: [1, -0.55], scale: 0.75 },
    ],
  },
  {
    anchor: [49, 45],
    rotation: -0.36,
    items: [
      { asset: NATURE_KIT.grassLarge, offset: [0, 0], scale: 1.1 },
      { asset: NATURE_KIT.bushLarge, offset: [1.05, 0.4], scale: 1.05 },
      { asset: NATURE_KIT.rockSmallFlat, offset: [-1, -0.55], scale: 0.75 },
    ],
  },
  {
    anchor: [-49, -65],
    rotation: -0.2,
    items: [
      { asset: NATURE_KIT.grassLeafsLarge, offset: [0, 0], scale: 1.05 },
      { asset: NATURE_KIT.bushDetailed, offset: [-1, -0.45], scale: 1.0 },
      { asset: NATURE_KIT.rockSmall, offset: [1, 0.55], scale: 0.7 },
    ],
  },
  {
    anchor: [49, -65],
    rotation: 0.2,
    items: [
      { asset: NATURE_KIT.grassLeafsLarge, offset: [0, 0], scale: 1.05 },
      { asset: NATURE_KIT.bushDetailed, offset: [1, -0.45], scale: 1.0 },
      { asset: NATURE_KIT.rockSmall, offset: [-1, 0.55], scale: 0.7 },
    ],
  },
];
const PARKING_MARKINGS = [
  { position: [-24, 56], rotation: 0, count: 3, accent: WORLD_COLORS.cyan },
  { position: [24, 56], rotation: 0, count: 3, accent: WORLD_COLORS.amber },
  { position: [-54, 20], rotation: Math.PI / 2, count: 3, accent: WORLD_COLORS.amber },
  { position: [54, 20], rotation: -Math.PI / 2, count: 3, accent: WORLD_COLORS.cyan },
  { position: [-54, -72], rotation: Math.PI / 2, count: 3, accent: WORLD_COLORS.cyan },
  { position: [54, -72], rotation: -Math.PI / 2, count: 3, accent: WORLD_COLORS.amber },
];
const ACCESS_PAD_DIMENSIONS = {
  projects: { size: [18, 12], rotation: 0 },
  skills: { size: [18, 12], rotation: Math.PI / 2 },
  experience: { size: [18, 12], rotation: Math.PI / 2 },
  resume: { size: [18, 12], rotation: Math.PI / 2 },
  socials: { size: [18, 12], rotation: Math.PI / 2 },
  interests: { size: [18, 12], rotation: 0 },
};
const CONE_GRADE = {
  color: "#c9833b",
  colorStrength: 0.24,
  roughness: 0.62,
};
const KIT_GRADES = {
  road: {
    color: WORLD_COLORS.road,
    colorStrength: 0.78,
    roughness: 0.93,
    metalness: 0.03,
  },
  plaza: {
    color: "#313d46",
    colorStrength: 0.72,
    roughness: 0.86,
    metalness: 0.06,
  },
  prop: {
    color: "#35434d",
    colorStrength: 0.44,
    roughness: 0.68,
    metalness: 0.08,
  },
  skyline: {
    color: "#172633",
    colorStrength: 0.84,
    roughness: 0.72,
    metalness: 0.04,
  },
};

const DISTRICT_BLOCKS = [];

const FEATURED_INTERSECTIONS = [
  { position: [0, 0], asset: ROAD_KIT.roundabout, scale: 26, rotation: 0, clearRadius: 15 },
  { position: [0, 36], asset: ROAD_KIT.crossroad, scale: 15, rotation: 0, clearRadius: 8.5 },
  { position: [0, -56], asset: ROAD_KIT.crossroad, scale: 14, rotation: 0, clearRadius: 8 },
  { position: [-68, 36], asset: ROAD_KIT.crossroad, scale: 13.5, rotation: 0, clearRadius: 7.5 },
  { position: [68, 36], asset: ROAD_KIT.crossroad, scale: 13.5, rotation: 0, clearRadius: 7.5 },
  { position: [-68, -56], asset: ROAD_KIT.crossroad, scale: 13.5, rotation: 0, clearRadius: 7.5 },
  { position: [68, -56], asset: ROAD_KIT.crossroad, scale: 13.5, rotation: 0, clearRadius: 7.5 },
];

const ROAD_CROSSINGS = [
  { position: [0, 60], rotation: 0, clearRadius: 6.5 },
  { position: [0, -32], rotation: 0, clearRadius: 6.5 },
  { position: [-42, 36], rotation: Math.PI / 2, clearRadius: 6.5 },
  { position: [42, 36], rotation: Math.PI / 2, clearRadius: 6.5 },
  { position: [-42, -56], rotation: Math.PI / 2, clearRadius: 6.5 },
  { position: [42, -56], rotation: Math.PI / 2, clearRadius: 6.5 },
];

const DESTINATION_DRIVEWAYS = [
  { position: [0, 73], rotation: Math.PI, scale: 15, clearRadius: 8.5 },
  { position: [68, 24], rotation: -Math.PI / 2, scale: 12.5, clearRadius: 7 },
  { position: [-68, 22], rotation: Math.PI / 2, scale: 12.5, clearRadius: 7 },
  { position: [-64, -70], rotation: Math.PI / 2, scale: 12, clearRadius: 6.8 },
  { position: [68, -68], rotation: -Math.PI / 2, scale: 12, clearRadius: 6.8 },
  { position: [0, -76], rotation: 0, scale: 13, clearRadius: 7.2 },
];

const ROAD_RESERVED_AREAS = [
  ...FEATURED_INTERSECTIONS,
  ...ROAD_CROSSINGS,
  ...DESTINATION_DRIVEWAYS,
];

function isInsideReservedRoadArea(position) {
  return ROAD_RESERVED_AREAS.some(({ position: center, clearRadius }) => {
    const dx = position[0] - center[0];
    const dz = position[1] - center[1];
    return dx * dx + dz * dz < clearRadius * clearRadius;
  });
}

function RoadFallback({ position, rotation = [0, 0, 0], scale = ROAD_TILE_SIZE }) {
  return (
    <MeshBox
      position={position}
      rotation={rotation}
      args={[scale * 0.96, 0.03, scale * 0.96]}
      color={WORLD_COLORS.road}
      roughness={0.9}
    />
  );
}

function RoadTile({ asset, position, rotation = 0, scale = ROAD_TILE_SIZE, materialGrade = KIT_GRADES.road }) {
  const rotationArray = [0, rotation, 0];

  return (
    <KitModel
      asset={asset}
      position={[position[0], ROAD_VISUAL_Y, position[1]]}
      rotation={rotationArray}
      scale={[scale, scale, scale]}
      shadows="receive"
      materialGrade={materialGrade}
      fallback={<RoadFallback position={[position[0], ROAD_VISUAL_Y, position[1]]} rotation={rotationArray} scale={scale} />}
    />
  );
}

function RoadRun({ start, end, asset = ROAD_KIT.straight, scale = ROAD_TILE_SIZE }) {
  const tiles = useMemo(() => {
    const dx = end[0] - start[0];
    const dz = end[1] - start[1];
    const length = Math.hypot(dx, dz);
    const count = Math.max(2, Math.round(length / scale) + 1);
    const rotation = Math.atan2(dx, dz);

    return Array.from({ length: count }, (_, index) => {
      const t = count === 1 ? 0 : index / (count - 1);
      return {
        key: `${start[0]}-${start[1]}-${end[0]}-${end[1]}-${index}`,
        position: [
          start[0] + dx * t,
          start[1] + dz * t,
        ],
        rotation,
      };
    }).filter((tile) => !isInsideReservedRoadArea(tile.position));
  }, [start, end, scale]);

  return (
    <group>
      {tiles.map((tile) => (
        <RoadTile
          key={tile.key}
          asset={asset}
          position={tile.position}
          rotation={tile.rotation}
          scale={scale}
        />
      ))}
    </group>
  );
}

function SegmentSidewalks({ start, end, width }) {
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = Math.hypot(dx, dz) + 5;
  const rotation = Math.atan2(dx, dz);
  const sideOffset = width * 0.5 + 2.1;
  const nx = Math.cos(rotation);
  const nz = -Math.sin(rotation);
  const centerX = (start[0] + end[0]) * 0.5;
  const centerZ = (start[1] + end[1]) * 0.5;

  return (
    <group>
      {SIDEWALK_SIDES.map((side) => (
        <group key={side}>
          <MeshBox
            position={[centerX + nx * sideOffset * side, SIDEWALK_Y, centerZ + nz * sideOffset * side]}
            rotation={[0, rotation, 0]}
            args={[2.4, 0.04, length]}
            color={WORLD_COLORS.concrete}
            roughness={0.84}
            metalness={0.05}
            receiveShadow
          />
          <MeshBox
            position={[centerX + nx * (width * 0.5 + 0.72) * side, CURB_Y, centerZ + nz * (width * 0.5 + 0.72) * side]}
            rotation={[0, rotation, 0]}
            args={[0.26, 0.045, length]}
            color={WORLD_COLORS.curb}
            roughness={0.78}
            metalness={0.08}
            receiveShadow
          />
        </group>
      ))}
    </group>
  );
}

function CityDistrictBase() {
  return (
    <group>
      <MeshBox
        position={DISTRICT_CORE_POSITION}
        args={[DISTRICT_CORE_SIZE[0], 0.075, DISTRICT_CORE_SIZE[1]]}
        color={WORLD_COLORS.groundPanel}
        roughness={0.9}
        metalness={0.04}
        receiveShadow
      />
      <MeshBox
        position={[0, -0.08, -115]}
        args={[228, 0.05, 14]}
        color={WORLD_COLORS.groundEdge}
        roughness={0.88}
        receiveShadow
      />
      <MeshBox
        position={[0, -0.08, 112]}
        args={[228, 0.05, 12]}
        color={WORLD_COLORS.groundEdge}
        roughness={0.88}
        receiveShadow
      />
      <MeshBox
        position={[-113, -0.08, 0]}
        args={[12, 0.05, 222]}
        color={WORLD_COLORS.groundEdge}
        roughness={0.88}
        receiveShadow
      />
      <MeshBox
        position={[113, -0.08, 0]}
        args={[12, 0.05, 222]}
        color={WORLD_COLORS.groundEdge}
        roughness={0.88}
        receiveShadow
      />
      {DISTRICT_BLOCKS.map(({ position, args, accent }, index) => (
        <group key={`block-${index}`}>
          <MeshBox
            position={position}
            args={args}
            color={index % 3 === 0 ? "#263741" : "#1f2d36"}
            roughness={0.86}
            metalness={0.06}
            receiveShadow
          />
          <GlowStrip
            position={[position[0], 0.018, position[2] + args[2] * 0.5 - 0.32]}
            args={[args[0] * 0.7, 0.04, 0.05]}
            color={accent}
            intensity={0.1}
            opacity={0.58}
          />
          <GlowStrip
            position={[position[0] - args[0] * 0.5 + 0.34, 0.02, position[2]]}
            args={[0.045, 0.035, args[2] * 0.72]}
            color={accent}
            intensity={0.06}
            opacity={0.42}
          />
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_PLANE_Y, -126]} receiveShadow>
        <planeGeometry args={[250, 42]} />
        <meshStandardMaterial color="#879985" roughness={0.78} metalness={0.02} />
      </mesh>
    </group>
  );
}

function SidewalkNetwork() {
  return (
    <group>
      {ROAD_SEGMENTS.map((road) => (
        <SegmentSidewalks
          key={`sidewalk-${road.id}`}
          start={road.start}
          end={road.end}
          width={road.width + (road.width >= 12 ? 5.2 : 4.4)}
        />
      ))}
    </group>
  );
}

function LandscapeZones() {
  return (
    <group>
      {LANDSCAPE_ZONES.map(({ position, args, color }) => (
        <MeshBox
          key={`landscape-zone-${position[0]}-${position[2]}`}
          position={position}
          args={args}
          color={color}
          roughness={0.92}
          metalness={0.02}
          receiveShadow
        />
      ))}
    </group>
  );
}

function CustomRoadSegment({ start, end, width }) {
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = Math.hypot(dx, dz);
  const rotation = Math.atan2(dx, dz);
  const centerX = (start[0] + end[0]) * 0.5;
  const centerZ = (start[1] + end[1]) * 0.5;

  return (
    <MeshBox
      position={[centerX, ROAD_SLAB_Y, centerZ]}
      rotation={[0, rotation, 0]}
      args={[width, 0.045, length]}
      color={WORLD_COLORS.road}
      roughness={0.88}
      metalness={0.04}
      receiveShadow
    />
  );
}

function CustomRoadNode({ position, size, radius, round = false }) {
  if (round) {
    return (
      <group>
        <mesh position={[position[0], ROAD_NODE_Y, position[1]]} rotation={[0, 0, 0]} receiveShadow>
          <cylinderGeometry args={[radius, radius, 0.048, 72]} />
          <meshStandardMaterial color={WORLD_COLORS.roadSoft} roughness={0.86} metalness={0.04} />
        </mesh>
        <mesh position={[position[0], ROAD_NODE_Y + 0.028, position[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[7.3, 12.6, 72]} />
          <meshStandardMaterial color="#aeb4aa" roughness={0.82} metalness={0.03} />
        </mesh>
      </group>
    );
  }

  return (
    <MeshBox
      position={[position[0], ROAD_NODE_Y, position[1]]}
      args={[size[0], 0.048, size[1]]}
      color={WORLD_COLORS.roadSoft}
      roughness={0.86}
      metalness={0.04}
      receiveShadow
    />
  );
}

function CustomRoadNetwork() {
  return (
    <group>
      {ROAD_SEGMENTS.map((road) => (
        <CustomRoadSegment
          key={`custom-road-${road.id}`}
          start={road.start}
          end={road.end}
          width={road.width}
        />
      ))}
      {ROAD_NODES.map((node) => (
        <CustomRoadNode key={`custom-road-node-${node.position[0]}-${node.position[1]}`} {...node} />
      ))}
    </group>
  );
}

function CampusGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_PLANE_Y, 0]} receiveShadow>
        <planeGeometry args={[BASE_PLANE_SIZE, BASE_PLANE_SIZE]} />
        <meshStandardMaterial color={WORLD_COLORS.groundBase} roughness={0.94} metalness={0.02} />
      </mesh>
      <CityDistrictBase />
      <LandscapeZones />
      {CAMPUS_TILES.map(([x, z, asset], index) => (
        <KitModel
          key={`${x}-${z}`}
          asset={asset}
          position={[x, PLAZA_Y, z]}
          rotation={[0, index % 2 ? Math.PI / 2 : 0, 0]}
          scale={[18, 18, 18]}
          shadows="receive"
          materialGrade={KIT_GRADES.plaza}
        />
      ))}
    </group>
  );
}

function RoadIntersections() {
  return (
    <group>
      {FEATURED_INTERSECTIONS.map(({ position, asset, scale, rotation }) => (
        <RoadTile
          key={`${position[0]}-${position[1]}`}
          asset={asset}
          position={position}
          rotation={rotation}
          scale={scale}
        />
      ))}
      {ROAD_CROSSINGS.map(({ position, rotation }) => (
        <RoadTile
          key={`crossing-${position[0]}-${position[1]}`}
          asset={ROAD_KIT.crossing}
          position={position}
          rotation={rotation}
          scale={ROAD_TILE_SIZE}
        />
      ))}
    </group>
  );
}

function DistrictPlazas() {
  return (
    <group>
      {DISTRICT_PLAZAS.map(({ position, args, color, accent }) => (
        <group key={`plaza-${position[0]}-${position[2]}`}>
          <MeshBox position={position} args={args} color={color} roughness={0.82} metalness={0.06} receiveShadow />
          <GlowStrip
            position={[position[0], position[1] + 0.04, position[2] + args[2] * 0.5 - 0.34]}
            args={[args[0] * 0.58, 0.045, 0.055]}
            color={accent}
            intensity={0.12}
            opacity={0.72}
          />
        </group>
      ))}
    </group>
  );
}

function DestinationDriveways() {
  return (
    <group>
      {DESTINATION_DRIVEWAYS.map(({ position, rotation, scale }) => (
        <RoadTile
          key={`driveway-${position[0]}-${position[1]}`}
          asset={ROAD_KIT.drivewayDouble}
          position={position}
          rotation={rotation}
          scale={scale}
        />
      ))}
    </group>
  );
}

function AccessPad({ destination }) {
  const { id, title, interactionKey, accessPosition } = destination;
  const { size, rotation } = ACCESS_PAD_DIMENSIONS[id] || ACCESS_PAD_DIMENSIONS.projects;
  const color = destination.accent || WORLD_COLORS.cyan;

  return (
    <group key={`access-pad-${id}`} position={[accessPosition[0], ACCESS_PAD_Y, accessPosition[1]]} rotation={[0, rotation, 0]}>
      <MeshBox
        args={[size[0], 0.01, size[1]]}
        color="#d6d3c5"
        opacity={0.9}
        roughness={0.86}
        metalness={0.04}
        receiveShadow
      />
      <GlowStrip
        position={[0, 0.018, size[1] * 0.5 - 0.18]}
        args={[size[0] * 0.82, 0.018, 0.045]}
        color={color}
        intensity={0.1}
        opacity={0.76}
      />
      <GlowStrip
        position={[0, 0.018, -size[1] * 0.5 + 0.18]}
        args={[size[0] * 0.82, 0.018, 0.045]}
        color={color}
        intensity={0.08}
        opacity={0.58}
      />
      <GlowStrip
        position={[-size[0] * 0.5 + 0.18, 0.018, 0]}
        args={[0.045, 0.018, size[1] * 0.82]}
        color={color}
        intensity={0.08}
        opacity={0.58}
      />
      <GlowStrip
        position={[size[0] * 0.5 - 0.18, 0.018, 0]}
        args={[0.045, 0.018, size[1] * 0.82]}
        color={color}
        intensity={0.08}
        opacity={0.58}
      />
      <Text
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.05}
        letterSpacing={0}
        anchorX="center"
        anchorY="middle"
        color={WORLD_COLORS.text}
        material-side={THREE.FrontSide}
      >
        {`${interactionKey} · ${title.toUpperCase()}`}
      </Text>
    </group>
  );
}

function AccessPads() {
  return (
    <group>
      {NAVIGATION_DESTINATIONS.map((destination) => (
        <AccessPad key={`access-pad-${destination.id}`} destination={destination} />
      ))}
    </group>
  );
}

function RoadStripe({ position, length = 3.6, rotation = 0, color = WORLD_COLORS.lane, opacity = 0.48 }) {
  return (
    <MeshBox
      position={[position[0], MARKING_Y, position[1]]}
      rotation={[0, rotation, 0]}
      args={[0.16, 0.018, length]}
      color={color}
      opacity={opacity}
      roughness={0.72}
      receiveShadow
    />
  );
}

function Crosswalk({ position, rotation = 0, width = 7.2 }) {
  return (
    <group position={[position[0], MARKING_Y, position[1]]} rotation={[0, rotation, 0]}>
      {CROSSWALK_OFFSETS.map((x) => (
        <MeshBox
          key={x}
          position={[x, 0, 0]}
          args={[0.38, 0.018, width]}
          color={WORLD_COLORS.lane}
          opacity={0.38}
          roughness={0.76}
          receiveShadow
        />
      ))}
    </group>
  );
}

function RoadArrow({ position, rotation = 0, accent = WORLD_COLORS.cyan }) {
  return (
    <group position={[position[0], MARKING_Y, position[1]]} rotation={[0, rotation, 0]}>
      <MeshBox args={[0.22, 0.018, 2.15]} position={[0, 0, -0.2]} color={accent} opacity={0.34} roughness={0.7} />
      <MeshBox args={[0.18, 0.018, 1.1]} position={[-0.38, 0, 0.76]} rotation={[0, -0.72, 0]} color={accent} opacity={0.34} roughness={0.7} />
      <MeshBox args={[0.18, 0.018, 1.1]} position={[0.38, 0, 0.76]} rotation={[0, 0.72, 0]} color={accent} opacity={0.34} roughness={0.7} />
    </group>
  );
}

function RoadMarkings() {
  return (
    <group>
      {ROAD_MAIN_STRIPES.map((z) => (
        <RoadStripe key={`main-stripe-${z}`} position={[0, z]} />
      ))}
      {ROAD_CROSS_STRIPES.map((x) => (
        <RoadStripe key={`north-stripe-${x}`} position={[x, 36]} rotation={Math.PI / 2} length={3.4} />
      ))}
      {ROAD_CROSS_STRIPES.map((x) => (
        <RoadStripe key={`south-stripe-${x}`} position={[x, -56]} rotation={Math.PI / 2} length={3.2} />
      ))}
      {ROAD_SERVICE_STRIPES.map((x) => (
        <RoadStripe key={`north-service-stripe-${x}`} position={[x, 72]} rotation={Math.PI / 2} length={3.0} opacity={0.38} />
      ))}
      {ROAD_SERVICE_STRIPES.map((x) => (
        <RoadStripe key={`south-service-stripe-${x}`} position={[x, -76]} rotation={Math.PI / 2} length={3.0} opacity={0.38} />
      ))}
      <Crosswalk position={[0, 18]} rotation={Math.PI / 2} />
      <Crosswalk position={[0, -38]} rotation={Math.PI / 2} />
      <Crosswalk position={[-47, 36]} />
      <Crosswalk position={[47, 36]} />
      <Crosswalk position={[-47, -56]} />
      <Crosswalk position={[47, -56]} />
      <Crosswalk position={[0, 70]} rotation={Math.PI / 2} width={8.5} />
      <Crosswalk position={[0, -76]} rotation={Math.PI / 2} width={8.0} />
      <Crosswalk position={[56, 36]} width={7.6} />
      <Crosswalk position={[-56, 34]} width={7.6} />
      <RoadArrow position={[0, 9.5]} accent={WORLD_COLORS.cyan} />
      <RoadArrow position={[0, 51]} accent={WORLD_COLORS.amber} />
      <RoadArrow position={[0, -69]} rotation={Math.PI} accent={WORLD_COLORS.amber} />
      <RoadArrow position={[54, 36]} rotation={Math.PI / 2} accent={WORLD_COLORS.cyan} />
      <RoadArrow position={[-54, 36]} rotation={-Math.PI / 2} accent={WORLD_COLORS.amber} />
      <RoadArrow position={[34, 72]} rotation={Math.PI / 2} accent={WORLD_COLORS.cyan} />
      <RoadArrow position={[-34, -76]} rotation={-Math.PI / 2} accent={WORLD_COLORS.amber} />
    </group>
  );
}

function AccessDebug({ selectedDestinationId }) {
  if (!import.meta.env.DEV) return null;

  return (
    <group>
      {NAVIGATION_DESTINATIONS.map((destination) => {
        const { id, accessPosition } = destination;
        const selected = id === selectedDestinationId;
        const color = selected ? WORLD_COLORS.amber : destination.accent || WORLD_COLORS.cyan;
        const [buildingX, buildingZ] = destination.buildingPosition || [0, 0];

        return (
          <group key={`access-debug-${id}`}>
            <group position={[accessPosition[0], 0.13, accessPosition[1]]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[selected ? 0.72 : 0.46, 24]} />
                <meshBasicMaterial color={color} transparent opacity={selected ? 0.72 : 0.42} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[INTERACTION_RADIUS - 0.08, INTERACTION_RADIUS + 0.08, 48]} />
                <meshBasicMaterial color={color} transparent opacity={selected ? 0.34 : 0.16} />
              </mesh>
            </group>
            <mesh position={[buildingX, 0.16, buildingZ]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.15, 1.45, 24]} />
              <meshBasicMaterial color="#ff4f6d" transparent opacity={0.62} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function SpawnPlaza() {
  return (
    <group>
      <mesh position={[0, MARKING_Y + 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[7.8, 14.2, 64]} />
        <meshStandardMaterial color="#bfc1b5" roughness={0.82} metalness={0.04} />
      </mesh>
      <mesh position={[0, MARKING_Y + 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[5.0, 5.62, 56]} />
        <meshStandardMaterial color={WORLD_COLORS.cyan} roughness={0.62} transparent opacity={0.36} />
      </mesh>
      <mesh position={[0, MARKING_Y + 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[11.8, 12.15, 64]} />
        <meshStandardMaterial color={WORLD_COLORS.amber} roughness={0.62} transparent opacity={0.28} />
      </mesh>
      <MeshBox position={[0, CURB_Y, 12.7]} args={[22, 0.045, 0.58]} color={WORLD_COLORS.curb} roughness={0.74} receiveShadow />
      <GlowStrip position={[-6.4, CURB_Y + 0.04, 12.95]} args={[4.8, 0.04, 0.08]} color={WORLD_COLORS.cyan} intensity={0.18} />
      <GlowStrip position={[6.4, CURB_Y + 0.04, 12.95]} args={[4.8, 0.04, 0.08]} color={WORLD_COLORS.amber} intensity={0.16} />
      <group position={[9.8, 0, 14.6]} rotation={[0, 0.12, 0]}>
        <KitModel
          asset={ROAD_KIT.lightSquareDouble}
          position={[0, 0.06, 0]}
          scale={[4.2, 4.2, 4.2]}
          shadows="all"
          materialGrade={KIT_GRADES.prop}
        />
        <mesh position={[0, 4.08, 0]}>
          <sphereGeometry args={[0.16, 12, 8]} />
          <meshStandardMaterial color="#ffe7a6" emissive="#c9893a" emissiveIntensity={0.24} />
        </mesh>
      </group>
    </group>
  );
}

function StreetLamp({ position, warm = false, rotation = 0 }) {
  const color = warm ? "#ffbd75" : "#ffd08a";
  const asset = warm ? ROAD_KIT.lightCurved : ROAD_KIT.lightSquare;

  return (
    <group position={[position[0], 0.04, position[1]]} rotation={[0, rotation, 0]}>
      <KitModel asset={asset} scale={[5.2, 5.2, 5.2]} shadows="all" materialGrade={KIT_GRADES.prop} />
      <mesh position={[0, 4.16, -0.2]}>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshStandardMaterial color="#ffe1a8" emissive={color} emissiveIntensity={0.28} />
      </mesh>
    </group>
  );
}

function LightPools() {
  return (
    <group>
      {LIGHT_POOLS.map(({ position: [x, z], radius, opacity }) => (
        <group key={`light-pool-${x}-${z}`} position={[x, MARKING_Y + 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <circleGeometry args={[radius, 36]} />
            <meshBasicMaterial color="#ffbd75" transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, 0, 0.003]}>
            <circleGeometry args={[radius * 0.48, 32]} />
            <meshBasicMaterial color="#ffe0a3" transparent opacity={opacity * 0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ParkingMarkings() {
  return (
    <group>
      {PARKING_MARKINGS.map(({ position, rotation, count, accent }) => (
        <group key={`parking-${position[0]}-${position[1]}`} position={[position[0], MARKING_Y + 0.008, position[1]]} rotation={[0, rotation, 0]}>
          {Array.from({ length: count }, (_, index) => (
            <group key={`space-${index}`} position={[(index - (count - 1) * 0.5) * 3.2, 0, 0]}>
              <MeshBox args={[0.08, 0.014, 4.9]} position={[-1.22, 0, 0]} color={WORLD_COLORS.lane} opacity={0.22} roughness={0.78} />
              <MeshBox args={[0.08, 0.014, 4.9]} position={[1.22, 0, 0]} color={WORLD_COLORS.lane} opacity={0.22} roughness={0.78} />
              <MeshBox args={[2.36, 0.014, 0.08]} position={[0, 0, 2.42]} color={accent} opacity={0.18} roughness={0.78} />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function DestinationBeacon({ selectedDestinationId }) {
  const destination = getDistrictDestination(selectedDestinationId);
  if (!destination) return null;
  const [x, z] = destination.accessPosition;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.035, 32]} />
        <meshStandardMaterial
          color={destination.accent}
          emissive={destination.accent}
          emissiveIntensity={0.2}
          transparent
          opacity={0.22}
        />
      </mesh>
      <mesh position={[0, 1.52, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 2.15, 10]} />
        <meshStandardMaterial
          color={destination.accent}
          emissive={destination.accent}
          emissiveIntensity={0.34}
          transparent
          opacity={0.42}
        />
      </mesh>
      <mesh position={[0, 2.72, 0]}>
        <sphereGeometry args={[0.22, 14, 8]} />
        <meshStandardMaterial
          color={destination.accent}
          emissive={destination.accent}
          emissiveIntensity={0.62}
          transparent
          opacity={0.68}
        />
      </mesh>
      <pointLight position={[0, 2.5, 0]} color={destination.accent} intensity={0.16} distance={12} />
    </group>
  );
}

function GuideDots({ selectedDestinationId }) {
  const destination = getDistrictDestination(selectedDestinationId);
  const dots = useMemo(() => {
    if (!destination) return [];
    const [x, z] = destination.accessPosition;
    const count = 7;
    return Array.from({ length: count }, (_, index) => {
      const t = (index + 1) / (count + 1);
      return [x * t, z * t];
    });
  }, [destination]);

  if (!destination) return null;

  return (
    <group>
      {dots.map(([x, z], index) => (
        <mesh key={`${x}-${z}`} position={[x, 0.245, z]}>
          <cylinderGeometry args={[0.3 - index * 0.015, 0.3 - index * 0.015, 0.022, 18]} />
          <meshStandardMaterial
            color={destination.accent}
            emissive={destination.accent}
            emissiveIntensity={0.1}
            transparent
            opacity={0.28}
          />
        </mesh>
      ))}
    </group>
  );
}

function Skyline() {
  return (
    <group>
      {SKYLINE_BLOCKS.map(({ position, size }, index) => (
        <group key={`${position[0]}-${position[1]}`}>
          <KitModel
            asset={SKYLINE_ASSETS[index % SKYLINE_ASSETS.length]}
            position={[position[0], 0.02, position[1]]}
            rotation={[0, index % 2 ? Math.PI : Math.PI / 2, 0]}
            scale={[size[0] * 0.9, size[1] * 0.7, size[2] * 0.9]}
            shadows="none"
            materialGrade={KIT_GRADES.skyline}
          />
          {SKYLINE_STRIP_HEIGHT_FACTORS.map((heightFactor, stripIndex) => (
            <GlowStrip
              key={`skyline-strip-${stripIndex}`}
              position={[position[0], size[1] * heightFactor, position[1] + size[2] * 0.46]}
              args={[size[0] * 0.5, 0.055, 0.055]}
              color={(index + stripIndex) % 3 === 0 ? WORLD_COLORS.amber : WORLD_COLORS.cyan}
              intensity={0.16}
              opacity={0.5}
            />
          ))}
          <CuboidCollider
            args={[size[0] * 0.46, Math.max(3.5, size[1] * 0.36), size[2] * 0.46]}
            position={[position[0], Math.max(3.5, size[1] * 0.36), position[1]]}
            friction={1.05}
            restitution={0.02}
          />
        </group>
      ))}
    </group>
  );
}

function DistrictEdges() {
  return (
    <group>
      {EDGE_WALLS.map(({ position, args, accent }) => (
        <group key={`edge-${position[0]}-${position[2]}`}>
          <MeshBox
            position={position}
            args={args}
            color="#121d26"
            roughness={0.72}
            metalness={0.08}
            castShadow
            receiveShadow
          />
          <GlowStrip
            position={[
              position[0],
              position[1] + 0.68,
              position[2],
            ]}
            args={[args[0] > args[2] ? args[0] * 0.82 : 0.07, 0.07, args[2] > args[0] ? args[2] * 0.82 : 0.07]}
            color={accent}
            intensity={0.1}
            opacity={0.55}
          />
          <CuboidCollider
            args={[args[0] * 0.5, args[1] * 0.5, args[2] * 0.5]}
            position={position}
            friction={1.1}
            restitution={0.02}
          />
        </group>
      ))}
      <MeshBox position={[0, 0.22, -101.5]} args={[200, 0.2, 5.4]} color="#172733" roughness={0.62} metalness={0.08} receiveShadow />
      <GlowStrip position={[0, 0.39, -98.8]} args={[180, 0.055, 0.07]} color={WORLD_COLORS.cyan} intensity={0.12} opacity={0.48} />
    </group>
  );
}

function StaticKitProp({
  asset,
  position,
  rotation = 0,
  scale = 1,
  collider,
  colliderPosition,
  materialGrade = KIT_GRADES.prop,
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <KitModel asset={asset} scale={[scale, scale, scale]} shadows="all" materialGrade={materialGrade} />
      {collider ? (
        <CuboidCollider
          args={collider}
          position={colliderPosition || [0, collider[1], 0]}
          friction={1.05}
          restitution={0.02}
        />
      ) : null}
    </group>
  );
}

function TreeProp({ asset, position, rotation = 0, scale = 1, radius = 0.8 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <KitModel asset={asset} scale={[scale, scale, scale]} shadows="all" materialGrade={KIT_GRADES.prop} />
    </group>
  );
}

function GardenPark() {
  return (
    <group>
      <MeshBox
        position={PARK_ZONE.center}
        args={PARK_ZONE.size}
        color="#5f8753"
        roughness={0.88}
        metalness={0.02}
        receiveShadow
      />
      <GlowStrip
        position={[PARK_ZONE.center[0], PARK_ZONE.center[1] + 0.04, PARK_ZONE.center[2] - PARK_ZONE.size[2] * 0.5 + 0.28]}
        args={[PARK_ZONE.size[0] * 0.72, 0.035, 0.04]}
        color={WORLD_COLORS.cyan}
        intensity={0.1}
        opacity={0.42}
      />
      {PARK_ZONE.paths.map(({ asset, position, rotation, scale }) => (
        <KitModel
          key={`park-path-${position[0]}-${position[2]}`}
          asset={asset}
          position={position}
          rotation={[0, rotation, 0]}
          scale={[scale, scale, scale]}
          shadows="receive"
          materialGrade={KIT_GRADES.plaza}
        />
      ))}
      {PARK_ZONE.grass.map(({ asset, position, rotation, scale }) => (
        <KitModel
          key={`park-grass-${position[0]}-${position[2]}`}
          asset={asset}
          position={position}
          rotation={[0, rotation, 0]}
          scale={[scale, scale, scale]}
          shadows="all"
        />
      ))}
      {PARK_ZONE.trees.map(({ asset, position, rotation, scale, radius }) => (
        <TreeProp key={`park-tree-${position[0]}-${position[2]}`} asset={asset} position={position} rotation={rotation} scale={scale} radius={radius} />
      ))}
      {PARK_ZONE.shrubs.map(({ asset, position, rotation, scale, collider }) => (
        <StaticKitProp
          key={`park-shrub-${position[0]}-${position[2]}`}
          asset={asset}
          position={position}
          rotation={rotation}
          scale={scale}
          collider={collider}
        />
      ))}
      <MeshBox position={[28.4, 0.18, 4.2]} rotation={[0, Math.PI / 2, 0]} args={[3.6, 0.16, 0.52]} color="#8d7057" roughness={0.72} receiveShadow />
      <MeshBox position={[33.6, 0.18, 4.2]} rotation={[0, Math.PI / 2, 0]} args={[3.6, 0.16, 0.52]} color="#8d7057" roughness={0.72} receiveShadow />
    </group>
  );
}

function GreenIslands() {
  return (
    <group>
      {GREEN_ISLANDS.map(({ anchor, rotation, items }) => (
        <group key={`green-island-${anchor[0]}-${anchor[1]}`} position={[anchor[0], 0.148, anchor[1]]} rotation={[0, rotation, 0]}>
          {items.map(({ asset, offset, scale }, index) => (
            <KitModel
              key={`green-island-item-${index}`}
              asset={asset}
              position={[offset[0], 0, offset[1]]}
              rotation={[0, index * 0.7, 0]}
              scale={[scale, scale, scale]}
              shadows="all"
            />
          ))}
        </group>
      ))}
    </group>
  );
}

function CampusDressing() {
  return (
    <group>
      <GardenPark />
      <GreenIslands />
      {CONSTRUCTION_ZONE_PROPS.map(({ kind, position, rotation = 0 }) => (
        kind === "barrier" ? (
          <StaticKitProp
            key={`construction-${kind}-${position[0]}-${position[2]}`}
            asset={ROAD_KIT.barrier}
            position={position}
            rotation={rotation}
            scale={2.8}
            collider={[1.55, 0.38, 0.3]}
            colliderPosition={[0, 0.28, 0]}
          />
        ) : (
          <KitModel
            key={`construction-${kind}-${position[0]}-${position[2]}`}
            asset={ROAD_KIT.cone}
            position={position}
            scale={[2.6, 2.6, 2.6]}
            shadows="all"
            materialGrade={CONE_GRADE}
          />
        )
      ))}
    </group>
  );
}

export function PushableCityProps() {
  return null;
}

export function RoadNetwork({ selectedDestinationId, showAccessDebug = false }) {
  return (
    <>
      <CampusGround />
      <DistrictPlazas />
      <CustomRoadNetwork />
      <SidewalkNetwork />
      <AccessPads />
      <RoadMarkings />
      <SpawnPlaza />
      <GuideDots selectedDestinationId={selectedDestinationId} />
      <DestinationBeacon selectedDestinationId={selectedDestinationId} />
      {CAMPUS_LAMPS.map((lamp) => (
        <StreetLamp key={`${lamp.position[0]}-${lamp.position[1]}`} {...lamp} />
      ))}
      <CampusDressing />
      {showAccessDebug ? <AccessDebug selectedDestinationId={selectedDestinationId} /> : null}
    </>
  );
}
