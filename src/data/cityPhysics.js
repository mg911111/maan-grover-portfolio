export const CITY_MODEL_TRANSFORM = {
  position: [19.036, 0, 12.722],
  rotation: [0, 0, 0],
  scale: 0.75,
};

// Center of the west entrance to the main east/west road.
export const CITY_SPAWN_POSITION = { x: -74.2, y: 0.72, z: -9.4 };
export const CITY_SPAWN_ROTATION = Math.PI / 2;

// Hard center-position limits. The physics walls sit just outside these values.
export const CITY_PLAYABLE_BOUNDS = {
  minX: -79,
  maxX: 79,
  minZ: -50.35,
  maxZ: 50.35,
  pushBack: 0.18,
};

export const CITY_BOUNDARY_COLLIDERS = [
  box("platform-west-edge", "boundary", -79.25, 0, 0.25, 50.6, 6),
  box("platform-east-edge", "boundary", 79.25, 0, 0.25, 50.6, 6),
  box("platform-south-edge", "boundary", 0, -50.6, 79.25, 0.25, 6),
  box("platform-north-edge", "boundary", 0, 50.6, 79.25, 0.25, 6),
];

function box(name, group, x, z, halfX, halfZ, height = 8) {
  return { name, group, center: [x, height * 0.5, z], halfExtents: [halfX, height * 0.5, halfZ] };
}

// Hand-tuned blocked zones from the accepted GLB's existing world transform.
// These are intentionally smaller than roof/canopy bounds so road edges stay usable.
export const CITY_MANUAL_COLLIDERS = [
  box("building-football-west-school", "buildings", -29.6, -27.2, 6.1, 11.7, 14),
  box("blocked-central-christmas-tree-gifts", "central-tree", -26.4, 7.5, 9.4, 6.8, 22),
  box("building-central-police", "buildings", -59.5, 7.4, 5.85, 4.75, 10),
  box("building-hospital", "buildings", 14.8, 11.3, 15.7, 6.7, 18),
  box("building-hotel", "buildings", -60, 37.5, 10.4, 6.6, 22),
  box("building-rail-station", "buildings", 54.1, 32.7, 16.1, 5.6, 12),

  box("building-garage-west-south", "buildings", 54.4, -5.7, 1.65, 1.65, 4),
  box("building-garage-west-middle", "buildings", 54.4, -27.7, 1.65, 1.65, 4),
  box("building-garage-west-north", "buildings", 54.4, 16.3, 1.65, 1.65, 4),
  box("building-garage-east-south", "buildings", 67.1, -5.7, 1.65, 1.65, 4),
  box("building-garage-east-middle", "buildings", 67.1, -27.7, 1.65, 1.65, 4),
  box("building-garage-east-north", "buildings", 67.1, 16.3, 1.65, 1.65, 4),
  box("building-greenhouse-west", "buildings", 54.2, 3.3, 1.2, 1, 4),
  box("building-greenhouse-east-south", "buildings", 67.3, -18.7, 1.2, 1, 4),
  box("building-greenhouse-east-north", "buildings", 67.3, 3.3, 1.2, 1, 4),

  box("west-barber-shop", "shops", 24.4, -39.1, 2.2, 1.9, 5),
  box("east-shop-south", "shops", 31.7, -37.4, 2, 3.8, 5),
  box("east-shop-middle", "shops", 31.9, -24.1, 2.2, 3.2, 5),
  box("east-shop-north", "shops", 31.7, -11.6, 2.2, 3.5, 5),
  box("east-barber-shop", "shops", 31.3, -1.1, 1.9, 2.2, 5),

  box("villa-west-south", "villas", 54, -34.5, 2.1, 4.8, 6),
  box("villa-west-middle", "villas", 54, -12.5, 2.1, 4.8, 6),
  box("villa-west-north", "villas", 54, 9.4, 2.1, 4.8, 6),
  box("villa-east-south", "villas", 67.5, -34.5, 2.1, 4.8, 6),
  box("villa-east-middle", "villas", 67.5, -12.5, 2.1, 4.8, 6),
  box("villa-east-north", "villas", 67.5, 9.4, 2.1, 4.8, 6),

  box("barrier-east-south-edge", "large-barriers", 60.6, -47, 14, 0.12, 2),
  box("barrier-east-row-south", "large-barriers", 60.6, -23, 14, 0.12, 2),
  box("barrier-east-row-middle", "large-barriers", 60.6, -0.7, 14, 0.12, 2),
  box("barrier-east-row-north", "large-barriers", 60.6, 24.1, 14, 0.12, 2),
  box("barrier-east-column-south", "large-barriers", 60.9, -35.3, 0.12, 11.8, 2),
  box("barrier-east-column-middle", "large-barriers", 60.9, -11.9, 0.12, 10.5, 2),
  box("barrier-east-column-north", "large-barriers", 60.9, 11.6, 0.12, 11.9, 2),

  box("parked-bus-central-west", "vehicles", -18.9, 30.4, 1.05, 3.1, 4),
  box("parked-bus-central-east", "vehicles", -23.2, 30.4, 1.05, 3.1, 4),
  box("parked-bus-south", "vehicles", -28.4, -48.1, 2.7, 1.1, 4),
  box("parked-blue-car-east", "vehicles", 49.8, 16.5, 1.05, 0.85, 3),
  box("parked-blue-car-west", "vehicles", -27.8, 39.8, 0.85, 1.05, 3),
  box("parked-green-car-west", "vehicles", -31.8, 30.3, 0.85, 1.05, 3),
  box("parked-green-car-east", "vehicles", 71.8, -27.7, 1.05, 0.85, 3),
  box("parked-limousine", "vehicles", -14.2, 30.2, 0.9, 2.4, 3),
  box("parked-police-car", "vehicles", -63.6, 20.8, 1.5, 0.95, 3),
  box("parked-snowplow-central", "vehicles", -9.3, 6.8, 1.05, 2.7, 4),
  box("parked-snowplow-east", "vehicles", 40.6, -23.9, 1.05, 2.7, 4),
  box("parked-taxi-west", "vehicles", -43.7, 31.1, 1, 1.55, 3),
  box("parked-taxi-west-2", "vehicles", -35.2, 39.8, 1, 1.55, 3),
  box("parked-taxi-east", "vehicles", 72.1, 16.2, 1.55, 1, 3),
  box("parked-taxi-west-3", "vehicles", -39, 39.8, 1, 1.55, 3),
  box("parked-turbo-car", "vehicles", 49.7, -5.5, 1.45, 1, 3),

  box("large-tree-west-south", "large-trees", -70.2, -43.1, 1.15, 1.15, 10),
  box("large-tree-west-center", "large-trees", -60.1, -18.9, 1.05, 1.05, 10),
  box("large-tree-west-north", "large-trees", -74, 3.3, 1.3, 1.3, 12),
  box("large-tree-southwest", "large-trees", -72.1, 43.2, 1.15, 1.15, 9),
  box("large-tree-east", "large-trees", 73.1, -19.6, 1.05, 1.05, 9),
  box("large-snow-tree-west-edge", "large-trees", -52.4, -43.2, 1.15, 1.15, 9),
  box("large-snow-tree-west-lower", "large-trees", -55.3, -37.4, 0.95, 0.95, 8),
  box("large-snow-tree-southwest", "large-trees", -60.4, -45.7, 1.05, 1.05, 9),
  box("large-snow-tree-east-north", "large-trees", 56, 22, 1.15, 1.15, 9),
  box("large-snow-tree-east-south", "large-trees", 63.8, -45, 1, 1, 8),
  box("large-snow-tree-east-south-2", "large-trees", 66.2, -42.6, 0.85, 0.85, 7),
];

const CAR_COLLISION_CLEARANCE = 0.82;
const CONTACT_EPSILON = 0.002;

export function isInsideCityBounds(position) {
  return (
    position.x >= CITY_PLAYABLE_BOUNDS.minX &&
    position.x <= CITY_PLAYABLE_BOUNDS.maxX &&
    position.z >= CITY_PLAYABLE_BOUNDS.minZ &&
    position.z <= CITY_PLAYABLE_BOUNDS.maxZ
  );
}

function penetrationAt(position, collider) {
  const overlapX = collider.halfExtents[0] + CAR_COLLISION_CLEARANCE -
    Math.abs(position.x - collider.center[0]);
  const overlapZ = collider.halfExtents[2] + CAR_COLLISION_CLEARANCE -
    Math.abs(position.z - collider.center[2]);
  return overlapX > 0 && overlapZ > 0 ? Math.min(overlapX, overlapZ) : 0;
}

// Axis-wise fallback for high-speed frames. Rapier handles normal contact; this
// only removes the velocity component that would deepen a penetration.
export function resolveCityVelocity(position, velocity, delta) {
  let x = velocity.x;
  let z = velocity.z;

  const nextX = position.x + x * delta;
  const nextZ = position.z + z * delta;
  if (nextX < CITY_PLAYABLE_BOUNDS.minX || nextX > CITY_PLAYABLE_BOUNDS.maxX) x = 0;
  if (nextZ < CITY_PLAYABLE_BOUNDS.minZ || nextZ > CITY_PLAYABLE_BOUNDS.maxZ) z = 0;

  CITY_MANUAL_COLLIDERS.forEach((collider) => {
    const currentPenetration = penetrationAt(position, collider);
    const xCandidate = { x: position.x + x * delta, z: position.z };
    const zCandidate = { x: position.x, z: position.z + z * delta };

    if (penetrationAt(xCandidate, collider) > currentPenetration + CONTACT_EPSILON) x = 0;
    if (penetrationAt(zCandidate, collider) > currentPenetration + CONTACT_EPSILON) z = 0;
  });

  return { x, z };
}
