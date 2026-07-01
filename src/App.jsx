import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Experience } from "./components/scene/Experience";
import { GlobalControls } from "./components/ui/GlobalControls";
import { Hud } from "./components/ui/Hud";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { PortfolioPanel } from "./components/ui/PortfolioPanel";
import { PortfolioWebsite } from "./components/ui/QuickPortfolioView";
import { StartScreen } from "./components/ui/StartScreen";
import { AudioSystem } from "./components/ui/AudioSystem";
import { NAVIGATION_SECTIONS, getSectionAccessPosition } from "./data/sections";
import { getDestinationAnchorLabel } from "./data/destinationAnchors";
import "./App.css";

const INTERACTION_COOLDOWN_MS = 350;
const LOW_SPEED_INTERACTION_LIMIT = 2.25;
const LOADING_DURATION_MS = 1200;
const ENABLE_DEV_STATS = import.meta.env.DEV;
const CANVAS_GL_CONFIG = {
  antialias: true,
  powerPreference: "high-performance",
  stencil: false,
};
const CANVAS_SHADOWS = { enabled: true, type: THREE.PCFSoftShadowMap };

class WorldErrorBoundary extends Component {
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

  componentDidCatch(error, errorInfo) {
    console.error("3D world crashed", error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

class UiErrorBoundary extends Component {
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

  componentDidCatch(error, errorInfo) {
    console.error("Portfolio shell crashed", error, errorInfo);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function DebugStats({ visible }) {
  if (!ENABLE_DEV_STATS || !visible) return null;
  return <Stats showPanel={0} />;
}

function WorldErrorOverlay({ error, onReload, onReturnHome }) {
  return (
    <div className="world-error-overlay" role="alert">
      <div className="world-error-card">
        <p className="world-error-kicker">3D world crashed</p>
        <h2>3D world crashed. Press reload.</h2>
        <p>The page stayed alive. Reload the 3D world to restart the scene.</p>
        <code>{error?.message || "WebGL context lost"}</code>
        <div className="world-error-actions">
          <button type="button" onClick={onReload}>Reload</button>
          <button type="button" onClick={onReturnHome}>Return Home</button>
        </div>
      </div>
    </div>
  );
}

function ShellFallback({ onEnterWorld, onBackToStart }) {
  return (
    <section className="shell-fallback" role="alert">
      <div className="shell-fallback-card">
        <p className="start-kicker">Portfolio loading issue</p>
        <h1>Portfolio loading issue</h1>
        <div className="landing-actions">
          <button className="start-button primary" type="button" onClick={onEnterWorld}>
            Enter 3D World
          </button>
          <button className="start-button secondary" type="button" onClick={onBackToStart}>
            Back to Start
          </button>
        </div>
      </div>
    </section>
  );
}

function roundCoordinate(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function CalibrationPanel({ position, selectedDestination }) {
  const label = getDestinationAnchorLabel(selectedDestination);
  return (
    <aside className="calibration-panel" aria-label="Access pad calibration">
      <strong>Access Pad Calibration</strong>
      <span>
        Position: x {roundCoordinate(position?.x).toFixed(2)} · y{" "}
        {roundCoordinate(position?.y).toFixed(2)} · z {roundCoordinate(position?.z).toFixed(2)}
      </span>
      <span>
        Selected: {selectedDestination?.id || "none"} / {label}
      </span>
      <p>Drive to desired entrance position, press C to copy coordinates.</p>
    </aside>
  );
}

export default function App() {
  const [calibrationEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("calibrate") === "1";
  });
  const [appStage, setAppStage] = useState("loading");
  const [uiTheme, setUiTheme] = useState(() => {
    if (typeof window === "undefined") return "night";
    try {
      return window.localStorage.getItem("maan-portfolio-theme") === "dawn" ? "dawn" : "night";
    } catch {
      return "night";
    }
  });
  const [musicMuted, setMusicMuted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showAccessDebug, setShowAccessDebug] = useState(false);
  const [worldResetKey, setWorldResetKey] = useState(0);
  const [worldError, setWorldError] = useState(null);
  const latestTelemetry = useRef({
    speed: 0,
    boostActive: false,
    grounded: true,
    stuckRecoveryAvailable: false,
    position: { x: 0, y: 0, z: 0 },
    yaw: 0,
  });
  const audioSystemRef = useRef(null);
  const [calibrationPosition, setCalibrationPosition] = useState({ x: 0, y: 0, z: 0 });
  const [calibrationMarkers, setCalibrationMarkers] = useState([]);
  const [isCarSlow, setIsCarSlow] = useState(true);
  const isCarSlowRef = useRef(true);
  const [nearbySection, setNearbySection] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [discoveredSectionIds, setDiscoveredSectionIds] = useState([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState(
    NAVIGATION_SECTIONS[0]?.id || "projects"
  );
  const lastInteractionAt = useRef(0);
  const loggedPromptId = useRef(null);
  const selectedDestination = useMemo(
    () =>
      NAVIGATION_SECTIONS.find((section) => section.id === selectedDestinationId) ||
      NAVIGATION_SECTIONS[0],
    [selectedDestinationId]
  );

  const selectDestinationByIndex = useCallback((index) => {
    const destination = NAVIGATION_SECTIONS[index];
    if (!destination) return;
    setSelectedDestinationId(destination.id);
  }, []);

  const cycleDestination = useCallback(() => {
    setSelectedDestinationId((currentId) => {
      const currentIndex = NAVIGATION_SECTIONS.findIndex((section) => section.id === currentId);
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % NAVIGATION_SECTIONS.length;
      return NAVIGATION_SECTIONS[nextIndex]?.id || currentId;
    });
  }, []);

  const handleTelemetry = useCallback((telemetry) => {
    latestTelemetry.current = telemetry;
    if (calibrationEnabled) {
      setCalibrationPosition({
        x: telemetry.position?.x || 0,
        y: telemetry.position?.y || 0,
        z: telemetry.position?.z || 0,
      });
    }
    const nextIsCarSlow = Math.abs(telemetry.speed) <= LOW_SPEED_INTERACTION_LIMIT;
    if (nextIsCarSlow !== isCarSlowRef.current) {
      isCarSlowRef.current = nextIsCarSlow;
      setIsCarSlow(nextIsCarSlow);
    }
  }, [calibrationEnabled]);

  const handleNearbySection = useCallback((section, accessInfo) => {
    if (import.meta.env.DEV && section && loggedPromptId.current !== section.id) {
      loggedPromptId.current = section.id;
      console.info("nearbyAccessibleSection", {
        id: section.id,
        distanceToAccess: accessInfo?.distanceToAccess,
        carPosition: accessInfo?.carPosition,
      });
    }
    if (!section && loggedPromptId.current) loggedPromptId.current = null;
    setNearbySection(section);
  }, []);

  const closePanel = useCallback(() => {
    setOpenSection(null);
  }, []);

  const openNearbySection = useCallback(() => {
    if (!nearbySection) return false;

    const now = window.performance.now();
    if (now - lastInteractionAt.current < INTERACTION_COOLDOWN_MS) return false;

    lastInteractionAt.current = now;
    setOpenSection(nearbySection.id);
    setDiscoveredSectionIds((currentIds) =>
      currentIds.includes(nearbySection.id)
        ? currentIds
        : [...currentIds, nearbySection.id]
    );
    return true;
  }, [nearbySection]);

  const openResumePdf = useCallback(() => {
    window.open("/files/Resume_MaanGrover.pdf", "_blank", "noopener,noreferrer");
  }, []);

  const toggleUiTheme = useCallback(() => {
    setUiTheme((currentTheme) => {
      const nextTheme = currentTheme === "night" ? "dawn" : "night";
      try {
        window.localStorage.setItem("maan-portfolio-theme", nextTheme);
      } catch {
        // Theme still updates for this session when storage is unavailable.
      }
      return nextTheme;
    });
  }, []);

  const enterWorld = useCallback(() => {
    audioSystemRef.current?.activate("world");
    setWorldError(null);
    setAppStage("world");
  }, []);

  const backToStart = useCallback(() => {
    setWorldError(null);
    setNearbySection(null);
    setOpenSection(null);
    setAppStage("choice");
  }, []);

  const openPortfolioWebsite = useCallback(() => {
    audioSystemRef.current?.activate("portfolio");
    setWorldError(null);
    setNearbySection(null);
    setOpenSection(null);
    setAppStage("portfolio");
  }, []);

  const toggleMusicMuted = useCallback(() => {
    const nextMuted = !musicMuted;
    setMusicMuted(nextMuted);
    audioSystemRef.current?.setMusicMuted(nextMuted, appStage);
  }, [appStage, musicMuted]);

  const openQuickSection = useCallback((sectionId) => {
    setOpenSection(sectionId);
    setDiscoveredSectionIds((currentIds) =>
      currentIds.includes(sectionId) ? currentIds : [...currentIds, sectionId]
    );
  }, []);

  const handleWorldError = useCallback((error) => {
    setWorldError(error || new Error("3D world error"));
  }, []);

  const reloadWorld = useCallback(() => {
    setWorldError(null);
    setNearbySection(null);
    setOpenSection(null);
    setWorldResetKey((key) => key + 1);
    setAppStage("world");
  }, []);

  const returnHome = useCallback(() => {
    setWorldError(null);
    setNearbySection(null);
    setOpenSection(null);
    setAppStage("choice");
  }, []);

  const handleCanvasCreated = useCallback(({ gl }) => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.9;
    gl.outputColorSpace = THREE.SRGBColorSpace;

    const canvas = gl?.domElement;
    if (!canvas) return;

    const onContextLost = (event) => {
      event.preventDefault();
      const error = new Error("WebGL context lost");
      console.error("WebGL context lost", event);
      setWorldError(error);
    };
    const onContextRestored = () => {
      console.info("WebGL context restored");
    };

    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);
  }, []);

  useEffect(() => {
    if (appStage !== "loading") return undefined;

    const startedAt = window.performance.now();
    let completed = false;
    const finishLoading = () => {
      if (completed) return;
      completed = true;
      setLoadingProgress(100);
      setAppStage("choice");
    };

    const progressTimer = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt;
      const nextProgress = Math.min(100, (elapsed / LOADING_DURATION_MS) * 100);
      setLoadingProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(progressTimer);
        window.setTimeout(finishLoading, 120);
      }
    }, 35);
    const fallbackTimer = window.setTimeout(finishLoading, LOADING_DURATION_MS + 500);

    return () => {
      completed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [appStage]);

  useEffect(() => {
    if (appStage !== "world") return undefined;

    const preventWorldScroll = (event) => {
      if (event.target instanceof HTMLCanvasElement) event.preventDefault();
    };

    window.addEventListener("wheel", preventWorldScroll, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", preventWorldScroll, { capture: true });
  }, [appStage]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat) return;
      if (appStage !== "world") {
        if (appStage === "portfolio" && event.code === "Escape" && openSection) {
          event.preventDefault();
          audioSystemRef.current?.playEffect("click");
          setOpenSection(null);
        }
        return;
      }

      if (ENABLE_DEV_STATS && event.code === "KeyF") {
        event.preventDefault();
        setShowStats((visible) => !visible);
        return;
      }

      if (import.meta.env.DEV && event.code === "KeyG") {
        event.preventDefault();
        setShowAccessDebug((visible) => !visible);
        return;
      }

      if (calibrationEnabled && event.code === "KeyC") {
        event.preventDefault();
        const position = latestTelemetry.current.position || { x: 0, y: 0, z: 0 };
        const payload = {
          id: selectedDestination?.id || selectedDestinationId,
          label: getDestinationAnchorLabel(selectedDestination),
          accessPosition: {
            x: roundCoordinate(position.x),
            y: roundCoordinate(position.y),
            z: roundCoordinate(position.z),
          },
        };
        const formattedPayload = `DESTINATION_COORD_COPY:\n${JSON.stringify(payload, null, 2)}`;
        console.log(formattedPayload);
        navigator.clipboard?.writeText(JSON.stringify(payload, null, 2)).catch((error) => {
          console.warn("Clipboard copy failed; coordinate was logged instead.", error);
        });
        setCalibrationMarkers((markers) => [
          ...markers,
          {
            id: `${payload.id}-${Date.now()}`,
            label: payload.label,
            position: payload.accessPosition,
          },
        ]);
        return;
      }

      if (event.code === "Tab") {
        event.preventDefault();
        audioSystemRef.current?.playEffect("hover");
        cycleDestination();
        return;
      }

      if (event.code.startsWith("Digit") || event.code.startsWith("Numpad")) {
        const destinationIndex = Number(event.code.replace("Digit", "").replace("Numpad", "")) - 1;
        if (destinationIndex >= 0 && destinationIndex < NAVIGATION_SECTIONS.length) {
          event.preventDefault();
          audioSystemRef.current?.playEffect("click");
          selectDestinationByIndex(destinationIndex);
          return;
        }
      }

      if (event.code === "Space") {
        audioSystemRef.current?.playEffect("click");
        return;
      }

      if (nearbySection?.interactionCode === event.code) {
        event.preventDefault();
        openNearbySection();
      }

      if (event.code === "Enter" && nearbySection) {
        event.preventDefault();
        openNearbySection();
      }

      if (event.code === "Escape") {
        event.preventDefault();
        audioSystemRef.current?.playEffect("click");
        if (openSection) {
          setOpenSection(null);
        } else {
          returnHome();
        }
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    appStage,
    calibrationEnabled,
    cycleDestination,
    nearbySection,
    openNearbySection,
    openSection,
    returnHome,
    selectDestinationByIndex,
    selectedDestination,
    selectedDestinationId,
  ]);

  const canInteract = Boolean(nearbySection);

  useEffect(() => {
    if (!import.meta.env.DEV || !selectedDestination) return;
    const [accessX, accessZ] = getSectionAccessPosition(selectedDestination);
    const distanceToAccess = Math.hypot(
      accessX - (latestTelemetry.current.position?.x || 0),
      accessZ - (latestTelemetry.current.position?.z || 0)
    );
    console.info("selectedSection", {
      id: selectedDestination.id,
      title: selectedDestination.title,
      buildingPosition: selectedDestination.buildingPosition,
      accessPosition: selectedDestination.accessPosition,
      accessRadius: selectedDestination.accessRadius,
      distanceToAccess: Math.round(distanceToAccess * 10) / 10,
    });
  }, [selectedDestinationId, selectedDestination]);

  return (
    <div className={`app ui-theme-${uiTheme}`}>
      {appStage === "world" ? (
        <>
          {!worldError ? (
            <WorldErrorBoundary resetKey={worldResetKey} onError={handleWorldError}>
              <Canvas
                key={worldResetKey}
                dpr={[1, 1.5]}
                gl={CANVAS_GL_CONFIG}
                shadows={CANVAS_SHADOWS}
                camera={{ position: [-25, 18, -42], fov: 48, near: 0.1, far: 320 }}
                className="canvas"
                onCreated={handleCanvasCreated}
              >
                <Experience
                  timeOfDay={uiTheme}
                  onNearbySection={handleNearbySection}
                  onTelemetry={handleTelemetry}
                  activeSectionId={openSection || nearbySection?.id || selectedDestinationId}
                  discoveredSectionIds={discoveredSectionIds}
                  selectedDestinationId={selectedDestinationId}
                  showAccessDebug={showAccessDebug}
                  calibrationMarkers={calibrationEnabled ? calibrationMarkers : []}
                />
                <DebugStats visible={showStats} />
              </Canvas>
            </WorldErrorBoundary>
          ) : null}
          <Hud
            nearbySection={nearbySection}
            canInteract={canInteract}
            selectedDestination={selectedDestination}
            navigationSections={NAVIGATION_SECTIONS}
            onSelectDestination={setSelectedDestinationId}
          />
          <div className="world-mode-actions">
            <button className="mode-switch-button" type="button" onClick={openPortfolioWebsite}>
              Switch to Portfolio Website
            </button>
            <button className="mode-switch-button secondary" type="button" onClick={backToStart}>
              Back to Start
            </button>
          </div>
          <PortfolioPanel activeSection={openSection} onClose={closePanel} />
          {calibrationEnabled ? (
            <CalibrationPanel
              position={calibrationPosition}
              selectedDestination={selectedDestination}
            />
          ) : null}
          {worldError ? (
            <WorldErrorOverlay
              error={worldError}
              onReload={reloadWorld}
              onReturnHome={returnHome}
            />
          ) : null}
        </>
      ) : null}

      {appStage === "portfolio" ? (
        <UiErrorBoundary
          resetKey={appStage}
          fallback={<ShellFallback onEnterWorld={enterWorld} onBackToStart={backToStart} />}
        >
          <>
            <PortfolioWebsite
              sections={NAVIGATION_SECTIONS}
              activeSectionId={openSection}
              onOpenSection={openQuickSection}
              onEnterWorld={enterWorld}
              onBackToStart={backToStart}
              onViewResume={openResumePdf}
            />
            <PortfolioPanel activeSection={openSection} onClose={closePanel} />
          </>
        </UiErrorBoundary>
      ) : null}

      {appStage === "choice" ? (
        <UiErrorBoundary
          resetKey={appStage}
          fallback={<ShellFallback onEnterWorld={enterWorld} onBackToStart={backToStart} />}
        >
          <StartScreen
            onEnterWorld={enterWorld}
            onViewPortfolio={openPortfolioWebsite}
          />
        </UiErrorBoundary>
      ) : null}
      {appStage === "loading" ? <LoadingScreen progress={loadingProgress} /> : null}
      <AudioSystem
        ref={audioSystemRef}
        stage={appStage}
        musicMuted={musicMuted}
        panelOpen={openSection}
      />
      {appStage === "choice" || appStage === "world" || appStage === "portfolio" ? (
        <GlobalControls
          theme={uiTheme}
          muted={musicMuted}
          onToggleMuted={toggleMusicMuted}
          onToggleTheme={toggleUiTheme}
        />
      ) : null}
      {!["loading", "choice", "world", "portfolio"].includes(appStage) ? (
        <ShellFallback onEnterWorld={enterWorld} onBackToStart={backToStart} />
      ) : null}
    </div>
  );
}
