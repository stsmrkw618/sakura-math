'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TagBadge from '../../components/TagBadge';
import { getAllProblems, getCorrectRateColor, getCorrectRateBg } from '../../lib/problems';
import { loadProgress } from '../../lib/storage';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [tagStats, setTagStats] = useState([]);
  const [summary, setSummary] = useState({ total: 0, totalAnswers: 0, overallRate: 0 });
  const [weakPoints, setWeakPoints] = useState([]);

  useEffect(() => {
    const problems = getAllProblems();
    const progress = loadProgress();

    // Collect all history entries per tag
    const tagData = {};
    let totalAnswers = 0;
    let totalCorrect = 0;

    problems.forEach((problem) => {
      const review = progress.reviews[problem.id];
      const history = review?.history || [];

      history.forEach((entry) => {
        totalAnswers++;
        if (entry.correct) totalCorrect++;

        problem.tags.forEach((tag) => {
          if (!tagData[tag]) tagData[tag] = { correct: 0, total: 0 };
          tagData[tag].total++;
          if (entry.correct) tagData[tag].correct++;
        });
      });
    });

    // Build tag stats sorted by rate (weakest first)
    const stats = Object.entries(tagData)
      .map(([tag, data]) => ({
        tag,
        correct: data.correct,
        total: data.total,
        rate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.rate - b.rate);

    setTagStats(stats);
    setSummary({
      total: problems.length,
      totalAnswers,
      overallRate: totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
    });

    // Collect stumbling points for weak tags (rate < 70%)
    const weakTags = new Set(stats.filter((s) => s.rate < 70).map((s) => s.tag));
    const points = problems
      .filter((p) => p.tags.some((t) => weakTags.has(t)) && p.stumblingPoint)
      .map((p) => ({
        id: p.id,
        question: p.question,
        stumblingPoint: p.stumblingPoint,
        tags: p.tags,
        rate: (() => {
          const review = progress.reviews[p.id];
          const h = review?.history || [];
          if (h.length === 0) return null;
          return Math.round((h.filter((e) => e.correct).length / h.length) * 100);
        })(),
      }))
      .sort((a, b) => (a.rate ?? -1) - (b.rate ?? -1));

    setWeakPoints(points);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sakura-400 text-xl">🌸</div>
      </div>
    );
  }

  return (
    <main className="pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <Link href="/" className="text-gray-400 text-sm">
          ← もどる
        </Link>
        <h1 className="text-lg font-bold text-gray-700 font-kiwi">
          📊 にがてチェック
        </h1>
        <div className="w-12" />
      </div>

      {/* Summary Cards */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sakura-100 shadow-sm mb-4">
        <div className="grid grid-cols-3 text-center divide-x divide-gray-100">
          <div>
            <p className="text-2xl font-bold text-sakura-500 font-kiwi">{summary.total}</p>
            <p className="text-xs text-gray-500">とうろく数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600 font-kiwi">{summary.totalAnswers}</p>
            <p className="text-xs text-gray-500">かいとう数</p>
          </div>
          <div>
            <p className={`text-2xl font-bold font-kiwi ${getCorrectRateColor(summary.overallRate)}`}>
              {summary.overallRate}%
            </p>
            <p className="text-xs text-gray-500">せいとう率</p>
          </div>
        </div>
      </div>

      {/* Tag Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sakura-100 shadow-sm mb-4">
        <p className="text-sm font-bold text-gray-600 mb-3">ぶんや別せいとう率</p>
        {tagStats.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            まだデータがありません
          </p>
        ) : (
          <div className="space-y-3">
            {tagStats.map(({ tag, rate, correct, total }) => (
              <div key={tag}>
                <div className="flex items-center justify-between mb-1">
                  <TagBadge tag={tag} />
                  <span className={`text-sm font-bold ${getCorrectRateColor(rate)}`}>
                    {rate}% <span className="text-xs font-normal text-gray-400">({correct}/{total})</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      rate >= 70
                        ? 'bg-emerald-400'
                        : rate >= 40
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    }`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stumbling Points */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sakura-100 shadow-sm mb-6">
        <p className="text-sm font-bold text-gray-600 mb-3">
          つまずきポイント
        </p>
        {weakPoints.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            にがてな分野はまだありません
          </p>
        ) : (
          <div className="space-y-3">
            {weakPoints.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl p-3 border ${
                  p.rate !== null ? getCorrectRateBg(p.rate) : 'bg-gray-50'
                } border-gray-100`}
              >
                <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                  {p.question}
                </p>
                <p className="text-sm text-gray-700">
                  💡 {p.stumblingPoint}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {p.tags.map((t) => (
                    <TagBadge key={t} tag={t} />
                  ))}
                  {p.rate !== null && (
                    <span className={`text-xs font-bold ml-auto ${getCorrectRateColor(p.rate)}`}>
                      {p.rate}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
