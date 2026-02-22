/**
 * SM-2 アルゴリズム（3段階にシンプル化）
 *
 * quality: 1 = わからなかった, 3 = あやしい, 5 = できた
 */
export function calculateNextReview(reviewData, quality) {
  let { easeFactor, interval, repetitions } = reviewData;

  if (quality >= 3) {
    // 正解（できた or あやしい）
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // 不正解 → リセット
    repetitions = 0;
    interval = 1;
  }

  // easeFactor 更新
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // 「あやしい」(quality=3) は interval を控えめに
  if (quality === 3 && interval > 1) {
    interval = Math.max(1, Math.round(interval * 0.7));
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReviewDate: nextReviewDate.toISOString(),
  };
}

/**
 * 復習が必要な問題を取得（期日順 + 正答率順でソート）
 */
export function getDueProblems(problems, reviews) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return problems
    .filter((problem) => {
      const review = reviews[problem.id];
      if (!review) return true; // 未学習 = 即復習対象
      const nextDate = new Date(review.nextReviewDate);
      return nextDate <= now;
    })
    .sort((a, b) => {
      const reviewA = reviews[a.id];
      const reviewB = reviews[b.id];

      // 未学習を最優先
      if (!reviewA && reviewB) return -1;
      if (reviewA && !reviewB) return 1;
      if (!reviewA && !reviewB) {
        // 正答率が高い問題（取るべき問題）を優先
        return (b.correctRate || 0) - (a.correctRate || 0);
      }

      // 期日が早いものを優先
      const dateA = new Date(reviewA.nextReviewDate);
      const dateB = new Date(reviewB.nextReviewDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      // 正答率が高い問題を優先
      return (b.correctRate || 0) - (a.correctRate || 0);
    });
}
