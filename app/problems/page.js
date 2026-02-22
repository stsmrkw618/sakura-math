'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TagBadge from '../../components/TagBadge';
import FigureDisplay from '../../components/FigureDisplay';
import { getAllProblems, getAllTags, getCorrectRateColor } from '../../lib/problems';
import { loadProgress } from '../../lib/storage';

export default function ProblemsPage() {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showAnswerId, setShowAnswerId] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setProblems(getAllProblems());
    setTags(getAllTags());
    setProgress(loadProgress());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sakura-400 text-xl">🌸</div>
      </div>
    );
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const filtered = selectedTag
    ? problems.filter((p) => p.tags.includes(selectedTag))
    : problems;

  const isDue = (problemId) => {
    const review = progress?.reviews[problemId];
    if (!review) return true;
    return new Date(review.nextReviewDate) <= now;
  };

  const getReviewHistory = (problemId) => {
    return progress?.reviews[problemId]?.history || [];
  };

  const getProblemRate = (problemId) => {
    const history = getReviewHistory(problemId);
    if (history.length === 0) return null;
    return Math.round((history.filter((h) => h.correct).length / history.length) * 100);
  };

  return (
    <main className="pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <Link href="/" className="text-gray-400 text-sm">
          ← 戻る
        </Link>
        <h1 className="text-lg font-bold text-gray-700 font-kiwi">
          📋 問題一覧
        </h1>
        <div className="w-12" />
      </div>

      {/* Tag Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selectedTag === null
              ? 'bg-sakura-400 text-white border-sakura-400'
              : 'bg-white/70 text-gray-500 border-gray-200'
          }`}
        >
          すべて ({problems.length})
        </button>
        {tags.map((tag) => {
          const count = problems.filter((p) => p.tags.includes(tag.name)).length;
          if (count === 0) return null;
          return (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedTag === tag.name
                  ? 'bg-sakura-400 text-white border-sakura-400'
                  : 'bg-white/70 text-gray-500 border-gray-200'
              }`}
            >
              {tag.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Problem count */}
      <p className="text-xs text-gray-400 mb-3">
        {filtered.length}問 表示中
      </p>

      {/* Problem List */}
      <div className="space-y-3 mb-6">
        {filtered.map((problem) => {
          const due = isDue(problem.id);
          const expanded = expandedId === problem.id;
          const rate = getProblemRate(problem.id);
          const history = getReviewHistory(problem.id);

          return (
            <div
              key={problem.id}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden transition-all ${
                due ? 'border-sakura-300 ring-1 ring-sakura-200' : 'border-sakura-100'
              }`}
            >
              {/* Card Header (tappable) */}
              <button
                onClick={() => {
                  setExpandedId(expanded ? null : problem.id);
                  if (expanded) setShowAnswerId(null);
                }}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-gray-700 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                      {problem.question}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {problem.tags.map((t) => (
                        <TagBadge key={t} tag={t} />
                      ))}
                      {due && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sakura-100 text-sakura-600 border border-sakura-200">
                          復習
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    {rate !== null && (
                      <span className={`text-sm font-bold ${getCorrectRateColor(rate)}`}>
                        {rate}%
                      </span>
                    )}
                    <span className="text-xs text-gray-400 mt-1">
                      {expanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              </button>

              {/* Step 1: Expanded - full question + figure + source */}
              {expanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 animate-fade-in">
                  {/* Source and test rate */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400">{problem.source}</p>
                    <p className="text-xs text-gray-400">
                      テスト正答率: {problem.correctRate}%
                    </p>
                  </div>

                  {/* Figure */}
                  <FigureDisplay figure={problem.figure} />

                  {/* Step 2: Show answer button or answer content */}
                  {showAnswerId !== problem.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAnswerId(problem.id);
                      }}
                      className="w-full py-2.5 bg-white border-2 border-dashed border-sakura-200 rounded-xl text-sakura-500 font-bold text-sm active:scale-[0.98] transition-transform"
                    >
                      解説を見る
                    </button>
                  ) : (
                    <div className="animate-fade-in">
                      {/* Answer */}
                      <div className="bg-emerald-50 rounded-xl p-3 mb-3">
                        <p className="text-xs font-bold text-emerald-700 mb-1">答え</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {problem.answer}
                        </p>
                      </div>

                      {/* Stumbling Point */}
                      {problem.stumblingPoint && (
                        <div className="bg-yellow-50 rounded-xl p-3 mb-3">
                          <p className="text-xs font-bold text-yellow-700 mb-1">
                            つまずきポイント
                          </p>
                          <p className="text-sm text-gray-700">
                            💡 {problem.stumblingPoint}
                          </p>
                        </div>
                      )}

                      {/* Review History */}
                      {history.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-gray-500 mb-2">
                            復習履歴 ({history.length}回)
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {history.map((entry, i) => (
                              <span
                                key={i}
                                className="text-lg"
                                title={new Date(entry.date).toLocaleDateString('ja-JP')}
                              >
                                {entry.quality === 5 ? '🌸' : entry.quality === 3 ? '🤔' : '😢'}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            最後の復習: {new Date(history[history.length - 1].date).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
