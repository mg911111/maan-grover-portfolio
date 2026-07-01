import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FollowCamera } from "../camera/FollowCamera";
import { CarController } from "../player/CarController";
import { CITY_SPAWN_POSITION as UBC_SPAWN_POSITION, WORLD_COLORS } from "../../data/districtMap";
import { NAVIGATION_SECTIONS, getSectionAccessPosition } from "../../data/sections";
import { getDestinationAnchorLabel } from "../../data/destinationAnchors";
import { LowPolyCity } from "../world/LowPolyCity";
import { RoseGardenWorld } from "../world/RoseGardenWorld";
import { SkyScene } from "../world/SkyScene";
import {
  CITY_BOUNDARY_COLLIDERS,
  CITY_PLAYABLE_BOUNDS,
  CITY_SPAWN_POSITION,
  CITY_SPAWN_ROTATION,
  resolveCityVelocity,
} from "../../data/cityPhysics";

// Change this to "ubc" to restore the existing Rose Garden world.
const ACTIVE_WORLD = "city";

function createPinLabelTexture(label) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(5, 12, 20, 0.82)";
  context.strokeStyle = "rgba(174, 232, 255, 0.62)";
  context.lineWidth = 3;
  context.beginPath();
  if (typeof context.roundRect === "function") {
    context.roundRect(16, 20, 480, 88, 46);
  } else {
    context.rect(16, 20, 480, 88);
  }
  context.fill();
  context.stroke();

  context.fillStyle = "rgba(240, 251, 255, 0.96)";
  context.font = "800 42px Inter, Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function DestinationPin({ section }) {
  const groupRef = useRef(null);
  const { camera } = useThree();
  const label = getDestinationAnchorLabel(section);
  const labelTexture = useMemo(() => createPinLabelTexture(label), [label]);
  useEffect(() => () => labelTexture?.dispose(), [labelTexture]);
  const pinPosition = Array.isArray(section?.pinPosition)
    ? section.pinPosition
    : null;
  const [x, z] = pinPosition
    ? [pinPosition[0], pinPosition[2]]
    : Array.isArray(section?.buildingPosition)
      ? section.buildingPosition
      : getSectionAccessPosition(section);
  const baseY = pinPosition?.[1] || section?.pinHeightOffset || 18;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.035;
    groupRef.current.position.set(x, baseY + Math.sin(clock.elapsedTime * 1.55) * 0.72, z);
    groupRef.current.scale.setScalar(pulse);
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  if (!section) return null;

  return (
    <group ref={groupRef} position={[x, baseY, z]} renderOrder={30}>
      <mesh position={[0, 0.05, -0.02]}>
        <circleGeometry args={[3.8, 56]} />
        <meshBasicMaterial color="#7ddcff" transparent opacity={0.24} depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <circleGeometry args={[1.62, 56]} />
        <meshBasicMaterial color="#ecfbff" transparent opacity={0.96} depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.38, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[1.02, 2.34, 3]} />
        <meshBasicMaterial color="#b9f0ff" transparent opacity={0.95} depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.2, 0.02]}>
        <circleGeometry args={[0.62, 36]} />
        <meshBasicMaterial color="#0a1f2d" transparent opacity={0.72} depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>
      {labelTexture ? (
        <sprite position={[0, -4.05, 0]} scale={[7.9, 1.98, 1]}>
          <spriteMaterial map={labelTexture} transparent depthWrite={false} depthTest={false} toneMapped={false} />
        </sprite>
      ) : null}
    </group>
  );
}

function EntranceTargetRing({ section }) {
  const groupRef = useRef(null);
  const [x, z] = getSectionAccessPosition(section);
  const y = (section?.accessY || 0) + 0.1;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.08;
    groupRef.current.scale.set(pulse, pulse, pulse);
  });

  if (!section) return null;

  return (
    <group ref={groupRef} position={[x, y, z]} renderOrder={9}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 3.18, 72]} />
        <meshBasicMaterial color="#dffcff" transparent opacity={0.62} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[2.15, 72]} />
        <meshBasicMaterial color="#7de7ff" transparent opacity={0.16} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[3.45, 3.84, 72]} />
        <meshBasicMaterial color="#7de7ff" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function DestinationCompassArrow({ targetRef, section }) {
  const groupRef = useRef(null);
  const arrowRef = useRef(null);
  const lastAngleRef = useRef(0);
  const visibilityRef = useRef(1);
  const [targetX, targetZ] = getSectionAccessPosition(section);
  const arrivalRadius = section?.accessRadius || 5.8;

  useFrame(({ clock }, delta) => {
    const carPosition = targetRef.current?.position;
    if (!carPosition || !groupRef.current || !arrowRef.current) return;

    const directionX = targetX - carPosition.x;
    const directionZ = targetZ - carPosition.z;
    const distanceToTarget = Math.hypot(directionX, directionZ);
    const arrived = distanceToTarget <= arrivalRadius;
    const angle = arrived ? lastAngleRef.current : Math.atan2(directionX, directionZ);
    if (!arrived) lastAngleRef.current = angle;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.6) * 0.045;
    visibilityRef.current = THREE.MathUtils.lerp(
      visibilityRef.current,
      arrived ? 0 : 1,
      1 - Math.exp(-8 * delta)
    );
    const visibleScale = Math.max(visibilityRef.current, 0.001);

    groupRef.current.position.set(carPosition.x, carPosition.y + 5.6, carPosition.z);
    arrowRef.current.visible = visibilityRef.current > 0.025;
    arrowRef.current.rotation.set(0, angle, 0);
    arrowRef.current.scale.setScalar(pulse * visibleScale);
  });

  if (!section) return null;

  return (
    <group ref={groupRef} renderOrder={35}>
      <group ref={arrowRef}>
        <mesh position={[0, 0, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.68, 1.85, 3]} />
          <meshBasicMaterial color="#e8fbff" transparent opacity={0.97} depthWrite={false} depthTest={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 1.7, 18]} />
          <meshBasicMaterial color="#78dcff" transparent opacity={0.82} depthWrite={false} depthTest={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.35, 1.62, 52]} />
          <meshBasicMaterial color="#8eeaff" transparent opacity={0.26} depthWrite={false} depthTest={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function CalibrationMarkers({ markers = [] }) {
  if (!markers.length) return null;

  return (
    <group name="calibration-copy-markers">
      {markers.map((marker) => (
        <group
          key={marker.id}
          position={[
            marker.position?.x || 0,
            (marker.position?.y || 0) + 0.35,
            marker.position?.z || 0,
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.55, 18, 12]} />
            <meshBasicMaterial color="#ffdf7a" transparent opacity={0.9} depthTest={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
            <ringGeometry args={[1.05, 1.28, 32]} />
            <meshBasicMaterial color="#ffdf7a" transparent opacity={0.62} depthTest={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ProximityTracker({ targetRef, selectedDestinationId, onNearbySection }) {
  const lastNearbyId = useRef(null);

  useFrame(() => {
    const position = targetRef.current?.position;
    if (!position) return;

    let nearby = null;
    let nearestDistance = Infinity;
    const sectionsToCheck = selectedDestinationId
      ? NAVIGATION_SECTIONS.filter((section) => section.id === selectedDestinationId)
      : NAVIGATION_SECTIONS;

    sectionsToCheck.forEach((section) => {
      const [x, z] = getSectionAccessPosition(section);
      const distance = Math.hypot(position.x - x, position.z - z);
      if (distance <= (section.accessRadius || 8.5) && distance < nearestDistance) {
        nearby = section;
        nearestDistance = distance;
      }
    });

    const nextId = nearby?.id || null;
    if (nextId === lastNearbyId.current) return;
    lastNearbyId.current = nextId;
    onNearbySection?.(
      nearby,
      nearby
        ? { distanceToAccess: nearestDistance, carPosition: { x: position.x, z: position.z } }
        : null
    );
  });

  return null;
}

export function Experience({
  timeOfDay = "night",
  onTelemetry,
  onNearbySection,
  activeSectionId,
  discoveredSectionIds,
  selectedDestinationId,
  showAccessDebug,
  calibrationMarkers = [],
}) {
  const cityTestActive = ACTIVE_WORLD === "city";
  const isDay = timeOfDay === "dawn";
  const spawnPosition = cityTestActive ? CITY_SPAWN_POSITION : UBC_SPAWN_POSITION;
  const spawnYaw = cityTestActive ? CITY_SPAWN_ROTATION : 0;
  const selectedDestination = NAVIGATION_SECTIONS.find(
    (section) => section.id === selectedDestinationId
  );
  const carTargetRef = useRef({
    position: new THREE.Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z),
    rotation: new THREE.Euler(0, spawnYaw, 0),
    speed: 0,
    steer: 0,
    grounded: true,
  });
  return (
    <group>
      <color attach="background" args={[cityTestActive ? (isDay ? "#78b8dc" : "#071225") : WORLD_COLORS.skyTop]} />
      <fog attach="fog" args={cityTestActive ? (isDay ? ["#9fc6d8", 105, 245] : ["#09182b", 72, 215]) : ["#dce8ee", 130, 245]} />
      <SkyScene cinematic={cityTestActive} timeOfDay={timeOfDay} />
      <ambientLight
        intensity={cityTestActive ? (isDay ? 1.28 : 0.42) : 1.65}
        color={cityTestActive ? (isDay ? "#d9efff" : "#8aa8d8") : "#fff7e8"}
      />
      <directionalLight
        position={cityTestActive ? (isDay ? [-58, 104, -32] : [72, 88, -8]) : [-70, 105, -30]}
        intensity={cityTestActive ? (isDay ? 3.15 : 2.25) : 2.65}
        color={cityTestActive ? (isDay ? "#fff1cf" : "#ffc26d") : "#ffe4b0"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00045}
        shadow-normalBias={0.085}
        shadow-camera-left={-82}
        shadow-camera-right={82}
        shadow-camera-top={62}
        shadow-camera-bottom={-62}
        shadow-camera-near={18}
        shadow-camera-far={155}
      />
      <directionalLight
        position={[-45, 40, -64]}
        intensity={cityTestActive ? (isDay ? 0.48 : 0.8) : 0.65}
        color={isDay ? "#b9dcf2" : "#78a9e8"}
      />
      <hemisphereLight
        args={cityTestActive
          ? (isDay ? ["#a9ddfa", "#53634f", 1.55] : ["#6688bd", "#111827", 0.85])
          : ["#dcebf4", "#8b9a78", 1.35]}
      />
      {cityTestActive && !isDay ? <pointLight position={[58, 54, -4]} intensity={1100} distance={150} decay={2} color="#ffad55" /> : null}

      <Physics gravity={[0, -18, 0]} timeStep="vary">
        {cityTestActive ? (
          <LowPolyCity timeOfDay={timeOfDay} />
        ) : (
          <RoseGardenWorld
            activeSectionId={activeSectionId}
            discoveredSectionIds={discoveredSectionIds}
            selectedDestinationId={selectedDestinationId}
            showAccessDebug={showAccessDebug}
          />
        )}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[78, 0.3, 50]} position={[0, -0.3, 0]} friction={1.2} />
          {CITY_BOUNDARY_COLLIDERS.map((boundary) => (
            <CuboidCollider
              key={boundary.name}
              args={boundary.halfExtents}
              position={boundary.center}
              friction={0.35}
              restitution={0}
            />
          ))}
        </RigidBody>
        <CarController
          targetRef={carTargetRef}
          onTelemetry={onTelemetry}
          spawnPosition={spawnPosition}
          spawnYaw={spawnYaw}
          useWorldExclusions={!cityTestActive}
          worldBounds={cityTestActive ? CITY_PLAYABLE_BOUNDS : null}
          velocityResolver={cityTestActive ? resolveCityVelocity : null}
        />
      </Physics>
      <ProximityTracker
        targetRef={carTargetRef}
        selectedDestinationId={selectedDestinationId}
        onNearbySection={onNearbySection}
      />
      <FollowCamera
        targetRef={carTargetRef}
      />
      {cityTestActive ? (
        <DestinationCompassArrow targetRef={carTargetRef} section={selectedDestination} />
      ) : null}
      {cityTestActive ? <EntranceTargetRing section={selectedDestination} /> : null}
      {cityTestActive ? <DestinationPin section={selectedDestination} /> : null}
      {cityTestActive ? <CalibrationMarkers markers={calibrationMarkers} /> : null}
    </group>
  );
}
