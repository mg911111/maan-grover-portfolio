import { useGLTF } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useState } from "react";
import { Box3, Vector3 } from "three";

const modelAvailability = new Map();

function applyModelDefaults(object, shadows = "none") {
  const castShadow = shadows === "cast" || shadows === "all";
  const receiveShadow = shadows === "receive" || shadows === "all";

  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = castShadow;
      child.receiveShadow = receiveShadow;
    }
  });
}

function LoadedModel({ path, shadows = "none", normalizeHeight, ...props }) {
  const { scene } = useGLTF(path);
  const normalizedModel = useMemo(() => {
    const clone = scene.clone(true);
    applyModelDefaults(clone, shadows);
    if (!normalizeHeight) return { scene: clone, scale: 1, position: [0, 0, 0] };

    clone.updateMatrixWorld(true);
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    if (!Number.isFinite(size.y) || size.y <= 0) return { scene: clone, scale: 1, position: [0, 0, 0] };

    const scale = normalizeHeight / size.y;
    return {
      scene: clone,
      scale,
      position: [-center.x * scale, -box.min.y * scale, -center.z * scale],
    };
  }, [scene, shadows, normalizeHeight]);

  return (
    <group position={normalizedModel.position} {...props}>
      <primitive object={normalizedModel.scene} scale={normalizedModel.scale} />
    </group>
  );
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, resetKey: props.resetKey };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) {
      return { failed: false, resetKey: props.resetKey };
    }

    return null;
  }

  componentDidCatch() {
    modelAvailability.set(this.props.resetKey, false);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export function Model({ path, fallback = null, ...props }) {
  const cachedAvailability = modelAvailability.get(path);
  const [available, setAvailable] = useState(cachedAvailability);

  useEffect(() => {
    let cancelled = false;

    if (modelAvailability.has(path)) {
      setAvailable(modelAvailability.get(path));
      return undefined;
    }

    setAvailable(undefined);

    fetch(path, { method: "HEAD" })
      .then((response) => {
        const exists = response.ok;
        modelAvailability.set(path, exists);
        if (exists) useGLTF.preload(path);
        if (!cancelled) setAvailable(exists);
      })
      .catch(() => {
        modelAvailability.set(path, false);
        if (!cancelled) setAvailable(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!available) return fallback;

  return (
    <ModelErrorBoundary fallback={fallback} resetKey={path}>
      <Suspense fallback={fallback}>
        <LoadedModel path={path} {...props} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
