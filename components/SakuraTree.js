'use client';

import FlowerBloom from './FlowerBloom';

// 30 flower slot positions on the tree
const FLOWER_SLOTS = [
  // Top crown
  { x: 150, y: 45 },
  { x: 130, y: 55 },
  { x: 170, y: 55 },
  { x: 140, y: 35 },
  { x: 160, y: 38 },
  // Upper left branch
  { x: 85, y: 75 },
  { x: 70, y: 85 },
  { x: 95, y: 65 },
  { x: 60, y: 95 },
  { x: 78, y: 60 },
  // Upper right branch
  { x: 215, y: 75 },
  { x: 230, y: 85 },
  { x: 205, y: 65 },
  { x: 240, y: 95 },
  { x: 222, y: 60 },
  // Middle left
  { x: 100, y: 105 },
  { x: 80, y: 115 },
  { x: 110, y: 95 },
  { x: 65, y: 125 },
  // Middle right
  { x: 200, y: 105 },
  { x: 220, y: 115 },
  { x: 190, y: 95 },
  { x: 235, y: 125 },
  // Middle center
  { x: 135, y: 90 },
  { x: 165, y: 90 },
  { x: 150, y: 75 },
  // Lower branches
  { x: 90, y: 140 },
  { x: 210, y: 140 },
  { x: 120, y: 130 },
  { x: 180, y: 130 },
];

export default function SakuraTree({ bloomCount = 0 }) {
  return (
    <svg viewBox="-20 10 340 350" className="w-full max-w-[340px] mx-auto">
      {/* Sky / background area */}

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
      {/* Left upper branch */}
      <path
        d="M140,230 Q120,200 90,170 Q70,150 60,130"
        stroke="#8B6914"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Left lower branch */}
      <path
        d="M135,260 Q110,240 80,230 Q60,225 50,220"
        stroke="#8B6914"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right upper branch */}
      <path
        d="M160,230 Q180,200 210,170 Q230,150 240,130"
        stroke="#8B6914"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right lower branch */}
      <path
        d="M165,260 Q190,240 220,230 Q240,225 250,220"
        stroke="#8B6914"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Top branch */}
      <path
        d="M150,200 Q150,160 148,120 Q147,100 150,80"
        stroke="#8B6914"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Sub-branches (thinner) */}
      <path d="M90,170 Q80,140 75,120" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M80,230 Q65,210 55,195" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M210,170 Q220,140 225,120" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M220,230 Q235,210 245,195" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M148,120 Q130,100 120,85" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M148,120 Q165,95 175,80" stroke="#A0781E" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Flowers / buds */}
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
