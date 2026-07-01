import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CLAMP_RADIUS } from "../../data/sections";

useGLTF.preload("/models/avatar.glb");

export function Player({ positionRef }) {
  const meshRef = useRef();
  const keys = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });
  const { camera } = useThree();
  const { scene } = useGLTF("/models/avatar.glb");
  const avatarScene = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.startsWith("Arrow")) event.preventDefault();
      if (event.key in keys.current) keys.current[event.key] = true;
    };
    const onKeyUp = (event) => {
      if (event.key.startsWith("Arrow")) event.preventDefault();
      if (event.key in keys.current) keys.current[event.key] = false;
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, deltaTime) => {
    const moveSpeed = 15;
    const inputX =
      (keys.current.ArrowRight ? 1 : 0) - (keys.current.ArrowLeft ? 1 : 0);
    const inputZ =
      (keys.current.ArrowUp ? 1 : 0) - (keys.current.ArrowDown ? 1 : 0);

    if (inputX !== 0 || inputZ !== 0) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3()
        .crossVectors(new THREE.Vector3(0, 1, 0), forward)
        .normalize();
      const move = forward
        .multiplyScalar(inputZ)
        .add(right.multiplyScalar(-inputX));
      move.normalize();
      positionRef.current.addScaledVector(move, moveSpeed * deltaTime);

      if (meshRef.current) {
        meshRef.current.rotation.y = Math.atan2(move.x, move.z);
      }
    }

    positionRef.current.x = THREE.MathUtils.clamp(
      positionRef.current.x,
      -CLAMP_RADIUS,
      CLAMP_RADIUS
    );
    positionRef.current.z = THREE.MathUtils.clamp(
      positionRef.current.z,
      -CLAMP_RADIUS,
      CLAMP_RADIUS
    );

    if (meshRef.current) {
      meshRef.current.position.copy(positionRef.current);
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]} name="player">
      <primitive
        object={avatarScene}
        scale={14}
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
}
