import data from '../data/flashcards.json';

export function getAllFlashcards() {
  return data.cards;
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
