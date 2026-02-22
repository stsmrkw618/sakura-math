'use client';

import FlowerBloom from './FlowerBloom';

// Cloud-like canopy shapes around branch tips.
// Multiple overlapping ellipses per region create organic foliage mass.
// Each region overlaps with actual branch endpoints so flowers never "float".
const CANOPY_CLOUDS = [
  // Top crown (branch tips: 150,80 / 120,85 / 175,80)
  { cx: 150, cy: 82, rx: 38, ry: 22 },
  { cx: 136, cy: 90, rx: 24, ry: 15 },
  { cx: 168, cy: 78, rx: 22, ry: 14 },
  // Upper-left (branch tips: 60,130 / 75,120)
  { cx: 70, cy: 126, rx: 30, ry: 20 },
  { cx: 58, cy: 134, rx: 18, ry: 13 },
  { cx: 84, cy: 118, rx: 18, ry: 13 },
  // Upper-right (branch tips: 240,130 / 225,120)
  { cx: 230, cy: 126, rx: 30, ry: 20 },
  { cx: 242, cy: 134, rx: 18, ry: 13 },
  { cx: 216, cy: 118, rx: 18, ry: 13 },
  // Middle-left (branch path ~170-195)
  { cx: 80, cy: 178, rx: 30, ry: 22 },
  { cx: 62, cy: 192, rx: 18, ry: 13 },
  // Middle-right (branch path ~170-195)
  { cx: 220, cy: 178, rx: 30, ry: 22 },
  { cx: 238, cy: 192, rx: 18, ry: 13 },
  // Center (top branch path ~120-160)
  { cx: 150, cy: 142, rx: 24, ry: 18 },
  // Lower-left (branch tip: 50,220)
  { cx: 58, cy: 214, rx: 24, ry: 16 },
  // Lower-right (branch tip: 250,220)
  { cx: 242, cy: 214, rx: 24, ry: 16 },
];

// 30 flower slots — each positioned INSIDE canopy clouds above
const FLOWER_SLOTS = [
  // Top crown (5)
  { x: 150, y: 78 },
  { x: 136, y: 88 },
  { x: 166, y: 82 },
  { x: 126, y: 92 },
  { x: 174, y: 80 },
  // Upper left (4)
  { x: 70, y: 124 },
  { x: 58, y: 132 },
  { x: 84, y: 118 },
  { x: 62, y: 138 },
  // Upper right (4)
  { x: 230, y: 124 },
  { x: 242, y: 132 },
  { x: 216, y: 118 },
  { x: 238, y: 138 },
  // Middle left (4)
  { x: 82, y: 176 },
  { x: 68, y: 186 },
  { x: 96, y: 168 },
  { x: 60, y: 194 },
  // Middle right (4)
  { x: 218, y: 176 },
  { x: 232, y: 186 },
  { x: 204, y: 168 },
  { x: 240, y: 194 },
  // Center (3)
  { x: 150, y: 138 },
  { x: 140, y: 148 },
  { x: 160, y: 148 },
  // Lower left (3)
  { x: 56, y: 210 },
  { x: 48, y: 220 },
  { x: 70, y: 216 },
  // Lower right (3)
  { x: 244, y: 210 },
  { x: 252, y: 220 },
  { x: 230, y: 216 },
];

export default function SakuraTree({ bloomCount = 0 }) {
  return (
    <svg viewBox="-20 55 340 315" className="w-full max-w-[340px] mx-auto">
      {/* Tree trunk */}
      <path
        d="M145,345 L140,290 Q135,260 130,230 Q140,200 150,180 Q160,200 170,230 Q165,260 160,290 L155,345 Z"
        fill="#8B6914"
        stroke="#6B4E12"
        strokeWidth="1"
      />

      {/* Trunk texture lines */}
      <path d="M148,345 Q146,310 147,250" stroke="#6B4E12" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M152,345 Q154,320 152,260" stroke="#6B4E12" strokeWidth="0.5" fill="none" opacity="0.4" />

      {/* Root base */}
      <ellipse cx="150" cy="348" rx="25" ry="6" fill="#6B4E12" opacity="0.3" />

      {/* Main branches */}
      <path d="M140,230 Q120,200 90,170 Q70,150 60,130" stroke="#8B6914" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M135,260 Q110,240 80,230 Q60,225 50,220" stroke="#8B6914" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M160,230 Q180,200 210,170 Q230,150 240,130" stroke="#8B6914" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M165,260 Q190,240 220,230 Q240,225 250,220" stroke="#8B6914" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M150,200 Q150,160 148,120 Q147,100 150,80" stroke="#8B6914" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Sub-branches (thinner) */}
      <path d="M90,170 Q80,140 75,120" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M80,230 Q65,210 55,195" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M210,170 Q220,140 225,120" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M220,230 Q235,210 245,195" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M148,120 Q130,100 120,85" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M148,120 Q165,95 175,80" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Canopy foliage — soft cloud shapes covering branch tips */}
      {CANOPY_CLOUDS.map((cloud, i) => (
        <ellipse
          key={`c-${i}`}
          cx={cloud.cx}
          cy={cloud.cy}
          rx={cloud.rx}
          ry={cloud.ry}
          fill="#BBF7D0"
          opacity="0.25"
        />
      ))}

      {/* Flowers / buds (on top of canopy) */}
      {FLOWER_SLOTS.map((slot, i) => (
        <FlowerBloom
          key={i}
          x={slot.x}
          y={slot.y}
          bloomed={i < bloomCount}
          index={i}
        />
      ))}

      {/* Ground */}
      <ellipse cx="150" cy="355" rx="120" ry="10" fill="#86EFAC" opacity="0.2" />
    </svg>
  );
}
