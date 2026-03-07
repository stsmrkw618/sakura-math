import data from '../data/flashcards.json';
import { loadProgress, saveProgress } from './storage';

export function getAllFlashcards() {
  const progress = loadProgress();
  const fc = progress.flashcards || {};
  const hiddenSet = new Set(fc.hiddenCards || []);
  const staticCards = data.cards.filter(c => !hiddenSet.has(c.id));
  return [...staticCards, ...(fc.customCards || [])];
}

export function getHiddenFlashcards() {
  const progress = loadProgress();
  const hiddenSet = new Set(progress.flashcards?.hiddenCards || []);
  return data.cards.filter(c => hiddenSet.has(c.id));
}

export function addFlashcard(card) {
  const progress = loadProgress();
  progress.flashcards.customCards = [...(progress.flashcards.customCards || []), card];
  saveProgress(progress);
}

export function hideFlashcard(cardId) {
  const progress = loadProgress();
  const fc = progress.flashcards;
  // If it's a custom card, remove from customCards
  const addedIdx = (fc.customCards || []).findIndex(c => c.id === cardId);
  if (addedIdx >= 0) {
    fc.customCards = fc.customCards.filter(c => c.id !== cardId);
  } else {
    // Static card — mark as hidden
    fc.hiddenCards = [...new Set([...(fc.hiddenCards || []), cardId])];
  }
  saveProgress(progress);
}

export function unhideFlashcard(cardId) {
  const progress = loadProgress();
  progress.flashcards.hiddenCards = (progress.flashcards.hiddenCards || []).filter(id => id !== cardId);
  saveProgress(progress);
}

export function isCustomCard(cardId) {
  const progress = loadProgress();
  return (progress.flashcards?.customCards || []).some(c => c.id === cardId);
}

export function getNextCustomId() {
  const allCards = getAllFlashcards();
  let maxNum = 0;
  for (const card of allCards) {
    const match = card.id.match(/^fc-(\d+)$/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  }
  return `fc-${String(maxNum + 1).padStart(3, '0')}`;
}

export function getFlashcardCategories() {
  return data.categories;
}

export function getCategoryInfo(categoryId) {
  const cat = data.categories.find((c) => c.id === categoryId);
  if (!cat) return { id: categoryId, name: categoryId, emoji: '📝', color: 'gray' };
  return cat;
}

const CATEGORY_COLORS = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

export function getCategoryColor(categoryId) {
  const cat = getCategoryInfo(categoryId);
  return CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.gray;
}
