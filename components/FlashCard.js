'use client';

import { useState } from 'react';
import { getCategoryInfo, getCategoryColor } from '../lib/flashcards';

export default function FlashCard({ card, boxLevel, onCorrect, onIncorrect }) {
  const [flipped, setFlipped] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  const category = getCategoryInfo(card.category);
  const catColor = getCategoryColor(card.category);

  const handleFlip = () => {
    if (!evaluated) {
      setFlipped(!flipped);
    }
  };

  const handleCorrect = () => {
    setEvaluated(true);
    onCorrect();
  };

  const handleIncorrect = () => {
    setEvaluated(true);
    onIncorrect();
  };

  const boxLabel = boxLevel === 0 ? 'NEW' : `Box ${boxLevel}`;
  const boxColor = boxLevel === 0
    ? 'bg-gray-100 text-gray-500'
    : boxLevel <= 2
      ? 'bg-orange-100 text-orange-600'
      : boxLevel <= 4
        ? 'bg-blue-100 text-blue-600'
        : 'bg-emerald-100 text-emerald-600';

  return (
    <div className="w-full">
      {/* Category badge + Box level */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${catColor.bg} ${catColor.text} ${catColor.border} border`}>
          {category.emoji} {category.name}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${boxColor}`}>
          {boxLabel}
        </span>
      </div>

      {/* Flip card */}
      <div className="flip-card w-full" style={{ minHeight: '220px' }}>
        <div
          className={`flip-card-inner w-full h-full cursor-pointer ${flipped ? 'flipped' : ''}`}
          onClick={handleFlip}
          style={{ minHeight: '220px' }}
        >
          {/* Front */}
          <div className="flip-card-front absolute inset-0 w-full">
            <div className="w-full h-full bg-white rounded-2xl border-2 border-purple-100 shadow-lg p-6 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-gray-700 font-kiwi text-center leading-relaxed whitespace-pre-line">
                {card.front}
              </p>
              <p className="text-xs text-gray-400 mt-6">タップでめくる 👆</p>
            </div>
          </div>

          {/* Back */}
          <div className="flip-card-back absolute inset-0 w-full">
            <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-lg p-6 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-purple-700 font-kiwi text-center leading-relaxed whitespace-pre-line">
                {card.back}
              </p>
              {card.hint && (
                <div className="mt-4 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl w-full">
                  <p className="text-xs text-yellow-700 text-center">
                    💡 {card.hint}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation buttons (show only when flipped and not yet evaluated) */}
      {flipped && !evaluated && (
        <div className="mt-4 grid grid-cols-2 gap-3 animate-fade-in">
          <button
            onClick={handleIncorrect}
            className="py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm active:scale-[0.97] transition-transform border border-gray-200"
          >
            もういちど 🔄
          </button>
          <button
            onClick={handleCorrect}
            className="py-3.5 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 active:scale-[0.97] transition-transform"
          >
            覚えてた！ 🌸
          </button>
        </div>
      )}
    </div>
  );
}
