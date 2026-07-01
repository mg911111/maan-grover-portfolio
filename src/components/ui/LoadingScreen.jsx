export function LoadingScreen({ progress = 0 }) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <section className="loading-screen" aria-label="Loading portfolio world">
      <div className="loading-grid" />
      <div className="loading-scanline" />
      <div className="loading-content">
        <p className="loading-kicker">MAAN GROVER</p>
        <h2>Loading portfolio</h2>
        <div className="loading-meter" role="progressbar" aria-valuenow={clampedProgress} aria-valuemin="0" aria-valuemax="100">
          <span style={{ width: `${clampedProgress}%` }} />
        </div>
      </div>
    </section>
  );
}
