'use client';

export default function FlowerBloom({ x, y, bloomed, index }) {
  if (!bloomed) {
    // 蕾（つぼみ）— キャノピーに埋もれないよう濃い色で大きめに
    return (
      <g transform={`translate(${x}, ${y})`}>
        <circle r="6" fill="#86EFAC" opacity="0.8" />
        <circle r="3.5" fill="#4ADE80" />
      </g>
    );
  }

  // 開花した花（5枚花弁 + 中央）
  // 外側の<g>で位置決め、内側の<g>でアニメーション（CSS transformがSVG transformを上書きしないように分離）
  const petalCount = 5;
  const petalRadius = 12;
  const centerOffset = 14;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g
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
              opacity="0.9"
            />
          );
        })}
        <circle r="5" fill="#FBBF24" />
      </g>
    </g>
  );
}
