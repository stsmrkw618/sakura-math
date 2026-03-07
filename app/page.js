'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SakuraTree from '../components/SakuraTree';
import PetalFall from '../components/PetalFall';
import { loadProgress, saveProgress, syncFromSupabase } from '../lib/storage';
import { getAllProblems } from '../lib/problems';
import { getDueProblems, calculateNextReview } from '../lib/spaced-repetition';
import { getAllFlashcards, getHiddenFlashcards, getFlashcardCategories, addFlashcard, hideFlashcard, unhideFlashcard, isCustomCard, getNextCustomId } from '../lib/flashcards';
import { getMasteredCount, getLearnedCount } from '../lib/leitner';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [dueCount, setDueCount] = useState(0);
  const [dueIsDue, setDueIsDue] = useState(true);
  const [dueCountHL, setDueCountHL] = useState(0);
  const [dueHLIsDue, setDueHLIsDue] = useState(true);
  const [flashcardMastered, setFlashcardMastered] = useState(0);
  const [flashcardLearned, setFlashcardLearned] = useState(0);
  const [flashcardTotal, setFlashcardTotal] = useState(0);
  const [todayDrillCount, setTodayDrillCount] = useState(0);
  const [showFullBloom, setShowFullBloom] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [exportData, setExportData] = useState('');
  const [adminTab, setAdminTab] = useState('flashcards');
  const [fcList, setFcList] = useState([]);
  const [fcNewFront, setFcNewFront] = useState('');
  const [fcNewBack, setFcNewBack] = useState('');
  const [fcNewCategory, setFcNewCategory] = useState('unit');
  const [fcNewHint, setFcNewHint] = useState('');
  const [fcShowAdd, setFcShowAdd] = useState(false);
  const [fcHiddenList, setFcHiddenList] = useState([]);
  const [fcShowHidden, setFcShowHidden] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);

    const problems = getAllProblems();
    const due = getDueProblems(problems, p.reviews, { mode: 'normal' });
    setDueCount(due.problems.length);
    setDueIsDue(due.isDue);
    const dueHL = getDueProblems(problems, p.reviews, { mode: 'highlevel' });
    setDueCountHL(dueHL.problems.length);
    setDueHLIsDue(dueHL.isDue);

    // Today's drill count
    const today = new Date().toISOString().slice(0, 10);
    const drillToday = Object.values(p.reviews || {}).reduce((count, review) => {
      const todayEntries = (review.history || []).filter(h => h.date && h.date.startsWith(today));
      return count + todayEntries.length;
    }, 0);
    setTodayDrillCount(drillToday);

    // Flashcard stats
    const allFlashcards = getAllFlashcards();
    const boxes = p.flashcards?.boxes || {};
    setFlashcardTotal(allFlashcards.length);
    setFlashcardMastered(getMasteredCount(boxes));
    setFlashcardLearned(getLearnedCount(boxes));

    setLoading(false);

    // バックグラウンドでSupabaseと同期
    syncFromSupabase().then((merged) => {
      if (!merged) return;
      setProgress(merged);
      const allProblems = getAllProblems();
      const r1 = getDueProblems(allProblems, merged.reviews, { mode: 'normal' });
      setDueCount(r1.problems.length);
      setDueIsDue(r1.isDue);
      const r2 = getDueProblems(allProblems, merged.reviews, { mode: 'highlevel' });
      setDueCountHL(r2.problems.length);
      setDueHLIsDue(r2.isDue);
      const mergedBoxes = merged.flashcards?.boxes || {};
      setFlashcardMastered(getMasteredCount(mergedBoxes));
      setFlashcardLearned(getLearnedCount(mergedBoxes));
      const td = new Date().toISOString().slice(0, 10);
      const dtc = Object.values(merged.reviews || {}).reduce((c, r) => {
        return c + (r.history || []).filter(h => h.date && h.date.startsWith(td)).length;
      }, 0);
      setTodayDrillCount(dtc);
    });
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
      const r1 = getDueProblems(problems, currentProgress.reviews, { mode: 'normal' });
      setDueCount(r1.problems.length);
      setDueIsDue(r1.isDue);
      const r2 = getDueProblems(problems, currentProgress.reviews, { mode: 'highlevel' });
      setDueCountHL(r2.problems.length);
      setDueHLIsDue(r2.isDue);
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
      sakura: { totalBlooms: 0, currentTreeBlooms: 0, fullBloomCount: 0, fullBloomThreshold: 11 },
      streak: { currentStreak: 0, lastActiveDate: null, longestStreak: 0 },
    };
    saveProgress(defaultProgress);
    setProgress(defaultProgress);
    const allProblems = getAllProblems();
    const r1 = getDueProblems(allProblems, {}, { mode: 'normal' });
    setDueCount(r1.problems.length);
    setDueIsDue(r1.isDue);
    const r2 = getDueProblems(allProblems, {}, { mode: 'highlevel' });
    setDueCountHL(r2.problems.length);
    setDueHLIsDue(r2.isDue);
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
      </div>

      {/* Sakura Tree */}
      <div className="relative">
        <SakuraTree bloomCount={sakura.currentTreeBlooms} />
      </div>

      {/* Stats Cards */}
      <div className="mt-4 space-y-3">
        {/* Today's activity */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-sakura-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-gray-700 font-kiwi">
                今日: ドリル <span className="text-sakura-500">{todayDrillCount}</span>問
              </p>
              <p className="text-base font-bold text-gray-700 font-kiwi mt-0.5">
                暗記カード（覚えた）: <span className="text-purple-500">{flashcardLearned}</span>枚
              </p>
              {streak.currentStreak > 0 && (
                <p className="text-sm text-warm-orange mt-1">
                  連続{streak.currentStreak}日がんばってるよ！🔥
                </p>
              )}
            </div>
            <div className="text-3xl">{todayDrillCount > 0 ? '✨' : '📚'}</div>
          </div>
        </div>

        {/* Bloom count */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-sakura-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {treeGeneration}本目のさくら
              </p>
              <p className="text-lg font-bold text-sakura-500 font-kiwi">
                {sakura.currentTreeBlooms}個 / {threshold}個
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
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
          {/* Past full bloom trees */}
          {sakura.fullBloomCount > 0 && (
            <div className="mt-3 pt-3 border-t border-pink-100">
              <p className="text-sm text-gray-400 mb-1.5">満開にしたさくら</p>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: sakura.fullBloomCount }).map((_, i) => (
                  <span key={i} className="text-lg" title={`${i + 1}本目`}>🌸</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 space-y-3">
        <Link href="/drill" className="block">
          <button
            className="w-full py-4 bg-gradient-to-r from-sakura-400 to-sakura-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-sakura-200 active:scale-[0.98] transition-transform font-kiwi"
          >
            {dueIsDue ? (
              <>ドリルを始める 🌸</>
            ) : (
              <>もう一度チャレンジ 💪</>
            )}
          </button>
        </Link>

        <Link href="/flashcards" className="block">
          <button
            className="w-full py-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-purple-100 active:scale-[0.98] transition-transform font-kiwi"
          >
            暗記カード 🃏
            <span className="ml-2 text-xs font-normal opacity-80">
              {flashcardMastered > 0
                ? `${flashcardMastered}/${flashcardTotal}枚マスター`
                : `${flashcardLearned}/${flashcardTotal}枚おぼえた`}
            </span>
          </button>
        </Link>

        {dueCountHL > 0 && (
          <Link href="/drill?mode=highlevel" className="block">
            <button
              className="w-full py-3 bg-gradient-to-r from-warm-orange to-amber-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-100 active:scale-[0.98] transition-transform font-kiwi"
            >
              {dueHLIsDue ? (
                <>ハイレベル 🔥</>
              ) : (
                <>ハイレベル もう一度 🔥</>
              )}
            </button>
          </Link>
        )}

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
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>
          総さくら数: {sakura.totalBlooms}個
          {sakura.fullBloomCount > 0 && ` ・ 満開${sakura.fullBloomCount}回`}
        </p>
        {streak.longestStreak > 0 && (
          <p className="mt-0.5">最高記録: {streak.longestStreak}日連続</p>
        )}
        <button
          onClick={() => {
            const pw = window.prompt('パスワードを入力');
            if (pw === '0618') {
              setShowAdminModal(true);
              setImportStatus(null);
              setFcList(getAllFlashcards());
              setFcHiddenList(getHiddenFlashcards());
            }
          }}
          className="mt-3 text-gray-300 text-[10px]"
        >
          管理
        </button>
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
                { key: 'flashcards', label: '暗記カード' },
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

              {adminTab === 'flashcards' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500">{fcList.length}枚</p>
                    <button
                      onClick={() => setFcShowAdd(!fcShowAdd)}
                      className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium"
                    >
                      {fcShowAdd ? '閉じる' : '+ 追加'}
                    </button>
                  </div>

                  {fcShowAdd && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
                      <input
                        value={fcNewFront}
                        onChange={e => setFcNewFront(e.target.value)}
                        placeholder="おもて面（問題）"
                        className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-300"
                      />
                      <input
                        value={fcNewBack}
                        onChange={e => setFcNewBack(e.target.value)}
                        placeholder="うら面（答え）"
                        className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-300"
                      />
                      <select
                        value={fcNewCategory}
                        onChange={e => setFcNewCategory(e.target.value)}
                        className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-300"
                      >
                        {getFlashcardCategories().map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                        ))}
                      </select>
                      <input
                        value={fcNewHint}
                        onChange={e => setFcNewHint(e.target.value)}
                        placeholder="ヒント（任意）"
                        className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-300"
                      />
                      <button
                        onClick={() => {
                          if (!fcNewFront.trim() || !fcNewBack.trim()) return;
                          const newCard = {
                            id: getNextCustomId(),
                            front: fcNewFront.trim(),
                            back: fcNewBack.trim(),
                            category: fcNewCategory,
                            hint: fcNewHint.trim() || undefined,
                          };
                          addFlashcard(newCard);
                          setFcList(getAllFlashcards());
                          setFlashcardTotal(getAllFlashcards().length);
                          setFcNewFront('');
                          setFcNewBack('');
                          setFcNewHint('');
                          setFcShowAdd(false);
                          setImportStatus({ type: 'success', message: `「${newCard.front}」を追加しました` });
                        }}
                        disabled={!fcNewFront.trim() || !fcNewBack.trim()}
                        className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm font-medium disabled:opacity-40"
                      >
                        追加
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[35vh] overflow-y-auto">
                    {fcList.map(card => (
                      <div key={card.id} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">{card.id}{isCustomCard(card.id) ? ' (追加)' : ''}</p>
                          <p className="text-sm font-medium text-gray-700 truncate">{card.front}</p>
                          <p className="text-xs text-gray-500 truncate">{card.back}</p>
                        </div>
                        <button
                          onClick={() => {
                            hideFlashcard(card.id);
                            const updated = getAllFlashcards();
                            setFcList(updated);
                            setFcHiddenList(getHiddenFlashcards());
                            setFlashcardTotal(updated.length);
                            setImportStatus({ type: 'success', message: `「${card.front}」を非表示にしました` });
                          }}
                          className="shrink-0 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-lg border border-gray-200"
                        >
                          非表示
                        </button>
                      </div>
                    ))}
                  </div>

                  {fcHiddenList.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setFcShowHidden(!fcShowHidden)}
                        className="text-xs text-gray-400 underline"
                      >
                        非表示のカード ({fcHiddenList.length}枚) {fcShowHidden ? '▲' : '▼'}
                      </button>
                      {fcShowHidden && (
                        <div className="mt-2 space-y-2">
                          {fcHiddenList.map(card => (
                            <div key={card.id} className="flex items-start gap-2 p-2.5 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 opacity-70">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 mb-0.5">{card.id}</p>
                                <p className="text-sm text-gray-500 truncate">{card.front}</p>
                                <p className="text-xs text-gray-400 truncate">{card.back}</p>
                              </div>
                              <button
                                onClick={() => {
                                  unhideFlashcard(card.id);
                                  const updated = getAllFlashcards();
                                  setFcList(updated);
                                  setFcHiddenList(getHiddenFlashcards());
                                  setFlashcardTotal(updated.length);
                                  setImportStatus({ type: 'success', message: `「${card.front}」を復活させました` });
                                }}
                                className="shrink-0 px-2 py-1 text-xs text-purple-500 bg-purple-50 rounded-lg border border-purple-100"
                              >
                                復活
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
