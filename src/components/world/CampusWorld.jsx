import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { DISTRICT_BOUNDS } from "../../data/districtMap";
import { CityWorld } from "./CityWorld";

function BoundaryColliders() {
  const { halfWidth, halfDepth } = DISTRICT_BOUNDS;
  const wallHeight = 1.25;
  const wallThickness = 1.1;

  return (
    <>
      <CuboidCollider
        args={[wallThickness, wallHeight, halfDepth + 4]}
        position={[halfWidth + wallThickness, wallHeight, 0]}
        friction={1.2}
        restitution={0.02}
      />
      <CuboidCollider
        args={[wallThickness, wallHeight, halfDepth + 4]}
        position={[-halfWidth - wallThickness, wallHeight, 0]}
        friction={1.2}
        restitution={0.02}
      />
      <CuboidCollider
        args={[halfWidth + 4, wallHeight, wallThickness]}
        position={[0, wallHeight, halfDepth + wallThickness]}
        friction={1.2}
        restitution={0.02}
      />
      <CuboidCollider
        args={[halfWidth + 4, wallHeight, wallThickness]}
        position={[0, wallHeight, -halfDepth - wallThickness]}
        friction={1.2}
        restitution={0.02}
      />
    </>
  );
}

export function CampusWorld({
  activeSectionId,
  discoveredSectionIds = [],
  sections,
  selectedDestinationId = "projects",
  showAccessDebug = false,
}) {
  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        {/* Authoritative drivable floor: visual road pieces sit above this and do not collide. */}
        <CuboidCollider
          args={[DISTRICT_BOUNDS.halfWidth + 4, 0.12, DISTRICT_BOUNDS.halfDepth + 4]}
          position={[0, -0.12, 0]}
          friction={1.35}
          restitution={0.02}
        />
        <BoundaryColliders />
        <CityWorld
          activeSectionId={activeSectionId}
          discoveredSectionIds={discoveredSectionIds}
          sections={sections}
          selectedDestinationId={selectedDestinationId}
          showAccessDebug={showAccessDebug}
        />
      </RigidBody>
    </group>
  );
}
