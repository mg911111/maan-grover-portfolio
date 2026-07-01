import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function Ocean() {
  const materialRef = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#1f3436") },
      uShallow: { value: new THREE.Color("#54706d") },
      uFoam: { value: new THREE.Color("#b9eee7") },
    }),
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.46, 0]}>
      <circleGeometry args={[180, 96]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;

          void main() {
            vUv = uv;
            vec3 p = position;
            float waveA = sin((p.x * 0.075) + uTime * 0.72) * 0.08;
            float waveB = sin((p.y * 0.115) - uTime * 0.46) * 0.055;
            float waveC = sin((p.x + p.y) * 0.04 + uTime * 0.28) * 0.045;
            vWave = waveA + waveB + waveC;
            p.z += vWave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform vec3 uFoam;
          varying vec2 vUv;
          varying float vWave;

          void main() {
            vec2 center = vUv - vec2(0.5);
            float radius = length(center) * 2.0;
            float shallow = smoothstep(0.12, 0.86, radius);
            float ripple = sin((vUv.x * 34.0) + (vUv.y * 16.0) + uTime * 0.9) * 0.5 + 0.5;
            float fine = sin((vUv.y * 72.0) - uTime * 1.35) * 0.5 + 0.5;
            vec3 color = mix(uDeep, uShallow, shallow * 0.68);
            color = mix(color, uFoam, ripple * fine * 0.07 + max(vWave, 0.0) * 0.35);
            float alpha = 0.9 + shallow * 0.04;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}
