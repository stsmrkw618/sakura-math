'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DrillCard from '../../components/DrillCard';
import ProgressBar from '../../components/ProgressBar';
import { loadProgress, saveProgress, updateStreak, addBloom, recordReview } from '../../lib/storage';
import { getAllProblems } from '../../lib/problems';
import { getDueProblems } from '../../lib/spaced-repetition';

export default function DrillPage() {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const [newBlooms, setNewBlooms] = useState(0);
  const [showBloomAnimation, setShowBloomAnimation] = useState(false);
  const [mode, setMode] = useState('normal');

  useEffect(() => {
    // Read mode from URL (static export can't use useSearchParams)
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode') === 'highlevel' ? 'highlevel' : 'normal';
    setMode(m);

    const progress = loadProgress();
    const allProblems = getAllProblems();
    const due = getDueProblems(allProblems, progress.reviews, { mode: m });
    setProblems(due);
    setLoading(false);
  }, []);

  const handleEvaluate = (quality) => {
    const problem = problems[currentIndex];

    // Record result
    setResults((prev) => [...prev, { problem, quality }]);

    // Update progress
    let progress = loadProgress();
    progress = recordReview(progress, problem.id, quality);
    progress = updateStreak(progress);

    // Bloom on correct answer
    if (quality >= 3) {
      progress = addBloom(progress);
      setNewBlooms((prev) => prev + 1);
      setShowBloomAnimation(true);
      setTimeout(() => setShowBloomAnimation(false), 800);
    }

    saveProgress(progress);

    // Move to next question after a delay
    setTimeout(() => {
      if (currentIndex + 1 < problems.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setDone(true);
      }
    }, quality >= 3 ? 1200 : 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sakura-400 text-xl">🌸</div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <main className="pt-6">
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🎉</p>
          <p className="text-xl font-bold text-gray-700 font-kiwi mb-2">
            今日の復習は終わり！
          </p>
          <p className="text-sm text-gray-500">
            また明日、頑張ろうね
          </p>
          <Link href="/">
            <button className="mt-6 px-8 py-3 bg-sakura-400 text-white rounded-2xl font-bold shadow-lg shadow-sakura-200">
              戻る
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (done) {
    const correctCount = results.filter((r) => r.quality >= 3).length;
    const perfectCount = results.filter((r) => r.quality === 5).length;

    // Tag-based summary
    const tagResults = {};
    results.forEach(({ problem, quality }) => {
      problem.tags.forEach((tag) => {
        if (!tagResults[tag]) tagResults[tag] = { correct: 0, total: 0 };
        tagResults[tag].total += 1;
        if (quality >= 3) tagResults[tag].correct += 1;
      });
    });

    return (
      <main className="pt-6 animate-fade-in">
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">
            {correctCount === results.length ? '🌟' : correctCount > 0 ? '🌸' : '💪'}
          </p>
          <h2 className="text-xl font-bold text-gray-700 font-kiwi">
            お疲れさま！
          </h2>
        </div>

        {/* Results summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-sakura-100 shadow-sm mb-4">
          <div className="grid grid-cols-3 text-center divide-x divide-gray-100">
            <div>
              <p className="text-2xl font-bold text-sakura-500 font-kiwi">{results.length}</p>
              <p className="text-xs text-gray-500">問題</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500 font-kiwi">{correctCount}</p>
              <p className="text-xs text-gray-500">正解</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-orange font-kiwi">{newBlooms}</p>
              <p className="text-xs text-gray-500">さくら🌸</p>
            </div>
          </div>
        </div>

        {/* Tag breakdown */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
          <p className="text-sm font-bold text-gray-600 mb-3">分野別成績</p>
          <div className="space-y-2">
            {Object.entries(tagResults).map(([tag, data]) => (
              <div key={tag} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{tag}</span>
                <span className={`text-sm font-bold ${
                  data.correct === data.total ? 'text-emerald-500' :
                  data.correct > 0 ? 'text-yellow-500' : 'text-red-400'
                }`}>
                  {data.correct}/{data.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Individual results */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <p className="text-sm font-bold text-gray-600 mb-3">各問題</p>
          <div className="space-y-2">
            {results.map(({ problem, quality }, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg mt-[-2px]">
                  {quality === 5 ? '🌸' : quality === 3 ? '🤔' : '😢'}
                </span>
                <p className="text-sm text-gray-600 line-clamp-1 flex-1">
                  {problem.question}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Link href="/">
          <button className="w-full py-3.5 bg-gradient-to-r from-sakura-400 to-sakura-500 text-white rounded-2xl font-bold shadow-lg shadow-sakura-200">
            ホームに戻る 🌸
          </button>
        </Link>
      </main>
    );
  }

  const currentProblem = problems[currentIndex];

  return (
    <main className="pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-gray-400 text-sm">
          ← 戻る
        </Link>
        <div className="flex items-center gap-2">
          {mode === 'highlevel' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
              ハイレベル🔥
            </span>
          )}
          <span className="text-sm text-gray-500 font-medium">
            {currentIndex + 1} / {problems.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <ProgressBar current={currentIndex} total={problems.length} />
      </div>

      {/* Question Card */}
      <DrillCard
        key={currentProblem.id}
        problem={currentProblem}
        onEvaluate={handleEvaluate}
      />

      {/* Bloom animation overlay */}
      {showBloomAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="animate-bloom text-6xl">🌸</div>
        </div>
      )}
    </main>
  );
}
