import { useGLTF } from "@react-three/drei";
import { Component, Suspense, useMemo } from "react";
import * as THREE from "three";

function applyShadowDefaults(object, shadows) {
  const castShadow = shadows === "cast" || shadows === "all";
  const receiveShadow = shadows === "receive" || shadows === "all";

  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = castShadow;
    child.receiveShadow = receiveShadow;
  });
}

function applyMaterialGrade(object, materialGrade) {
  if (!materialGrade) return;

  const {
    color,
    colorStrength = 0.5,
    emissive,
    emissiveIntensity,
    metalness,
    roughness,
    opacity,
  } = materialGrade;
  const gradeColor = color ? new THREE.Color(color) : null;
  const gradeEmissive = emissive ? new THREE.Color(emissive) : null;

  object.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    const gradedMaterials = materials.map((material) => {
      const clone = material.clone();
      if (gradeColor && clone.color) clone.color.lerp(gradeColor, colorStrength);
      if (gradeEmissive && clone.emissive) clone.emissive.copy(gradeEmissive);
      if (typeof emissiveIntensity === "number") clone.emissiveIntensity = emissiveIntensity;
      if (typeof metalness === "number") clone.metalness = metalness;
      if (typeof roughness === "number") clone.roughness = roughness;
      if (typeof opacity === "number") {
        clone.opacity = opacity;
        clone.transparent = opacity < 1;
      }
      return clone;
    });
    child.material = Array.isArray(child.material) ? gradedMaterials : gradedMaterials[0];
  });
}

function LoadedKitModel({ path, shadows = "all", materialGrade, ...props }) {
  const { scene } = useGLTF(path);
  const modelScene = useMemo(() => {
    const clone = scene.clone(true);
    applyShadowDefaults(clone, shadows);
    applyMaterialGrade(clone, materialGrade);
    return clone;
  }, [scene, shadows, materialGrade]);

  return <primitive object={modelScene} {...props} />;
}

class KitModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, path: props.path };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.path !== state.path) return { failed: false, path: props.path };
    return null;
  }

  componentDidCatch() {
    this.setState({ failed: true });
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export function KitModel({ asset, path, fallback = null, ...props }) {
  const resolvedPath = path || asset;
  if (!resolvedPath) return fallback;

  return (
    <KitModelErrorBoundary path={resolvedPath} fallback={fallback}>
      <Suspense fallback={fallback}>
        <LoadedKitModel path={resolvedPath} {...props} />
      </Suspense>
    </KitModelErrorBoundary>
  );
}
