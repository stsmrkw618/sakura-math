import data from '../data/flashcards.json';

const CUSTOM_KEY = 'sakura_custom_flashcards';

function loadCustomData() {
  if (typeof window === 'undefined') return { added: [], hidden: [] };
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return { added: [], hidden: [] };
    const parsed = JSON.parse(raw);
    return { added: parsed.added || [], hidden: parsed.hidden || parsed.deleted || [] };
  } catch {
    return { added: [], hidden: [] };
  }
}

function saveCustomData(customData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(customData));
}

export function getAllFlashcards() {
  const custom = loadCustomData();
  const hiddenSet = new Set(custom.hidden);
  const staticCards = data.cards.filter(c => !hiddenSet.has(c.id));
  return [...staticCards, ...custom.added];
}

export function getHiddenFlashcards() {
  const custom = loadCustomData();
  const hiddenSet = new Set(custom.hidden);
  return data.cards.filter(c => hiddenSet.has(c.id));
}

export function addFlashcard(card) {
  const custom = loadCustomData();
  custom.added.push(card);
  saveCustomData(custom);
}

export function hideFlashcard(cardId) {
  const custom = loadCustomData();
  // If it's a custom card, remove from added list
  const addedIdx = custom.added.findIndex(c => c.id === cardId);
  if (addedIdx >= 0) {
    custom.added.splice(addedIdx, 1);
  } else {
    // Static card — mark as hidden
    if (!custom.hidden.includes(cardId)) {
      custom.hidden.push(cardId);
    }
  }
  saveCustomData(custom);
}

export function unhideFlashcard(cardId) {
  const custom = loadCustomData();
  custom.hidden = custom.hidden.filter(id => id !== cardId);
  saveCustomData(custom);
}

export function isCustomCard(cardId) {
  const custom = loadCustomData();
  return custom.added.some(c => c.id === cardId);
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
