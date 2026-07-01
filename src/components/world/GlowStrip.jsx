export function MeshBox({
  args,
  position,
  rotation,
  color,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.14,
  roughness = 0.5,
  opacity = 1,
  castShadow = false,
  receiveShadow = false,
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
        metalness={metalness}
        roughness={roughness}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

export function GlowStrip({
  position,
  args,
  color,
  rotation,
  intensity = 0.36,
  opacity = 1,
}) {
  return (
    <MeshBox
      position={position}
      rotation={rotation}
      args={args}
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      metalness={0.06}
      roughness={0.32}
      opacity={opacity}
    />
  );
}
