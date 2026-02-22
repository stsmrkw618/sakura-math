'use client';

import FlowerBloom from './FlowerBloom';

// 30 flower slot positions on the tree (positioned near branch tips)
const FLOWER_SLOTS = [
  // Top crown (near top branch tip ~y=80)
  { x: 150, y: 76 },
  { x: 135, y: 85 },
  { x: 165, y: 82 },
  { x: 122, y: 88 },
  { x: 175, y: 78 },
  // Upper left branch (tips ~y=120-135)
  { x: 78, y: 118 },
  { x: 62, y: 130 },
  { x: 92, y: 112 },
  { x: 55, y: 138 },
  { x: 85, y: 125 },
  // Upper right branch (tips ~y=120-135)
  { x: 222, y: 118 },
  { x: 238, y: 130 },
  { x: 208, y: 112 },
  { x: 245, y: 138 },
  { x: 215, y: 125 },
  // Middle left (along branch ~y=160-200)
  { x: 95, y: 168 },
  { x: 78, y: 182 },
  { x: 108, y: 158 },
  { x: 58, y: 195 },
  // Middle right (along branch ~y=160-200)
  { x: 205, y: 168 },
  { x: 222, y: 182 },
  { x: 192, y: 158 },
  { x: 242, y: 195 },
  // Center (along main trunk upper ~y=120-140)
  { x: 140, y: 140 },
  { x: 160, y: 140 },
  { x: 150, y: 118 },
  // Lower branches (near tips ~y=210-225)
  { x: 55, y: 215 },
  { x: 245, y: 215 },
  { x: 75, y: 225 },
  { x: 225, y: 225 },
];

export default function SakuraTree({ bloomCount = 0 }) {
  return (
    <svg viewBox="-20 55 340 315" className="w-full max-w-[340px] mx-auto">
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
