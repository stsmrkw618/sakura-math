'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FlashCard from '../../components/FlashCard';
import ProgressBar from '../../components/ProgressBar';
import { getAllFlashcards, getCategoryInfo } from '../../lib/flashcards';
import { getFlashcardsWeighted, getBoxForCard, getMasteredCount } from '../../lib/leitner';
import {
  loadProgress,
  saveProgress,
  updateStreak,
  addBloom,
  incrementFlashcardSession,
  advanceFlashcard,
  demoteFlashcard,
  updateFlashcardStats,
} from '../../lib/storage';

const COMBO_MILESTONES = {
  3: 'いいね！',
  5: 'すごい！',
  8: '天才！',
  10: '神！✨',
};

const CHARACTERS = [
  { id: 'frieren', file: 'frieren.jpg', name: 'フリーレン' },
  { id: 'fern', file: 'fern.png', name: 'フェルン' },
  { id: 'stark', file: 'stark.png', name: 'シュタルク' },
];

const CHARACTER_LINES = {
  frieren: {
    3: '…なかなかやりますね',
    5: '…すごいです。少し見直しました',
    8: '…天才かもしれません',
    10: '…私の弟子にしてあげてもいいですよ',
  },
  fern: {
    3: 'いい調子ですよ！',
    5: 'すごいです！この調子です！',
    8: '天才ですね！フリーレン様も驚きます！',
    10: '完璧です！尊敬します！',
  },
  stark: {
    3: 'やるじゃん！',
    5: 'すげぇ！お、おれも負けてられない…！',
    8: 'まじか…天才かよ！',
    10: 'お、おれより強いんじゃ…！？',
  },
};

function getCharacterLine(characterId, combo) {
  const lines = CHARACTER_LINES[characterId];
  let line = null;
  for (const [threshold, text] of Object.entries(lines)) {
    if (combo >= Number(threshold)) line = text;
  }
  return line;
}

function getComboText(combo) {
  // Find highest milestone <= combo
  let text = null;
  for (const [threshold, label] of Object.entries(COMBO_MILESTONES)) {
    if (combo >= Number(threshold)) text = label;
  }
  return text;
}

export default function FlashcardsPage() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]); // { cardId, correct }
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [done, setDone] = useState(false);
  const [showComboAnim, setShowComboAnim] = useState(false);
  const [comboText, setComboText] = useState(null);
  const [showBloomAnimation, setShowBloomAnimation] = useState(false);
  const [characterPopup, setCharacterPopup] = useState(null); // { character, line, combo, fadingOut }
  const [progressRef, setProgressRef] = useState(null);

  useEffect(() => {
    let progress = loadProgress();
    // Increment session count
    progress = incrementFlashcardSession(progress);
    saveProgress(progress);
    setProgressRef(progress);

    const allCards = getAllFlashcards();
    const selected = getFlashcardsWeighted(allCards, progress.flashcards.boxes);
    setCards(selected);
    setLoading(false);
  }, []);

  const handleCorrect = () => {
    const card = cards[currentIndex];
    const newCombo = combo + 1;
    setCombo(newCombo);
    const newBest = Math.max(bestCombo, newCombo);
    setBestCombo(newBest);
    setResults((prev) => [...prev, { cardId: card.id, correct: true }]);

    // Combo animation
    const milestone = getComboText(newCombo);
    if (milestone) {
      setComboText(milestone);
      setShowComboAnim(true);
      setTimeout(() => setShowComboAnim(false), 600);

      // Character popup
      const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
      const line = getCharacterLine(char.id, newCombo);
      setCharacterPopup({ character: char, line, combo: newCombo, fadingOut: false });
      setTimeout(() => {
        setCharacterPopup((prev) => prev ? { ...prev, fadingOut: true } : null);
      }, 1600);
      setTimeout(() => {
        setCharacterPopup(null);
      }, 2000);
    }

    // Update progress
    let progress = loadProgress();
    progress = advanceFlashcard(progress, card.id);
    progress = updateStreak(progress);

    // Bloom: every 3 correct cards → 1 bloom
    const totalCorrectInSession = results.filter((r) => r.correct).length + 1;
    if (totalCorrectInSession % 3 === 0) {
      progress = addBloom(progress);
      setShowBloomAnimation(true);
      setTimeout(() => setShowBloomAnimation(false), 800);
    }

    saveProgress(progress);
    setProgressRef(progress);

    // Auto advance
    setTimeout(() => {
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        finishSession(progress, newBest);
      }
    }, 800);
  };

  const handleIncorrect = () => {
    const card = cards[currentIndex];
    setCombo(0);
    setResults((prev) => [...prev, { cardId: card.id, correct: false }]);

    // Update progress
    let progress = loadProgress();
    progress = demoteFlashcard(progress, card.id);
    progress = updateStreak(progress);
    saveProgress(progress);
    setProgressRef(progress);

    // Auto advance
    setTimeout(() => {
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        finishSession(progress, bestCombo);
      }
    }, 800);
  };

  const finishSession = (progress, sessionBestCombo) => {
    const correctCount = results.filter((r) => r.correct).length + (results.length < cards.length ? 0 : 0);
    const allCards = getAllFlashcards();
    const mastered = getMasteredCount(progress.flashcards.boxes);

    progress = updateFlashcardStats(progress, {
      totalCorrect: results.filter((r) => r.correct).length,
      totalSeen: results.length,
      bestCombo: sessionBestCombo,
      masteredCount: mastered,
    });
    saveProgress(progress);
    setProgressRef(progress);
    setDone(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-purple-400 text-xl">🃏</div>
      </div>
    );
  }

  if (done) {
    const correctCount = results.filter((r) => r.correct).length;
    const bloomsEarned = Math.floor(correctCount / 3);
    const allCards = getAllFlashcards();
    const mastered = getMasteredCount(progressRef?.flashcards?.boxes || {});

    // Category breakdown
    const catResults = {};
    results.forEach(({ cardId, correct }) => {
      const card = cards.find((c) => c.id === cardId) || allCards.find((c) => c.id === cardId);
      if (!card) return;
      const cat = card.category;
      if (!catResults[cat]) catResults[cat] = { correct: 0, total: 0 };
      catResults[cat].total += 1;
      if (correct) catResults[cat].correct += 1;
    });

    return (
      <main className="pt-6 animate-fade-in">
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">
            {correctCount === results.length ? '🌟' : correctCount > 0 ? '🃏' : '💪'}
          </p>
          <h2 className="text-xl font-bold text-gray-700 font-kiwi">
            セッション完了！
          </h2>
        </div>

        {/* Results summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-purple-100 shadow-sm mb-4">
          <div className="grid grid-cols-3 text-center divide-x divide-gray-100">
            <div>
              <p className="text-2xl font-bold text-purple-500 font-kiwi">{results.length}</p>
              <p className="text-xs text-gray-500">チャレンジ</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500 font-kiwi">{correctCount}</p>
              <p className="text-xs text-gray-500">覚えてた</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-orange font-kiwi">{bestCombo}</p>
              <p className="text-xs text-gray-500">ベストコンボ🔥</p>
            </div>
          </div>
        </div>

        {/* Blooms earned */}
        {bloomsEarned > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sakura-100 shadow-sm mb-4 text-center">
            <p className="text-sm text-gray-600">
              さくら <span className="font-bold text-sakura-500 text-lg">+{bloomsEarned}</span> 個獲得！🌸
            </p>
          </div>
        )}

        {/* Category breakdown */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
          <p className="text-sm font-bold text-gray-600 mb-3">カテゴリ別</p>
          <div className="space-y-2">
            {Object.entries(catResults).map(([catId, data]) => {
              const cat = getCategoryInfo(catId);
              return (
                <div key={catId} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{cat.emoji} {cat.name}</span>
                  <span className={`text-sm font-bold ${
                    data.correct === data.total ? 'text-emerald-500' :
                    data.correct > 0 ? 'text-yellow-500' : 'text-red-400'
                  }`}>
                    {data.correct}/{data.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mastered count */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm mb-4 text-center">
          <p className="text-sm text-gray-500">マスターしたカード</p>
          <p className="text-lg font-bold text-purple-500 font-kiwi">{mastered} / {allCards.length}</p>
        </div>

        {/* Navigation */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-200"
          >
            もう一回チャレンジ 🃏
          </button>
          <Link href="/">
            <button className="w-full py-3.5 bg-white/80 border border-purple-100 text-gray-600 rounded-2xl font-bold">
              ホームに戻る
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const currentCard = cards[currentIndex];
  const boxLevel = getBoxForCard(progressRef?.flashcards?.boxes || {}, currentCard.id);

  return (
    <main className="pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-gray-400 text-sm">
          ← 戻る
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
            暗記カード🃏
          </span>
          <span className="text-sm text-gray-500 font-medium">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <ProgressBar current={results.length} total={cards.length} />
      </div>

      {/* Combo counter */}
      {combo > 0 && (
        <div className={`text-center mb-3 ${showComboAnim ? 'animate-combo-pulse' : ''}`}>
          <span className="text-lg font-bold text-warm-orange font-kiwi">
            🔥 {combo}コンボ
          </span>
          {comboText && (
            <span className="ml-2 text-sm font-bold text-purple-500">
              {comboText}
            </span>
          )}
        </div>
      )}

      {/* Card */}
      <FlashCard
        key={currentCard.id}
        card={currentCard}
        boxLevel={boxLevel}
        onCorrect={handleCorrect}
        onIncorrect={handleIncorrect}
      />

      {/* Character popup overlay */}
      {characterPopup && (
        <div className="fixed inset-x-0 bottom-24 flex justify-center pointer-events-none z-50">
          <div className={`flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-purple-100 max-w-xs ${
            characterPopup.fadingOut ? 'animate-character-out' : 'animate-character-in'
          }`}>
            <img
              src={`/character/${characterPopup.character.file}`}
              alt={characterPopup.character.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-purple-200 flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="min-w-0">
              <p className="text-xs text-purple-400 font-bold">{characterPopup.character.name}</p>
              <p className="text-sm text-gray-700 font-medium leading-snug">
                「{characterPopup.line}」
              </p>
              <p className="text-xs text-warm-orange font-bold mt-0.5">🔥{characterPopup.combo}コンボ！</p>
            </div>
          </div>
        </div>
      )}

      {/* Bloom animation overlay */}
      {showBloomAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="animate-bloom text-6xl">🌸</div>
        </div>
      )}
    </main>
  );
}
