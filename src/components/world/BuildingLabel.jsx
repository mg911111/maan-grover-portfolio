import { Text } from "@react-three/drei";
import * as THREE from "three";
import { WORLD_COLORS } from "../../data/districtMap";
import { MeshBox } from "./GlowStrip";

export function BuildingLabel({
  text,
  position,
  rotation,
  width = 5.8,
  height = 0.78,
  fontSize = 0.46,
  accent = WORLD_COLORS.cyan,
}) {
  return (
    <group position={position} rotation={rotation}>
      <MeshBox
        position={[0, 0, -0.035]}
        args={[width, height, 0.045]}
        color="#172327"
        emissive="#172327"
        emissiveIntensity={0.02}
        metalness={0.16}
        roughness={0.34}
        opacity={0.96}
      />
      <Text
        position={[0, -0.005, 0.012]}
        fontSize={fontSize}
        maxWidth={width - 0.5}
        anchorX="center"
        anchorY="middle"
        color="#f7f2e8"
        outlineWidth={0.012}
        outlineColor="#101719"
        material-side={THREE.FrontSide}
      >
        {text}
      </Text>
      <MeshBox
        position={[0, -height * 0.42, 0.018]}
        args={[width * 0.42, 0.028, 0.028]}
        color={accent}
        emissive={accent}
        emissiveIntensity={0.16}
        metalness={0.08}
        roughness={0.42}
        opacity={0.9}
      />
    </group>
  );
}
