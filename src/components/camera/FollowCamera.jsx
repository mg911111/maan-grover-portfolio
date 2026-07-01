import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const desiredPosition = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();
const cameraOffset = new THREE.Vector3();
const lookOffset = new THREE.Vector3();
const CAMERA_BASE_DISTANCE = 25;
const CAMERA_SPEED_DISTANCE = 3.5;
const CAMERA_BASE_HEIGHT = 17.5;
const CAMERA_SPEED_HEIGHT = 1.5;
const CAMERA_LOOK_AHEAD = 14;
const CAMERA_SPEED_LOOK_AHEAD = 2.8;
const CAMERA_LOOK_HEIGHT = 3;
const CAMERA_MIN_TARGET_HEIGHT = 1.05;
const CAMERA_MIN_HEIGHT = 12;
const CAMERA_MIN_DISTANCE = 7;
const CAMERA_MAX_DISTANCE = 55;
const CAMERA_ZOOM_SPEED = 0.025;
const CAMERA_ZOOM_SHARPNESS = 6.5;
const ORBIT_DRAG_SPEED = 0.006;
const ORBIT_PITCH_DRAG_SPEED = 0.012;
const ORBIT_RETURN_SHARPNESS = 0.85;
const ORBIT_MAX_YAW = Math.PI * 0.82;
const ORBIT_MIN_PITCH_OFFSET = -1.25;
const ORBIT_MAX_PITCH_OFFSET = 2.4;

function dampAngle(current, target, sharpness, delta) {
  const angleDelta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + angleDelta * (1 - Math.exp(-sharpness * delta));
}

export function FollowCamera({ targetRef }) {
  const { camera, gl } = useThree();
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const cameraYaw = useRef(0);
  const cameraInitialized = useRef(false);
  const orbitYawOffset = useRef(0);
  const orbitPitchOffset = useRef(0);
  const isDragging = useRef(false);
  const lastPointerX = useRef(0);
  const lastPointerY = useRef(0);
  const lookTarget = useRef(new THREE.Vector3(0, 1, 0));
  const zoomDistance = useRef(CAMERA_BASE_DISTANCE);
  const zoomTargetDistance = useRef(CAMERA_BASE_DISTANCE);

  useEffect(() => {
    const element = gl.domElement;

    function handlePointerDown(event) {
      if (event.button !== 0) return;
      isDragging.current = true;
      lastPointerX.current = event.clientX;
      lastPointerY.current = event.clientY;
      element.setPointerCapture?.(event.pointerId);
    }

    function handlePointerMove(event) {
      if (!isDragging.current) return;
      const dx = event.clientX - lastPointerX.current;
      const dy = event.clientY - lastPointerY.current;
      lastPointerX.current = event.clientX;
      lastPointerY.current = event.clientY;
      orbitYawOffset.current = THREE.MathUtils.clamp(
        orbitYawOffset.current - dx * ORBIT_DRAG_SPEED,
        -ORBIT_MAX_YAW,
        ORBIT_MAX_YAW
      );
      orbitPitchOffset.current = THREE.MathUtils.clamp(
        orbitPitchOffset.current + dy * ORBIT_PITCH_DRAG_SPEED,
        ORBIT_MIN_PITCH_OFFSET,
        ORBIT_MAX_PITCH_OFFSET
      );
    }

    function handlePointerUp(event) {
      isDragging.current = false;
      element.releasePointerCapture?.(event.pointerId);
    }

    function handleWheel(event) {
      event.preventDefault();
      zoomTargetDistance.current = THREE.MathUtils.clamp(
        zoomTargetDistance.current + event.deltaY * CAMERA_ZOOM_SPEED,
        CAMERA_MIN_DISTANCE,
        CAMERA_MAX_DISTANCE
      );
    }

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointercancel", handlePointerUp);
    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("pointercancel", handlePointerUp);
      element.removeEventListener("wheel", handleWheel);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const target = targetRef.current;
    if (!target) return;

    if (!cameraInitialized.current) {
      cameraYaw.current = target.rotation.y;
      cameraInitialized.current = true;
    }

    if (!isDragging.current) {
      orbitYawOffset.current = dampAngle(orbitYawOffset.current, 0, ORBIT_RETURN_SHARPNESS, delta);
      orbitPitchOffset.current = THREE.MathUtils.lerp(
        orbitPitchOffset.current,
        0,
        1 - Math.exp(-ORBIT_RETURN_SHARPNESS * delta)
      );
    }

    cameraYaw.current = dampAngle(cameraYaw.current, target.rotation.y + orbitYawOffset.current, 4.2, delta);
    zoomDistance.current = THREE.MathUtils.lerp(
      zoomDistance.current,
      zoomTargetDistance.current,
      1 - Math.exp(-CAMERA_ZOOM_SHARPNESS * delta)
    );

    const yaw = cameraYaw.current;
    const speedRatio = THREE.MathUtils.clamp(Math.abs(target.speed || 0) / 17.5, 0, 1);
    const distance = zoomDistance.current + speedRatio * CAMERA_SPEED_DISTANCE;
    const zoomHeightOffset = (zoomDistance.current - CAMERA_BASE_DISTANCE) * 0.45;
    const height = CAMERA_BASE_HEIGHT + zoomHeightOffset + speedRatio * CAMERA_SPEED_HEIGHT + orbitPitchOffset.current;

    cameraOffset.set(
      -Math.sin(yaw) * distance,
      height,
      -Math.cos(yaw) * distance
    );
    lookOffset.set(
      Math.sin(target.rotation.y) * (CAMERA_LOOK_AHEAD + speedRatio * CAMERA_SPEED_LOOK_AHEAD),
      CAMERA_LOOK_HEIGHT,
      Math.cos(target.rotation.y) * (CAMERA_LOOK_AHEAD + speedRatio * CAMERA_SPEED_LOOK_AHEAD)
    );

    desiredPosition.copy(target.position).add(cameraOffset);
    desiredPosition.y = Math.max(desiredPosition.y, CAMERA_MIN_HEIGHT);
    desiredTarget.copy(target.position).add(lookOffset);
    desiredTarget.y = Math.max(desiredTarget.y, CAMERA_MIN_TARGET_HEIGHT);

    const followSharpness = 1 - Math.exp(-5.2 * delta);
    camera.position.lerp(desiredPosition, followSharpness);
    camera.position.y = Math.max(camera.position.y, CAMERA_MIN_HEIGHT);
    lookTarget.current.lerp(desiredTarget, 1 - Math.exp(-7.5 * delta));
    camera.up.copy(up);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
