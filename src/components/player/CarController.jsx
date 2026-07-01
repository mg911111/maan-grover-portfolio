import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CITY_SPAWN_POSITION, NAVIGATION_DESTINATIONS } from "../../data/districtMap";
import { CLAMP_RADIUS } from "../../data/sections";
import { useKeyboardInput } from "../../utils/input";
import { Car } from "./Car";

const ARENA_LIMIT = CLAMP_RADIUS;
const MAX_FORWARD_SPEED = 25;
const MAX_REVERSE_SPEED = 22;
const ACCELERATION_FORCE = 8;
const REVERSE_FORCE = 7.4;
const STEERING_STRENGTH = 2.35;
const BOOST_FORCE_MULTIPLIER = 1.45;
const BOOST_MAX_SPEED_MULTIPLIER = 1.35;
const BOOST_STEERING_CONTROL_MULTIPLIER = 0.84;
const BRAKE_ACCELERATION = 10.5;
const ROLLING_DECELERATION = 2.45;
const STEER_SMOOTHING = 8.4;
const STEER_RELEASE_SMOOTHING = 18;
const THROTTLE_SMOOTHING = 6.8;
const TELEMETRY_INTERVAL = 0.12;
const MAX_FRAME_DELTA = 0.05;
const MAX_SAFE_LINEAR_SPEED = MAX_FORWARD_SPEED * BOOST_MAX_SPEED_MULTIPLIER + 8;
const MAX_SAFE_YAW_RATE = 3.1;
const ZERO_VECTOR = { x: 0, y: 0, z: 0 };
const STUCK_SPEED_LIMIT = 1;
const STUCK_RECOVERY_DELAY = 2;
const BUILDING_EXCLUSION_MARGIN = 0.18;
const BUILDING_SOFT_PUSH_DAMPING = 0.14;
const BUILDING_EXCLUSION_ZONES = NAVIGATION_DESTINATIONS.map((destination) => {
  const [x, z] = destination.buildingPosition;
  const [width, depth] = destination.colliderSize || [12, 10];
  const rotation = destination.rotationY || 0;
  const cos = Math.abs(Math.cos(rotation));
  const sin = Math.abs(Math.sin(rotation));
  return {
    id: destination.id,
    x,
    z,
    halfExtents: {
      x: width * 0.5 * cos + depth * 0.5 * sin,
      z: width * 0.5 * sin + depth * 0.5 * cos,
    },
  };
});

const forwardVector = new THREE.Vector3();
const rightVector = new THREE.Vector3();
const targetVelocity = new THREE.Vector3();
const horizontalVelocity = new THREE.Vector3();
const carPosition = new THREE.Vector3();
const carQuaternion = new THREE.Quaternion();
const carEuler = new THREE.Euler(0, 0, 0, "YXZ");
const nextLinearVelocity = { x: 0, y: 0, z: 0 };
const safeTranslation = new THREE.Vector3();

function damp(current, target, sharpness, delta) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-sharpness * delta));
}

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function isFiniteVectorLike(value) {
  return Boolean(
    value &&
      isFiniteNumber(value.x) &&
      isFiniteNumber(value.y) &&
      isFiniteNumber(value.z)
  );
}

function clampHorizontalVelocity(vector, maxSpeed) {
  const horizontalSpeed = Math.hypot(vector.x, vector.z);
  if (horizontalSpeed <= maxSpeed || horizontalSpeed === 0) return;

  const scale = maxSpeed / horizontalSpeed;
  vector.x *= scale;
  vector.z *= scale;
}

function resetCar(body, yawRef, throttleRef, steerRef, spawnPosition, spawnYaw) {
  yawRef.current = spawnYaw;
  throttleRef.current = 0;
  steerRef.current = 0;
  carEuler.set(0, spawnYaw, 0);
  carQuaternion.setFromEuler(carEuler);
  body.setTranslation(spawnPosition, true);
  body.setRotation(carQuaternion, true);
  body.setLinvel(ZERO_VECTOR, true);
  body.setAngvel(ZERO_VECTOR, true);
}

function pushOutOfBuildingExclusion(position, target) {
  for (let index = 0; index < BUILDING_EXCLUSION_ZONES.length; index += 1) {
    const zone = BUILDING_EXCLUSION_ZONES[index];
    const halfX = zone.halfExtents.x + BUILDING_EXCLUSION_MARGIN;
    const halfZ = zone.halfExtents.z + BUILDING_EXCLUSION_MARGIN;
    const dx = position.x - zone.x;
    const dz = position.z - zone.z;

    if (Math.abs(dx) >= halfX || Math.abs(dz) >= halfZ) continue;

    const pushX = halfX - Math.abs(dx);
    const pushZ = halfZ - Math.abs(dz);
    target.copy(position);

    if (pushX < pushZ) {
      target.x = zone.x + (dx >= 0 ? halfX : -halfX);
    } else {
      target.z = zone.z + (dz >= 0 ? halfZ : -halfZ);
    }

    return true;
  }

  return false;
}

export function CarController({
  targetRef,
  onTelemetry,
  useWorldExclusions = true,
  spawnPosition = CITY_SPAWN_POSITION,
  spawnYaw = 0,
  worldBounds = null,
  velocityResolver = null,
}) {
  const bodyRef = useRef();
  const input = useKeyboardInput();
  const yaw = useRef(spawnYaw);
  const throttleValue = useRef(0);
  const steerValue = useRef(0);
  const telemetryClock = useRef(0);
  const stuckClock = useRef(0);
  const boostTrailRef = useRef();

  useFrame(({ clock }, delta) => {
    const frameDelta = Math.min(delta, MAX_FRAME_DELTA);
    const body = bodyRef.current;
    if (!body) return;

    const keys = input.current;
    const rawThrottle = Number(Boolean(keys.forward)) - Number(Boolean(keys.reverse || keys.backward));
    const leftPressed = Boolean(keys.left);
    const rightPressed = Boolean(keys.right);
    const rawSteer = leftPressed === rightPressed ? 0 : Number(leftPressed) - Number(rightPressed);
    const velocity = body.linvel();
    const translation = body.translation();

    if (
      keys.resetPressed ||
      !isFiniteVectorLike(velocity) ||
      !isFiniteVectorLike(translation) ||
      !isFiniteNumber(yaw.current) ||
      translation.y < -3
    ) {
      resetCar(body, yaw, throttleValue, steerValue, spawnPosition, spawnYaw);
      stuckClock.current = 0;
      keys.resetPressed = false;
      return;
    }

    horizontalVelocity.set(velocity.x, 0, velocity.z);
    forwardVector.set(Math.sin(yaw.current), 0, Math.cos(yaw.current)).normalize();
    rightVector.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current)).normalize();

    const currentForwardSpeed = horizontalVelocity.dot(forwardVector);
    const currentLateralSpeed = horizontalVelocity.dot(rightVector);
    const signedSpeed = Math.abs(currentForwardSpeed) > 0.05 ? currentForwardSpeed : 0;
    const throttlePressed = rawThrottle !== 0;

    throttleValue.current = damp(
      throttleValue.current,
      rawThrottle,
      rawThrottle === 0 ? THROTTLE_SMOOTHING * 1.25 : THROTTLE_SMOOTHING,
      frameDelta
    );
    steerValue.current = damp(
      steerValue.current,
      rawSteer,
      rawSteer === 0 ? STEER_RELEASE_SMOOTHING : STEER_SMOOTHING,
      frameDelta
    );
    if (rawSteer === 0 && Math.abs(steerValue.current) < 0.012) {
      steerValue.current = 0;
    }

    const grounded = translation.y < 0.86 && Math.abs(velocity.y) < 1.6;
    const boostActive = Boolean(keys.boost && grounded && throttleValue.current >= -0.12);
    if (throttlePressed && horizontalVelocity.lengthSq() < STUCK_SPEED_LIMIT * STUCK_SPEED_LIMIT && grounded) {
      stuckClock.current += frameDelta;
    } else {
      stuckClock.current = 0;
    }
    const stuckRecoveryAvailable = stuckClock.current >= STUCK_RECOVERY_DELAY;
    const currentMaxForward = boostActive
      ? MAX_FORWARD_SPEED * BOOST_MAX_SPEED_MULTIPLIER
      : MAX_FORWARD_SPEED;
    const currentSteeringStrength = boostActive
      ? STEERING_STRENGTH * BOOST_STEERING_CONTROL_MULTIPLIER
      : STEERING_STRENGTH;
    const steerInfluence = THREE.MathUtils.clamp(Math.abs(signedSpeed) / 8, 0.32, 1);
    const reverseSteer = signedSpeed < -0.25 ? -1 : 1;
    const effectiveSteer = rawSteer === 0 ? 0 : steerValue.current;
    const yawRate = THREE.MathUtils.clamp(
      effectiveSteer * currentSteeringStrength * steerInfluence * reverseSteer,
      -MAX_SAFE_YAW_RATE,
      MAX_SAFE_YAW_RATE
    );
    yaw.current += yawRate * frameDelta;
    yaw.current = Math.atan2(Math.sin(yaw.current), Math.cos(yaw.current));

    forwardVector.set(Math.sin(yaw.current), 0, Math.cos(yaw.current)).normalize();
    rightVector.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current)).normalize();

    const boostThrottle =
      boostActive && throttleValue.current >= -0.12
        ? Math.max(throttleValue.current, 0.78)
        : throttleValue.current;
    const desiredSpeed =
      boostThrottle *
      (boostThrottle < 0 ? MAX_REVERSE_SPEED : currentMaxForward);
    const braking = rawThrottle !== 0 && Math.sign(rawThrottle) !== Math.sign(signedSpeed);
    const speedResponse =
      rawThrottle === 0 && !boostActive
        ? ROLLING_DECELERATION
        : braking
          ? BRAKE_ACCELERATION
          : (boostThrottle < 0 ? REVERSE_FORCE : ACCELERATION_FORCE) *
            (boostActive ? BOOST_FORCE_MULTIPLIER : 1);
    const minForwardSpeed = currentForwardSpeed < -MAX_REVERSE_SPEED
      ? currentForwardSpeed
      : -MAX_REVERSE_SPEED;
    const maxForwardSpeed = currentForwardSpeed > currentMaxForward
      ? currentForwardSpeed
      : currentMaxForward;
    const forwardSpeed = THREE.MathUtils.clamp(
      damp(currentForwardSpeed, desiredSpeed, speedResponse, frameDelta),
      minForwardSpeed,
      maxForwardSpeed
    );
    const driftAmount =
      Math.abs(steerValue.current) *
      THREE.MathUtils.clamp(Math.abs(forwardSpeed) / currentMaxForward, 0, 1);
    const sideGrip = THREE.MathUtils.lerp(8.8, 2.7, driftAmount);
    const lateralSpeed = damp(currentLateralSpeed, 0, sideGrip, frameDelta);

    targetVelocity
      .copy(forwardVector)
      .multiplyScalar(forwardSpeed)
      .addScaledVector(rightVector, lateralSpeed);
    horizontalVelocity.copy(targetVelocity);
    clampHorizontalVelocity(horizontalVelocity, MAX_SAFE_LINEAR_SPEED);

    const minX = worldBounds?.minX ?? -ARENA_LIMIT;
    const maxX = worldBounds?.maxX ?? ARENA_LIMIT;
    const minZ = worldBounds?.minZ ?? -ARENA_LIMIT;
    const maxZ = worldBounds?.maxZ ?? ARENA_LIMIT;
    const boundaryPushBack = worldBounds?.pushBack ?? 0;
    carPosition.set(
      translation.x < minX
        ? minX + boundaryPushBack
        : translation.x > maxX
          ? maxX - boundaryPushBack
          : translation.x,
      translation.y,
      translation.z < minZ
        ? minZ + boundaryPushBack
        : translation.z > maxZ
          ? maxZ - boundaryPushBack
          : translation.z
    );
    if (carPosition.x !== translation.x || carPosition.z !== translation.z) {
      body.setTranslation(carPosition, true);
      if (carPosition.x !== translation.x) horizontalVelocity.x = 0;
      if (carPosition.z !== translation.z) horizontalVelocity.z = 0;
    }

    if (velocityResolver) {
      const resolvedVelocity = velocityResolver(carPosition, horizontalVelocity, frameDelta);
      horizontalVelocity.x = resolvedVelocity.x;
      horizontalVelocity.z = resolvedVelocity.z;
    }

    if (useWorldExclusions && pushOutOfBuildingExclusion(carPosition, safeTranslation)) {
      safeTranslation.y = carPosition.y;
      carPosition.copy(safeTranslation);
      body.setTranslation(carPosition, true);
      horizontalVelocity.multiplyScalar(BUILDING_SOFT_PUSH_DAMPING);
    }

    safeTranslation.set(carPosition.x, carPosition.y, carPosition.z);
    if (!isFiniteVectorLike(safeTranslation)) {
      resetCar(body, yaw, throttleValue, steerValue, spawnPosition, spawnYaw);
      stuckClock.current = 0;
      return;
    }

    nextLinearVelocity.x = horizontalVelocity.x;
    nextLinearVelocity.y = THREE.MathUtils.clamp(velocity.y, -MAX_SAFE_LINEAR_SPEED, MAX_SAFE_LINEAR_SPEED);
    nextLinearVelocity.z = horizontalVelocity.z;
    if (!isFiniteVectorLike(nextLinearVelocity)) {
      resetCar(body, yaw, throttleValue, steerValue, spawnPosition, spawnYaw);
      stuckClock.current = 0;
      return;
    }
    body.setLinvel(nextLinearVelocity, true);

    carEuler.set(0, yaw.current, 0);
    carQuaternion.setFromEuler(carEuler);
    body.setRotation(carQuaternion, true);
    body.setAngvel(ZERO_VECTOR, true);

    keys.resetPressed = false;

    if (boostTrailRef.current) {
      boostTrailRef.current.visible = boostActive;
      boostTrailRef.current.scale.z = THREE.MathUtils.lerp(
        boostTrailRef.current.scale.z,
        boostActive ? 1.35 + Math.sin(clock.elapsedTime * 20) * 0.2 : 0.2,
        0.35
      );
    }

    if (targetRef?.current) {
      targetRef.current.position.set(carPosition.x, carPosition.y, carPosition.z);
      targetRef.current.rotation.y = yaw.current;
      targetRef.current.speed = forwardSpeed;
      targetRef.current.steer = steerValue.current;
      targetRef.current.boostActive = boostActive;
      targetRef.current.grounded = grounded;
      targetRef.current.stuckRecoveryAvailable = stuckRecoveryAvailable;
    }

    telemetryClock.current += frameDelta;
    if (telemetryClock.current >= TELEMETRY_INTERVAL) {
      telemetryClock.current = 0;
      onTelemetry?.({
        speed: forwardSpeed,
        boostActive,
        grounded,
        stuckRecoveryAvailable,
        position: {
          x: carPosition.x,
          y: carPosition.y,
          z: carPosition.z,
        },
        yaw: yaw.current,
      });
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={[spawnPosition.x, spawnPosition.y, spawnPosition.z]}
      rotation={[0, spawnYaw, 0]}
      colliders={false}
      enabledRotations={[false, true, false]}
      linearDamping={0.3}
      angularDamping={8}
      canSleep={false}
      ccd
      additionalSolverIterations={4}
    >
      <CuboidCollider args={[1.05, 0.3, 1.3]} friction={0.65} restitution={0.02} />
      <Car boostTrailRef={boostTrailRef} />
    </RigidBody>
  );
}
