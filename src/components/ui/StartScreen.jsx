import { useEffect, useRef } from "react";
import { AmbientField } from "./AmbientField";

function updateTilt(event) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  element.style.setProperty("--card-rotate-x", `${y * -7}deg`);
  element.style.setProperty("--card-rotate-y", `${x * 9}deg`);
  element.style.setProperty("--card-glow-x", `${(x + 0.5) * 100}%`);
  element.style.setProperty("--card-glow-y", `${(y + 0.5) * 100}%`);
  element.style.setProperty("--card-magnet-x", `${x * 7}px`);
  element.style.setProperty("--card-magnet-y", `${y * 6}px`);
}

function resetTilt(event) {
  event.currentTarget.style.setProperty("--card-rotate-x", "0deg");
  event.currentTarget.style.setProperty("--card-rotate-y", "0deg");
  event.currentTarget.style.setProperty("--card-magnet-x", "0px");
  event.currentTarget.style.setProperty("--card-magnet-y", "0px");
}

export function StartScreen({ onEnterWorld, onViewPortfolio }) {
  const screenRef = useRef(null);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let frameId = 0;

    const onPointerMove = (event) => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        screen.style.setProperty("--mouse-x", `${event.clientX}px`);
        screen.style.setProperty("--mouse-y", `${event.clientY}px`);
        screen.style.setProperty("--mouse-nx", `${event.clientX / window.innerWidth - 0.5}`);
        screen.style.setProperty("--mouse-ny", `${event.clientY / window.innerHeight - 0.5}`);
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <section ref={screenRef} className="choice-screen interactive-shell" aria-label="Choose portfolio experience">
      <div className="landing-gradient" />
      <div className="landing-grid" />
      <div className="cinematic-noise" />
      <div className="start-vignette" />
      <AmbientField />
      <div className="interactive-spotlight" />
      <div className="cursor-glow" />

      <main className="choice-content">
        <h1>Choose your experience</h1>
        <p className="choice-subtitle">
          Choose how you want to explore: drive the 3D world or enter the cinematic hub.
        </p>

        <div className="choice-card-grid" aria-label="Portfolio experience choices">
          <button
            className="choice-card primary"
            type="button"
            onClick={onEnterWorld}
            onPointerMove={updateTilt}
            onPointerLeave={resetTilt}
          >
            <span className="choice-profile-art drive-profile-art" aria-hidden="true"><i /><i /><i /></span>
            <strong>Drive the 3D World</strong>
            <p>Interactive driving portfolio</p>
          </button>
          <button
            className="choice-card"
            type="button"
            onClick={onViewPortfolio}
            onPointerMove={updateTilt}
            onPointerLeave={resetTilt}
          >
            <span className="choice-profile-art watch-profile-art" aria-hidden="true"><i /><i /><i /></span>
            <strong>Browse Portfolio Hub</strong>
            <p>cinematic hub for a faster look.</p>
          </button>
        </div>
      </main>
    </section>
  );
}
