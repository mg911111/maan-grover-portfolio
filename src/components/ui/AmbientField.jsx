const PARTICLES = [
  [8, 18, 4, 0.12, 18, -2],
  [16, 72, 7, 0.1, 24, -8],
  [27, 36, 3, 0.18, 16, -5],
  [38, 86, 5, 0.12, 21, -12],
  [48, 12, 6, 0.09, 27, -15],
  [57, 64, 3, 0.2, 19, -7],
  [66, 28, 8, 0.1, 25, -3],
  [75, 82, 4, 0.16, 17, -10],
  [84, 43, 5, 0.12, 23, -14],
  [93, 16, 3, 0.2, 20, -6],
  [5, 91, 6, 0.08, 26, -18],
  [96, 69, 7, 0.09, 28, -11],
];

export function AmbientField() {
  return (
    <div className="ambient-field" aria-hidden="true">
      <i className="ambient-orb ambient-orb-one" />
      <i className="ambient-orb ambient-orb-two" />
      <i className="ambient-orb ambient-orb-three" />
      {PARTICLES.map(([x, y, size, opacity, duration, delay]) => (
        <i
          className="ambient-particle"
          key={`${x}-${y}`}
          style={{
            "--particle-x": `${x}%`,
            "--particle-y": `${y}%`,
            "--particle-size": `${size}px`,
            "--particle-opacity": opacity,
            "--particle-duration": `${duration}s`,
            "--particle-delay": `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
