import { calculateNextReview } from './spaced-repetition';

const STORAGE_KEY = 'sakura_progress';

const DEFAULT_PROGRESS = {
  reviews: {},
  sakura: {
    totalBlooms: 0,
    currentTreeBlooms: 0,
    fullBloomCount: 0,
    fullBloomThreshold: 11,
  },
  streak: {
    currentStreak: 0,
    lastActiveDate: null,
    longestStreak: 0,
  },
};

export function loadProgress() {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(data);

    // 常に最新のしきい値を適用（旧データからの移行）
    if (parsed.sakura) {
      const newThreshold = DEFAULT_PROGRESS.sakura.fullBloomThreshold;
      parsed.sakura.fullBloomThreshold = newThreshold;
      // しきい値が下がった場合、超過分を満開に変換
      while (parsed.sakura.currentTreeBlooms >= newThreshold) {
        parsed.sakura.currentTreeBlooms -= newThreshold;
        parsed.sakura.fullBloomCount += 1;
      }
    }

    return parsed;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateStreak(progress) {
  const today = new Date().toISOString().split('T')[0];
  const { streak } = progress;

  if (streak.lastActiveDate === today) return progress;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak;
  if (streak.lastActiveDate === yesterdayStr) {
    newStreak = streak.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  return {
    ...progress,
    streak: {
      currentStreak: newStreak,
      lastActiveDate: today,
      longestStreak: Math.max(streak.longestStreak, newStreak),
    },
  };
}

export function addBloom(progress) {
  const { sakura } = progress;
  const newCurrentBlooms = sakura.currentTreeBlooms + 1;
  const isFullBloom = newCurrentBlooms >= sakura.fullBloomThreshold;

  return {
    ...progress,
    sakura: {
      ...sakura,
      totalBlooms: sakura.totalBlooms + 1,
      currentTreeBlooms: isFullBloom ? 0 : newCurrentBlooms,
      fullBloomCount: isFullBloom ? sakura.fullBloomCount + 1 : sakura.fullBloomCount,
    },
  };
}

export function recordReview(progress, problemId, quality) {
  const now = new Date().toISOString();
  const current = progress.reviews[problemId] || {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    history: [],
  };

  const updated = calculateNextReview(current, quality);

  return {
    ...progress,
    reviews: {
      ...progress.reviews,
      [problemId]: {
        ...updated,
        lastReviewDate: now,
        history: [
          ...(current.history || []),
          { date: now, quality, correct: quality >= 3 },
        ],
      },
    },
  };
}
