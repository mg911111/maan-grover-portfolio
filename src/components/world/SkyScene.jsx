import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { WORLD_COLORS } from "../../data/districtMap";

const CINEMATIC_SKY = {
  top: "#050b1c",
  mid: "#10294a",
  bottom: "#29496a",
  glow: "#d47a42",
};

const DAY_SKY = {
  top: "#4f9fd0",
  mid: "#82c4e4",
  bottom: "#d4e9ef",
  glow: "#fff0c6",
};

function createCelestialGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 18, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.92)");
  gradient.addColorStop(0.22, "rgba(255, 255, 255, 0.4)");
  gradient.addColorStop(0.55, "rgba(255, 255, 255, 0.12)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function SkyScene({ cinematic = false, timeOfDay = "night" }) {
  const cloudRefs = useRef([]);
  const celestialGlowTexture = useMemo(() => createCelestialGlowTexture(), []);
  const isDay = timeOfDay === "dawn";
  const skyPalette = isDay ? DAY_SKY : cinematic ? CINEMATIC_SKY : {
    top: WORLD_COLORS.skyTop,
    mid: WORLD_COLORS.skyMid,
    bottom: WORLD_COLORS.horizon,
    glow: WORLD_COLORS.horizonGlow,
  };
  const clouds = useMemo(
    () =>
      new Array(8).fill(0).map((_, index) => ({
        position: new THREE.Vector3(
          -104 + index * 24,
          30 + (index % 3) * 2.2,
          -88 + (index % 5) * 38
        ),
        scale: 5.8 + (index % 4) * 0.9,
        speed: 0.003 + index * 0.0006,
      })),
    []
  );

  useEffect(() => () => celestialGlowTexture.dispose(), [celestialGlowTexture]);

  useFrame((_, delta) => {
    clouds.forEach((cloud, index) => {
      const ref = cloudRefs.current[index];
      if (!ref) return;
      ref.position.x += cloud.speed * delta * 60;
      if (ref.position.x > 112) ref.position.x = -112;
    });

  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[250, 32, 16]} />
        <shaderMaterial
          key={isDay ? "day-sky" : "night-sky"}
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            topColor: { value: new THREE.Color(skyPalette.top) },
            midColor: { value: new THREE.Color(skyPalette.mid) },
            bottomColor: { value: new THREE.Color(skyPalette.bottom) },
            glowColor: { value: new THREE.Color(skyPalette.glow) },
          }}
          vertexShader={`
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 topColor;
            uniform vec3 midColor;
            uniform vec3 bottomColor;
            uniform vec3 glowColor;
            varying vec3 vWorldPosition;
            void main() {
              vec3 n = normalize(vWorldPosition);
              float h = n.y * 0.5 + 0.5;
              float horizon = smoothstep(0.04, 0.24, h);
              vec3 base = mix(bottomColor, midColor, horizon);
              vec3 sky = mix(base, topColor, smoothstep(0.38, 1.0, h));
              float horizonBand = (1.0 - smoothstep(0.18, 0.5, h)) * smoothstep(0.0, 0.16, h);
              float cityGlow = smoothstep(0.96, 0.12, abs(n.x - 0.18)) * horizonBand;
              sky = mix(sky, glowColor, cityGlow * 0.24 + horizonBand * 0.1);
              gl_FragColor = vec4(sky, 1.0);
            }
          `}
        />
      </mesh>

      <group position={isDay ? [-82, 92, -42] : cinematic ? [105, 25, -8] : [-62, 76, 34]}>
        <mesh>
          <sphereGeometry args={[isDay ? 6.5 : cinematic ? 8 : 10.5, 36, 18]} />
          <meshBasicMaterial color={isDay ? "#fff8d8" : cinematic ? "#fff0bd" : WORLD_COLORS.moon} toneMapped={false} />
        </mesh>
        <sprite scale={isDay ? [54, 54, 1] : cinematic ? [46, 46, 1] : [36, 36, 1]}>
          <spriteMaterial
            map={celestialGlowTexture}
            color={isDay ? "#fff2b8" : cinematic ? "#ffb060" : WORLD_COLORS.moonGlow}
            transparent
            opacity={isDay ? 0.58 : cinematic ? 0.9 : 0.35}
            depthWrite={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      </group>

      {clouds.map((cloud, index) => (
        <group
          key={`night-cloud-${index}`}
          ref={(el) => {
            cloudRefs.current[index] = el;
          }}
          position={cloud.position}
          scale={[cloud.scale, cloud.scale * 0.3, cloud.scale * 0.8]}
        >
          <mesh>
            <sphereGeometry args={[1.25, 14, 10]} />
            <meshStandardMaterial color={isDay ? "#f5fbfd" : cinematic ? "#263a55" : "#f4f1e7"} roughness={0.96} transparent opacity={isDay ? 0.62 : cinematic ? 0.24 : 0.52} />
          </mesh>
          <mesh position={[1.35, 0.1, 0.08]}>
            <sphereGeometry args={[1.05, 14, 10]} />
            <meshStandardMaterial color={isDay ? "#e8f2f5" : cinematic ? "#1c304c" : "#e5edf0"} roughness={0.96} transparent opacity={isDay ? 0.54 : cinematic ? 0.2 : 0.46} />
          </mesh>
          <mesh position={[-1.15, 0.02, -0.04]}>
            <sphereGeometry args={[0.92, 14, 10]} />
            <meshStandardMaterial color={isDay ? "#ffffff" : cinematic ? "#314760" : "#fff4df"} roughness={0.96} transparent opacity={isDay ? 0.5 : cinematic ? 0.18 : 0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
