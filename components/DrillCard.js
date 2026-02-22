'use client';

import { useState } from 'react';
import TagBadge from './TagBadge';
import FigureDisplay from './FigureDisplay';

export default function DrillCard({ problem, onEvaluate }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  const handleEvaluate = (quality) => {
    setEvaluated(true);
    onEvaluate(quality);
  };

  return (
    <div className="animate-fade-in">
      {/* Tags + correct rate */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {problem.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
        {problem.correctRate && (
          <span className="text-xs text-gray-400 ml-auto">
            正答率 {problem.correctRate}%
          </span>
        )}
      </div>

      {/* Question */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm">
        <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
          {problem.question}
        </p>
        <FigureDisplay figure={problem.figure} />
      </div>

      {/* Answer section */}
      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="w-full mt-4 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-dashed border-sakura-200 rounded-2xl text-sakura-500 font-bold text-base active:scale-[0.98] transition-transform"
        >
          答えを見る 👀
        </button>
      ) : (
        <div className="mt-4 animate-slide-up">
          {/* Answer */}
          <div className="bg-gradient-to-br from-sakura-50 to-white rounded-2xl p-5 border border-sakura-100 shadow-sm">
            <p className="text-sm font-bold text-sakura-500 mb-2">答え</p>
            <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
              {problem.answer}
            </p>
          </div>

          {/* Stumbling point */}
          {problem.stumblingPoint && (
            <div className="mt-3 bg-warm-yellow/10 rounded-xl p-4 border border-warm-yellow/20">
              <p className="text-sm font-bold text-warm-orange mb-1">
                💡 つまずきポイント
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {problem.stumblingPoint}
              </p>
            </div>
          )}

          {/* Self evaluation */}
          {!evaluated && (
            <div className="mt-5">
              <p className="text-center text-sm text-gray-500 mb-3">
                どうだった？
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleEvaluate(1)}
                  className="py-3 px-2 bg-white border-2 border-red-200 rounded-xl text-center active:scale-[0.95] transition-transform hover:bg-red-50"
                >
                  <span className="text-2xl block mb-1">😢</span>
                  <span className="text-xs text-red-500 font-medium block">
                    わからなかった
                  </span>
                </button>
                <button
                  onClick={() => handleEvaluate(3)}
                  className="py-3 px-2 bg-white border-2 border-yellow-200 rounded-xl text-center active:scale-[0.95] transition-transform hover:bg-yellow-50"
                >
                  <span className="text-2xl block mb-1">🤔</span>
                  <span className="text-xs text-yellow-600 font-medium block">
                    あやしい…
                  </span>
                </button>
                <button
                  onClick={() => handleEvaluate(5)}
                  className="py-3 px-2 bg-white border-2 border-sakura-200 rounded-xl text-center active:scale-[0.95] transition-transform hover:bg-pink-50"
                >
                  <span className="text-2xl block mb-1">🌸</span>
                  <span className="text-xs text-sakura-500 font-medium block">
                    できた！
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Source info */}
      <p className="mt-3 text-xs text-gray-400 text-right">
        {problem.source}
      </p>
    </div>
  );
}
