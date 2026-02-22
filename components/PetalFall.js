'use client';

import { useState, useEffect } from 'react';

function Petal({ delay, startX, duration }) {
  return (
    <div
      className="absolute animate-petal-fall pointer-events-none"
      style={{
        left: `${startX}%`,
        top: '-10px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12">
        <ellipse
          cx="6"
          cy="6"
          rx="5"
          ry="3"
          fill="#F9A8D4"
          opacity="0.8"
          transform="rotate(30, 6, 6)"
        />
      </svg>
    </div>
  );
}

export default function PetalFall({ active }) {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    if (!active) {
      setPetals([]);
      return;
    }

    const newPetals = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 2,
      startX: Math.random() * 100,
      duration: 2.5 + Math.random() * 2,
    }));
    setPetals(newPetals);

    const timer = setTimeout(() => setPetals([]), 5000);
    return () => clearTimeout(timer);
  }, [active]);

  if (petals.length === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {petals.map((petal) => (
        <Petal
          key={petal.id}
          delay={petal.delay}
          startX={petal.startX}
          duration={petal.duration}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-fade-in text-center">
          <p className="text-4xl mb-2">🌸</p>
          <p className="text-xl font-bold text-sakura-500 font-kiwi">まんかい！</p>
        </div>
      </div>
    </div>
  );
}
