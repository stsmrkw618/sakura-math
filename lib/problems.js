import data from '../data/problems.json';

export function getAllProblems() {
  return data.problems;
}

export function getAllTags() {
  return data.tags;
}

export function getProblemById(id) {
  return data.problems.find((p) => p.id === id);
}

export function getProblemsByTag(tagName) {
  return data.problems.filter((p) => p.tags.includes(tagName));
}

const TAG_COLORS = {
  '計算': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  '単位換算': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  '割合': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  '図形': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  '文章題': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  '速さ': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  '規則性': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  '場合の数': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  '比': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  '角度': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  '面積': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  '体積': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'その他': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

export function getTagColor(tagName) {
  return TAG_COLORS[tagName] || TAG_COLORS['その他'];
}

export function getCorrectRateColor(rate) {
  if (rate >= 70) return 'text-emerald-600';
  if (rate >= 40) return 'text-yellow-600';
  return 'text-red-500';
}

export function getCorrectRateBg(rate) {
  if (rate >= 70) return 'bg-emerald-50';
  if (rate >= 40) return 'bg-yellow-50';
  return 'bg-red-50';
}
