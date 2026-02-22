'use client';

export default function FlowerBloom({ x, y, bloomed, index }) {
  if (!bloomed) {
    // 蕾（つぼみ）
    return (
      <g transform={`translate(${x}, ${y})`}>
        <circle r="4" fill="#86EFAC" opacity="0.7" />
        <circle r="2.5" fill="#4ADE80" />
      </g>
    );
  }

  // 開花した花（5枚花弁 + 中央）
  const petalCount = 5;
  const petalRadius = 7;
  const centerOffset = 9;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="animate-bloom"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = (i * 360) / petalCount - 90;
        const rad = (angle * Math.PI) / 180;
        const px = Math.cos(rad) * centerOffset;
        const py = Math.sin(rad) * centerOffset;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={petalRadius}
            ry={petalRadius * 0.7}
            transform={`rotate(${angle}, ${px}, ${py})`}
            fill="#F9A8D4"
            opacity="0.85"
          />
        );
      })}
      <circle r="4" fill="#FBBF24" />
    </g>
  );
}
