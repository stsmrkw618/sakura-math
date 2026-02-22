'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SakuraTree from '../components/SakuraTree';
import PetalFall from '../components/PetalFall';
import { loadProgress, saveProgress } from '../lib/storage';
import { getAllProblems } from '../lib/problems';
import { getDueProblems, calculateNextReview } from '../lib/spaced-repetition';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [dueCount, setDueCount] = useState(0);
  const [dueCountHL, setDueCountHL] = useState(0);
  const [showFullBloom, setShowFullBloom] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [exportData, setExportData] = useState('');
  const [adminTab, setAdminTab] = useState('import');

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);

    const problems = getAllProblems();
    const due = getDueProblems(problems, p.reviews, { mode: 'normal' });
    setDueCount(due.length);
    const dueHL = getDueProblems(problems, p.reviews, { mode: 'highlevel' });
    setDueCountHL(dueHL.length);

    // Check admin mode from URL
    const params = new URLSearchParams(window.location.search);
    setIsAdmin(params.get('admin') === '1');

    setLoading(false);
  }, []);

  // Admin: Import review results
  const handleImport = () => {
    try {
      const data = JSON.parse(importJson);
      const currentProgress = loadProgress();

      Object.entries(data).forEach(([problemId, result]) => {
        const current = currentProgress.reviews[problemId] || {
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          history: [],
        };

        const updated = calculateNextReview(current, result.quality);
        const date = result.date || new Date().toISOString();

        currentProgress.reviews[problemId] = {
          ...updated,
          lastReviewDate: date,
          history: [
            ...(current.history || []),
            { date, quality: result.quality, correct: result.quality >= 3 },
          ],
        };

        // Add bloom on correct answer
        if (result.quality >= 3) {
          currentProgress.sakura.totalBlooms += 1;
          currentProgress.sakura.currentTreeBlooms += 1;
          if (currentProgress.sakura.currentTreeBlooms >= currentProgress.sakura.fullBloomThreshold) {
            currentProgress.sakura.currentTreeBlooms = 0;
            currentProgress.sakura.fullBloomCount += 1;
          }
        }
      });

      saveProgress(currentProgress);
      setProgress(currentProgress);
      setImportStatus({ type: 'success', message: `${Object.keys(data).length}件インポートしました` });
      setImportJson('');

      // Refresh due counts
      const problems = getAllProblems();
      setDueCount(getDueProblems(problems, currentProgress.reviews, { mode: 'normal' }).length);
      setDueCountHL(getDueProblems(problems, currentProgress.reviews, { mode: 'highlevel' }).length);
    } catch (e) {
      setImportStatus({ type: 'error', message: `エラー: ${e.message}` });
    }
  };

  // Admin: Export progress data
  const handleExport = () => {
    const data = loadProgress();
    setExportData(JSON.stringify(data, null, 2));
  };

  // Admin: Reset all progress
  const handleReset = () => {
    if (!window.confirm('すべての進捗データをリセットしますか？\nこの操作は取り消せません。')) return;
    const defaultProgress = {
      reviews: {},
      sakura: { totalBlooms: 0, currentTreeBlooms: 0, fullBloomCount: 0, fullBloomThreshold: 30 },
      streak: { currentStreak: 0, lastActiveDate: null, longestStreak: 0 },
    };
    saveProgress(defaultProgress);
    setProgress(defaultProgress);
    const allProblems = getAllProblems();
    setDueCount(getDueProblems(allProblems, {}, { mode: 'normal' }).length);
    setDueCountHL(getDueProblems(allProblems, {}, { mode: 'highlevel' }).length);
    setImportStatus({ type: 'success', message: 'リセットしました' });
  };

  // Admin: Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      setImportStatus({ type: 'success', message: 'コピーしました' });
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = exportData;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setImportStatus({ type: 'success', message: 'コピーしました' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sakura-400 text-xl font-maru">🌸</div>
      </div>
    );
  }

  const { sakura, streak } = progress;
  const threshold = sakura.fullBloomThreshold;
  const remaining = threshold - sakura.currentTreeBlooms;
  const treeGeneration = sakura.fullBloomCount + 1;

  return (
    <main className="pt-6">
      <PetalFall active={showFullBloom} />

      {/* Header */}
      <div className="text-center mb-4 relative">
        <h1 className="text-2xl font-bold text-sakura-500 font-kiwi">
          SAKURA Math
        </h1>
        <p className="text-sm text-gray-500 mt-1">さくら算数ドリル</p>
        {sakura.fullBloomCount > 0 && (
          <p className="text-xs text-sakura-300 mt-0.5">
            {treeGeneration}本目のさくら
          </p>
        )}
        {/* Admin button */}
        {isAdmin && (
          <button
            onClick={() => { setShowAdminModal(true); setImportStatus(null); }}
            className="absolute top-0 right-0 text-xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            ⚙️
          </button>
        )}
      </div>

      {/* Sakura Tree */}
      <div className="relative">
        <SakuraTree bloomCount={sakura.currentTreeBlooms} />
      </div>

      {/* Stats Cards */}
      <div className="mt-4 space-y-3">
        {/* Today's review count */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-sakura-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-700 font-kiwi">
                今日の復習: <span className="text-sakura-500">{dueCount + dueCountHL}</span>問
              </p>
              {streak.currentStreak > 0 && (
                <p className="text-sm text-warm-orange mt-1">
                  連続{streak.currentStreak}日がんばってるよ！🔥
                </p>
              )}
            </div>
            <div className="text-3xl">📚</div>
          </div>
        </div>

        {/* Bloom count */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-sakura-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">さくらの花</p>
              <p className="text-lg font-bold text-sakura-500 font-kiwi">
                {sakura.currentTreeBlooms}個 / {threshold}個
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                満開まであと{remaining}個！
              </p>
            </div>
            <div className="text-3xl">🌸</div>
          </div>
          {/* Mini progress bar */}
          <div className="mt-2 w-full h-2 bg-pink-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sakura-300 to-sakura-400 rounded-full transition-all duration-500"
              style={{ width: `${(sakura.currentTreeBlooms / threshold) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 space-y-3">
        <Link href="/drill" className="block">
          <button
            className="w-full py-4 bg-gradient-to-r from-sakura-400 to-sakura-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-sakura-200 active:scale-[0.98] transition-transform font-kiwi"
            disabled={dueCount === 0}
          >
            {dueCount > 0 ? (
              <>ドリルを始める ({dueCount}問) 🌸</>
            ) : (
              <>今日の復習は終わり！🎉</>
            )}
          </button>
        </Link>

        <Link href="/drill?mode=highlevel" className="block">
          <button
            className="w-full py-3 bg-gradient-to-r from-warm-orange to-amber-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-100 active:scale-[0.98] transition-transform font-kiwi disabled:opacity-40"
            disabled={dueCountHL === 0}
          >
            {dueCountHL > 0 ? (
              <>ハイレベル ({dueCountHL}問) 🔥</>
            ) : (
              <>ハイレベル問題なし</>
            )}
          </button>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard" className="block">
            <button className="w-full py-3 bg-white/80 backdrop-blur-sm border border-sakura-100 rounded-xl text-gray-600 font-medium text-sm active:scale-[0.98] transition-transform">
              📊 苦手チェック
            </button>
          </Link>
          <Link href="/problems" className="block">
            <button className="w-full py-3 bg-white/80 backdrop-blur-sm border border-sakura-100 rounded-xl text-gray-600 font-medium text-sm active:scale-[0.98] transition-transform">
              📋 問題一覧
            </button>
          </Link>
        </div>
      </div>

      {/* Total stats footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        <p>
          総さくら数: {sakura.totalBlooms}個
          {sakura.fullBloomCount > 0 && ` ・ 満開${sakura.fullBloomCount}回`}
        </p>
        {streak.longestStreak > 0 && (
          <p className="mt-0.5">最高記録: {streak.longestStreak}日連続</p>
        )}
      </div>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowAdminModal(false)}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-700">管理者メニュー</h2>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-gray-400 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { key: 'import', label: 'インポート' },
                { key: 'export', label: 'エクスポート' },
                { key: 'reset', label: 'リセット' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setAdminTab(tab.key); setImportStatus(null); }}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    adminTab === tab.key
                      ? 'text-sakura-500 border-b-2 border-sakura-400'
                      : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {/* Status message */}
              {importStatus && (
                <div className={`mb-3 p-2.5 rounded-xl text-sm ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {importStatus.message}
                </div>
              )}

              {adminTab === 'import' && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    解き直し判定のJSONを貼り付けてインポートします
                  </p>
                  <textarea
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder={'{\n  "2025-04-001": { "quality": 5, "date": "..." },\n  "2025-04-002": { "quality": 3, "date": "..." }\n}'}
                    className="w-full h-40 p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-sakura-300"
                  />
                  <button
                    onClick={handleImport}
                    disabled={!importJson.trim()}
                    className="w-full mt-3 py-2.5 bg-sakura-400 text-white rounded-xl font-medium text-sm disabled:opacity-40"
                  >
                    インポート実行
                  </button>
                </div>
              )}

              {adminTab === 'export' && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    現在の進捗データをJSON形式で表示します
                  </p>
                  {!exportData ? (
                    <button
                      onClick={handleExport}
                      className="w-full py-2.5 bg-sakura-400 text-white rounded-xl font-medium text-sm"
                    >
                      データを表示
                    </button>
                  ) : (
                    <>
                      <textarea
                        value={exportData}
                        readOnly
                        className="w-full h-48 p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl resize-none"
                      />
                      <button
                        onClick={handleCopy}
                        className="w-full mt-3 py-2.5 bg-gray-600 text-white rounded-xl font-medium text-sm"
                      >
                        クリップボードにコピー
                      </button>
                    </>
                  )}
                </div>
              )}

              {adminTab === 'reset' && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    すべての進捗データ（復習履歴・さくらの花・連続記録）をリセットします。この操作は取り消せません。
                  </p>
                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 bg-red-500 text-white rounded-xl font-medium text-sm"
                  >
                    すべてリセット
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
