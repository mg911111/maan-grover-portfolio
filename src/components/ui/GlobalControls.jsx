import { useEffect, useState } from "react";

export function GlobalControls({ theme, muted, onToggleMuted, onToggleTheme }) {
  const [fullscreenActive, setFullscreenActive] = useState(
    Boolean(document.fullscreenElement || document.webkitFullscreenElement)
  );

  useEffect(() => {
    const onFullscreenChange = () => setFullscreenActive(
      Boolean(document.fullscreenElement || document.webkitFullscreenElement)
    );
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
        await exitFullscreen?.call(document);
      } else {
        const requestFullscreen = document.documentElement.requestFullscreen ||
          document.documentElement.webkitRequestFullscreen;
        await requestFullscreen?.call(document.documentElement);
      }
    } catch (error) {
      console.warn("Fullscreen is unavailable in this browser context.", error);
    }
  };

  const toggleTheme = () => {
    onToggleTheme();
  };

  return (
    <aside className="global-controls" aria-label="Portfolio controls">
      <button
        type="button"
        className={fullscreenActive ? "active" : ""}
        onClick={toggleFullscreen}
        title={fullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
        aria-label={fullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
        aria-pressed={fullscreenActive}
      >
        <span aria-hidden="true">{fullscreenActive ? "↙" : "⛶"}</span>
        <small>{fullscreenActive ? "Exit" : "Full"}</small>
      </button>

      <button
        type="button"
        className={!muted ? "active" : ""}
        onClick={onToggleMuted}
        title={muted ? "Enable Sound" : "Mute Sound"}
        aria-label={muted ? "Enable Sound" : "Mute Sound"}
        aria-pressed={!muted}
      >
        <span aria-hidden="true">{muted ? "∅" : "♪"}</span>
        <small>{muted ? "Muted" : "Sound"}</small>
      </button>

      <button
        type="button"
        className={theme === "dawn" ? "active" : ""}
        onClick={toggleTheme}
        title={theme === "dawn" ? "Switch World to Night" : "Switch World to Day"}
        aria-label={theme === "dawn" ? "Switch World to Night" : "Switch World to Day"}
        aria-pressed={theme === "dawn"}
      >
        <span aria-hidden="true">{theme === "dawn" ? "☀" : "◐"}</span>
        <small>{theme === "dawn" ? "Day" : "Night"}</small>
      </button>
    </aside>
  );
}
