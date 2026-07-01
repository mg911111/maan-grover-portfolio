import { memo } from "react";
import { getDestinationAnchorLabel } from "../../data/destinationAnchors";

function getDestinationLabel(section) {
  return getDestinationAnchorLabel(section) || "Projects";
}

export const Hud = memo(function Hud({
  nearbySection,
  canInteract = false,
  selectedDestination,
  navigationSections = [],
  onSelectDestination,
}) {
  return (
    <>
      <aside className="hud" aria-label="Explore Maan's World">
        <div className="hud-card portfolio-intro-card">
          <p className="portfolio-intro-kicker">Start here · Interactive portfolio</p>
          <h2>Explore Maan&rsquo;s World</h2>
          <div className="intro-steps" aria-label="How to explore">
            <span><b>1</b>Pick a portfolio stop</span>
            <span><b>2</b>Drive to the glowing pin</span>
            <span><b>3</b>Press Enter to open</span>
          </div>
          <div className="intro-key-hints" aria-label="Driving controls">
            <span><kbd>WASD / Arrow Keys</kbd><b>Drive</b></span>
            <span><kbd>Space</kbd><b>Boost</b></span>
            <span><kbd>1–6</kbd><b>Choose stop</b></span>
            <span><kbd>Tab</kbd><b>Next stop</b></span>
            <span><kbd>Enter</kbd><b>Open</b></span>
            <span><kbd>Esc</kbd><b>Back / Close</b></span>
          </div>
        </div>
      </aside>

      <aside className="destination-selector" aria-label="Pick a Portfolio Stop">
        <div className="destination-selector-heading">
          <div>
            <span>Pick a Portfolio Stop</span>
            <p>Choose a building, then drive to the glowing pin.</p>
          </div>
          <small>Keys 1–6</small>
        </div>
        <div className="destination-selector-grid">
          {navigationSections.map((section, index) => {
            const selected = section.id === selectedDestination?.id;
            return (
              <button
                key={section.id}
                type="button"
                className={selected ? "destination-choice selected" : "destination-choice"}
                aria-pressed={selected}
                onClick={() => onSelectDestination?.(section.id)}
              >
                <span>{index + 1}</span>
                {getDestinationLabel(section)}
              </button>
            );
          })}
        </div>
      </aside>

      <div
        className={canInteract ? "interaction-prompt ready" : "interaction-prompt"}
        aria-live="polite"
      >
        {canInteract ? <span className="prompt-key">Enter</span> : null}
        <span>
          {canInteract
            ? `Press Enter to open ${getDestinationLabel(nearbySection || selectedDestination)}`
            : "Drive to the glowing entrance"}
        </span>
      </div>

      <div className="control-hint" aria-label="Driving controls">
        <span><kbd>WASD / Arrows</kbd> Drive</span>
        <span><kbd>Space</kbd> Boost</span>
        <span><kbd>1–6</kbd> Destination</span>
        <span><kbd>Tab</kbd> Next</span>
        <span><kbd>Enter</kbd> Open</span>
        <span><kbd>Esc</kbd> Exit</span>
      </div>
    </>
  );
});

Hud.displayName = "Hud";
