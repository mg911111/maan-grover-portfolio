const ROAD_BASE = "/models/world/kenney-city-roads/Models/GLB%20format";
const COMMERCIAL_BASE = "/models/world/kenney-city-commercial/Models/GLB%20format";
const CAR_KIT_BASE = "/models/kenney-car-kit/Models/GLB%20format";
const INDUSTRIAL_BASE = "/models/kenney-city-kit-industrial/Models/GLB%20format";
const SUBURBAN_BASE = "/models/kenney-city-kit-suburban/Models/GLB%20format";
const NATURE_BASE = "/models/kenney-nature-kit/Models/GLTF%20format";
const MODULAR_BASE = "/models/kenney-modular-buildings/Models/GLB%20format";
const CHARACTER_BASE = "/models/kenney-blocky-characters/Models/GLB%20format";

export const KIT_ASSET_FOLDERS = {
  roads: "public/models/world/kenney-city-roads",
  commercial: "public/models/world/kenney-city-commercial",
  carKit: "public/models/kenney-car-kit",
  industrial: "public/models/kenney-city-kit-industrial",
  suburban: "public/models/kenney-city-kit-suburban",
  nature: "public/models/kenney-nature-kit",
  modularBuildings: "public/models/kenney-modular-buildings",
  blockyCharacters: "public/models/kenney-blocky-characters",
};

export const ROAD_KIT = {
  barrier: `${ROAD_BASE}/construction-barrier.glb`,
  cone: `${ROAD_BASE}/construction-cone.glb`,
  constructionLight: `${ROAD_BASE}/construction-light.glb`,
  crossing: `${ROAD_BASE}/road-crossing.glb`,
  crossroad: `${ROAD_BASE}/road-crossroad.glb`,
  curve: `${ROAD_BASE}/road-curve.glb`,
  drivewayDouble: `${ROAD_BASE}/road-driveway-double.glb`,
  drivewaySingle: `${ROAD_BASE}/road-driveway-single.glb`,
  end: `${ROAD_BASE}/road-end.glb`,
  intersection: `${ROAD_BASE}/road-intersection.glb`,
  lightCurved: `${ROAD_BASE}/light-curved.glb`,
  lightCurvedDouble: `${ROAD_BASE}/light-curved-double.glb`,
  lightSquare: `${ROAD_BASE}/light-square.glb`,
  lightSquareDouble: `${ROAD_BASE}/light-square-double.glb`,
  roundabout: `${ROAD_BASE}/road-roundabout.glb`,
  side: `${ROAD_BASE}/road-side.glb`,
  sideEntry: `${ROAD_BASE}/road-side-entry.glb`,
  sideExit: `${ROAD_BASE}/road-side-exit.glb`,
  signHighwayDetailed: `${ROAD_BASE}/sign-highway-detailed.glb`,
  signHighwayWide: `${ROAD_BASE}/sign-highway-wide.glb`,
  square: `${ROAD_BASE}/road-square.glb`,
  straight: `${ROAD_BASE}/road-straight.glb`,
  straightBarrier: `${ROAD_BASE}/road-straight-barrier.glb`,
  tileHigh: `${ROAD_BASE}/tile-high.glb`,
  tileLow: `${ROAD_BASE}/tile-low.glb`,
};

export const COMMERCIAL_KIT = {
  awning: `${COMMERCIAL_BASE}/detail-awning.glb`,
  awningWide: `${COMMERCIAL_BASE}/detail-awning-wide.glb`,
  buildingA: `${COMMERCIAL_BASE}/building-a.glb`,
  buildingB: `${COMMERCIAL_BASE}/building-b.glb`,
  buildingC: `${COMMERCIAL_BASE}/building-c.glb`,
  buildingD: `${COMMERCIAL_BASE}/building-d.glb`,
  buildingE: `${COMMERCIAL_BASE}/building-e.glb`,
  buildingF: `${COMMERCIAL_BASE}/building-f.glb`,
  buildingG: `${COMMERCIAL_BASE}/building-g.glb`,
  buildingH: `${COMMERCIAL_BASE}/building-h.glb`,
  buildingI: `${COMMERCIAL_BASE}/building-i.glb`,
  buildingJ: `${COMMERCIAL_BASE}/building-j.glb`,
  buildingK: `${COMMERCIAL_BASE}/building-k.glb`,
  buildingL: `${COMMERCIAL_BASE}/building-l.glb`,
  buildingM: `${COMMERCIAL_BASE}/building-m.glb`,
  buildingN: `${COMMERCIAL_BASE}/building-n.glb`,
  overhang: `${COMMERCIAL_BASE}/detail-overhang.glb`,
  overhangWide: `${COMMERCIAL_BASE}/detail-overhang-wide.glb`,
  parasolA: `${COMMERCIAL_BASE}/detail-parasol-a.glb`,
  parasolB: `${COMMERCIAL_BASE}/detail-parasol-b.glb`,
  skyscraperA: `${COMMERCIAL_BASE}/building-skyscraper-a.glb`,
  skyscraperB: `${COMMERCIAL_BASE}/building-skyscraper-b.glb`,
  skyscraperC: `${COMMERCIAL_BASE}/building-skyscraper-c.glb`,
  skyscraperD: `${COMMERCIAL_BASE}/building-skyscraper-d.glb`,
  skyscraperE: `${COMMERCIAL_BASE}/building-skyscraper-e.glb`,
  skylineA: `${COMMERCIAL_BASE}/low-detail-building-wide-a.glb`,
  skylineB: `${COMMERCIAL_BASE}/low-detail-building-wide-b.glb`,
  skylineH: `${COMMERCIAL_BASE}/low-detail-building-h.glb`,
  skylineN: `${COMMERCIAL_BASE}/low-detail-building-n.glb`,
};

export const CAR_KIT = {
  cone: `${CAR_KIT_BASE}/cone.glb`,
  box: `${CAR_KIT_BASE}/box.glb`,
};

export const INDUSTRIAL_KIT = {
  buildingA: `${INDUSTRIAL_BASE}/building-a.glb`,
  buildingE: `${INDUSTRIAL_BASE}/building-e.glb`,
  buildingH: `${INDUSTRIAL_BASE}/building-h.glb`,
  buildingK: `${INDUSTRIAL_BASE}/building-k.glb`,
  buildingN: `${INDUSTRIAL_BASE}/building-n.glb`,
  buildingQ: `${INDUSTRIAL_BASE}/building-q.glb`,
  chimneyLarge: `${INDUSTRIAL_BASE}/chimney-large.glb`,
  tank: `${INDUSTRIAL_BASE}/detail-tank.glb`,
};

export const SUBURBAN_KIT = {
  buildingA: `${SUBURBAN_BASE}/building-type-a.glb`,
  buildingF: `${SUBURBAN_BASE}/building-type-f.glb`,
  buildingK: `${SUBURBAN_BASE}/building-type-k.glb`,
  buildingP: `${SUBURBAN_BASE}/building-type-p.glb`,
  fenceLow: `${SUBURBAN_BASE}/fence-low.glb`,
  fence: `${SUBURBAN_BASE}/fence.glb`,
  planter: `${SUBURBAN_BASE}/planter.glb`,
  treeLarge: `${SUBURBAN_BASE}/tree-large.glb`,
  treeSmall: `${SUBURBAN_BASE}/tree-small.glb`,
};

export const NATURE_KIT = {
  grass: `${NATURE_BASE}/grass.glb`,
  grassLarge: `${NATURE_BASE}/grass_large.glb`,
  grassLeafsLarge: `${NATURE_BASE}/grass_leafsLarge.glb`,
  groundPathStraight: `${NATURE_BASE}/ground_pathStraight.glb`,
  pathStone: `${NATURE_BASE}/path_stone.glb`,
  pathStoneCircle: `${NATURE_BASE}/path_stoneCircle.glb`,
  pathStoneCorner: `${NATURE_BASE}/path_stoneCorner.glb`,
  bush: `${NATURE_BASE}/plant_bush.glb`,
  bushLarge: `${NATURE_BASE}/plant_bushLarge.glb`,
  bushDetailed: `${NATURE_BASE}/plant_bushDetailed.glb`,
  plantTall: `${NATURE_BASE}/plant_flatTall.glb`,
  potLarge: `${NATURE_BASE}/pot_large.glb`,
  sign: `${NATURE_BASE}/sign.glb`,
  treeDefault: `${NATURE_BASE}/tree_default.glb`,
  treeDetailed: `${NATURE_BASE}/tree_detailed.glb`,
  treeOak: `${NATURE_BASE}/tree_oak.glb`,
  treeSmall: `${NATURE_BASE}/tree_small.glb`,
  rockSmall: `${NATURE_BASE}/rock_smallA.glb`,
  rockSmallFlat: `${NATURE_BASE}/rock_smallFlatA.glb`,
};

export const MODULAR_BUILDING_KIT = {
  block: `${MODULAR_BASE}/building-block.glb`,
  houseA: `${MODULAR_BASE}/building-sample-house-a.glb`,
  houseB: `${MODULAR_BASE}/building-sample-house-b.glb`,
  houseC: `${MODULAR_BASE}/building-sample-house-c.glb`,
  stepsWide: `${MODULAR_BASE}/building-steps-wide.glb`,
  towerA: `${MODULAR_BASE}/building-sample-tower-a.glb`,
  towerB: `${MODULAR_BASE}/building-sample-tower-b.glb`,
  towerC: `${MODULAR_BASE}/building-sample-tower-c.glb`,
  towerD: `${MODULAR_BASE}/building-sample-tower-d.glb`,
};

export const BLOCKY_CHARACTER_KIT = {
  characterA: `${CHARACTER_BASE}/character-a.glb`,
  characterD: `${CHARACTER_BASE}/character-d.glb`,
  characterH: `${CHARACTER_BASE}/character-h.glb`,
};

export const PRELOAD_KIT_ASSETS = [
  ROAD_KIT.straight,
  ROAD_KIT.crossroad,
  ROAD_KIT.crossing,
  ROAD_KIT.drivewayDouble,
  ROAD_KIT.roundabout,
  ROAD_KIT.lightCurved,
  ROAD_KIT.lightSquare,
  ROAD_KIT.barrier,
  COMMERCIAL_KIT.buildingA,
  COMMERCIAL_KIT.buildingE,
  COMMERCIAL_KIT.buildingI,
  COMMERCIAL_KIT.buildingJ,
  COMMERCIAL_KIT.buildingK,
  COMMERCIAL_KIT.buildingN,
  COMMERCIAL_KIT.skyscraperA,
  COMMERCIAL_KIT.awningWide,
  COMMERCIAL_KIT.overhangWide,
  INDUSTRIAL_KIT.buildingE,
  INDUSTRIAL_KIT.buildingK,
  SUBURBAN_KIT.planter,
  SUBURBAN_KIT.treeLarge,
  NATURE_KIT.treeDefault,
  NATURE_KIT.bushLarge,
  NATURE_KIT.grassLarge,
  NATURE_KIT.grassLeafsLarge,
  NATURE_KIT.groundPathStraight,
  NATURE_KIT.pathStone,
  NATURE_KIT.pathStoneCircle,
  NATURE_KIT.rockSmall,
  NATURE_KIT.rockSmallFlat,
  NATURE_KIT.sign,
  MODULAR_BUILDING_KIT.stepsWide,
  MODULAR_BUILDING_KIT.towerA,
  BLOCKY_CHARACTER_KIT.characterA,
];
