'use client';

import { useState, useEffect } from 'react';

const COLORS = ['#F472B6', '#FB923C', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F9A8D4'];

function ConfettiPiece({ delay, startX, duration, color, rotation, size }) {
  const shapeStyle = {
    width: `${size}px`,
    height: `${size * 0.6}px`,
    backgroundColor: color,
    borderRadius: '2px',
    transform: `rotate(${rotation}deg)`,
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${startX}%`,
        top: '-20px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        animationName: 'confettiFall',
        animationTimingFunction: 'ease-in',
        animationFillMode: 'forwards',
      }}
    >
      <div style={shapeStyle} />
    </div>
  );
}

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 1.5,
      startX: Math.random() * 100,
      duration: 2 + Math.random() * 2.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 8,
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(timer);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) translateX(15px) rotate(180deg);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) translateX(-10px) rotate(360deg);
            opacity: 0.9;
          }
          75% {
            transform: translateY(75vh) translateX(20px) rotate(540deg);
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) translateX(-5px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
        {pieces.map((piece) => (
          <ConfettiPiece
            key={piece.id}
            delay={piece.delay}
            startX={piece.startX}
            duration={piece.duration}
            color={piece.color}
            rotation={piece.rotation}
            size={piece.size}
          />
        ))}
      </div>
    </>
  );
}
