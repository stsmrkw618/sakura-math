'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TagBadge from '../../components/TagBadge';
import FigureDisplay from '../../components/FigureDisplay';
import { getAllProblems } from '../../lib/problems';
import { loadProgress } from '../../lib/storage';

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all'); // all, wrong, shaky
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const problems = getAllProblems();
    const progress = loadProgress();
    const problemMap = {};
    problems.forEach(p => { problemMap[p.id] = p; });

    // Flatten all history entries with problem info
    const all = [];
    Object.entries(progress.reviews || {}).forEach(([problemId, review]) => {
      const problem = problemMap[problemId];
      if (!problem) return;
      (review.history || []).forEach((entry) => {
        all.push({
          problemId,
          problem,
          date: entry.date,
          quality: entry.quality,
          correct: entry.correct,
        });
      });
    });

    // Sort by date descending (newest first)
    all.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    setEntries(all);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sakura-400 text-xl">🌸</div>
      </div>
    );
  }

  const filtered = filter === 'all'
    ? entries
    : filter === 'wrong'
      ? entries.filter(e => e.quality === 1)
      : entries.filter(e => e.quality === 3);

  // Group by date
  const grouped = {};
  filtered.forEach(entry => {
    const dateKey = entry.date ? entry.date.slice(0, 10) : 'unknown';
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(entry);
  });

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  const qualityIcon = (q) => q === 5 ? '🌸' : q === 3 ? '🤔' : '😢';
  const qualityLabel = (q) => q === 5 ? 'できた' : q === 3 ? 'あやしい' : 'わからなかった';
  const qualityColor = (q) => q === 5 ? 'text-emerald-500' : q === 3 ? 'text-yellow-600' : 'text-red-500';
  const qualityBg = (q) => q === 5 ? 'border-emerald-100' : q === 3 ? 'border-yellow-200 bg-yellow-50/30' : 'border-red-200 bg-red-50/30';

  return (
    <main className="pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <Link href="/" className="text-gray-400 text-base">
          ← 戻る
        </Link>
        <h1 className="text-lg font-bold text-gray-700 font-kiwi">
          📖 履歴
        </h1>
        <div className="w-12" />
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'すべて', count: entries.length },
          { key: 'wrong', label: '😢 わからなかった', count: entries.filter(e => e.quality === 1).length },
          { key: 'shaky', label: '🤔 あやしい', count: entries.filter(e => e.quality === 3).length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f.key
                ? 'bg-sakura-400 text-white border-sakura-400'
                : 'bg-white/70 text-gray-500 border-gray-200'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-3">
        {filtered.length}件
      </p>

      {/* Grouped by date */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base text-gray-400">まだ履歴がありません</p>
        </div>
      ) : (
        <div className="space-y-5 mb-6">
          {Object.entries(grouped).map(([dateKey, dayEntries]) => (
            <div key={dateKey}>
              {/* Date header */}
              <p className="text-sm font-bold text-gray-500 mb-2 sticky top-0 bg-gradient-to-r from-pink-50/90 to-blue-50/90 backdrop-blur-sm py-1 px-1 -mx-1 rounded">
                {formatDate(dateKey)}
                <span className="text-gray-400 font-normal ml-2">({dayEntries.length}件)</span>
              </p>

              <div className="space-y-2">
                {dayEntries.map((entry, i) => {
                  const isExpanded = expandedId === `${entry.problemId}-${entry.date}-${i}`;
                  const entryKey = `${entry.problemId}-${entry.date}-${i}`;

                  return (
                    <div
                      key={entryKey}
                      className={`bg-white/80 backdrop-blur-sm rounded-xl p-3.5 border shadow-sm cursor-pointer active:scale-[0.99] transition-all ${qualityBg(entry.quality)}`}
                      onClick={() => setExpandedId(isExpanded ? null : entryKey)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{qualityIcon(entry.quality)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${qualityColor(entry.quality)}`}>
                            {qualityLabel(entry.quality)}
                          </p>
                          <p className={`text-base text-gray-700 mt-1 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {entry.problem.question}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {entry.problem.tags.map(t => (
                              <TagBadge key={t} tag={t} />
                            ))}
                            <span className="text-sm text-gray-400 ml-auto">
                              {entry.problem.source}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded: show answer + stumbling point */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
                          <FigureDisplay figure={entry.problem.figure} />

                          <div className="bg-emerald-50 rounded-xl p-3 mb-2">
                            <p className="text-sm font-bold text-emerald-700 mb-1">答え</p>
                            <p className="text-base text-gray-700 whitespace-pre-line">
                              {entry.problem.answer}
                            </p>
                          </div>

                          {entry.problem.stumblingPoint && (
                            <div className="bg-yellow-50 rounded-xl p-3">
                              <p className="text-sm font-bold text-yellow-700 mb-1">
                                つまずきポイント
                              </p>
                              <p className="text-base text-gray-700">
                                💡 {entry.problem.stumblingPoint}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
