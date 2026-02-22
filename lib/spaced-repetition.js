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
 * @param {Array} problems - 全問題
 * @param {Object} reviews - 復習データ
 * @param {Object} options - { mode: 'normal' | 'highlevel' }
 *   normal: 正答率40%以上の問題
 *   highlevel: 正答率20%以上40%未満の問題
 * @returns {{ problems: Array, isDue: boolean }}
 *   isDue: true=復習期日の問題あり, false=期日なし（全問題から出題）
 */
export function getDueProblems(problems, reviews, options = {}) {
  const { mode = 'normal' } = options;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 難易度でフィルタ
  const filtered = problems.filter((problem) => {
    const rate = problem.correctRate || 0;
    if (mode === 'highlevel') {
      return rate >= 20 && rate < 40;
    }
    return rate >= 40;
  });

  // 復習期日が来ている問題を抽出
  const dueProblems = filtered
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
        return (b.correctRate || 0) - (a.correctRate || 0);
      }

      // 期日が早いものを優先
      const dateA = new Date(reviewA.nextReviewDate);
      const dateB = new Date(reviewB.nextReviewDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      return (b.correctRate || 0) - (a.correctRate || 0);
    });

  // 前提問題（助走）を含めて最終リストを構築
  const problemMap = {};
  problems.forEach((p) => { problemMap[p.id] = p; });

  const buildWithPrereqs = (list) => {
    // 大問単位でグループ化（出現順を保持）
    const groupOrder = [];
    const groupMap = new Map();
    for (const problem of list) {
      const key = getGroupKey(problem);
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
        groupOrder.push(key);
      }
      groupMap.get(key).push(problem);
    }

    // グループごとに前提問題を含めて展開
    const addedIds = new Set();
    const result = [];
    for (const key of groupOrder) {
      for (const problem of groupMap.get(key)) {
        if (problem.prerequisites) {
          for (const prereqId of problem.prerequisites) {
            if (!addedIds.has(prereqId) && problemMap[prereqId]) {
              addedIds.add(prereqId);
              result.push(problemMap[prereqId]);
            }
          }
        }
        if (!addedIds.has(problem.id)) {
          addedIds.add(problem.id);
          result.push(problem);
        }
      }
    }
    return result;
  };

  // 期日の問題がある場合はそれを返す
  if (dueProblems.length > 0) {
    return { problems: buildWithPrereqs(dueProblems), isDue: true };
  }

  // 期日の問題がない場合は同条件の全問題を返す（何度でもチャレンジ可能）
  const allSorted = [...filtered].sort((a, b) => {
    const reviewA = reviews[a.id];
    const reviewB = reviews[b.id];
    // 正答率が低い（苦手な）問題を優先
    const rateA = reviewA?.history?.length
      ? reviewA.history.filter(h => h.correct).length / reviewA.history.length
      : 0.5;
    const rateB = reviewB?.history?.length
      ? reviewB.history.filter(h => h.correct).length / reviewB.history.length
      : 0.5;
    return rateA - rateB;
  });

  return { problems: buildWithPrereqs(allSorted), isDue: false };
}

/**
 * 大問のグループキーを取得
 * "第405回公開テスト 大問4(1)" → "第405回公開テスト 大問4"
 */
export function getGroupKey(problem) {
  return problem.source.replace(/[\(（][\d]+[\)）]$/, '').trim();
}

/**
 * 大問1（計算）かどうかを判定
 */
function isWarmupGroup(groupKey) {
  return /大問1$/.test(groupKey);
}

/**
 * 配列をシャッフル（Fisher-Yates, in-place）
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * 大問グループ単位でシャッフルし、1回分のバッチ（5〜10問）を選択
 * - 大問1（計算）を先頭に配置（ウォーミングアップ）
 * - 大問2以降はランダム順
 * - 同じ大問内の小問は元の順序を維持
 */
export function selectBatch(dueProblems, minSize = 5, maxSize = 10) {
  if (dueProblems.length === 0) return [];

  // 大問グループに分割（同じ大問内の順序は保持）
  const groups = [];
  const groupMap = new Map();

  for (const problem of dueProblems) {
    const key = getGroupKey(problem);
    if (!groupMap.has(key)) {
      const group = { key, problems: [] };
      groupMap.set(key, group);
      groups.push(group);
    }
    groupMap.get(key).problems.push(problem);
  }

  // 大問1（ウォーミングアップ）とそれ以外に分離
  const warmupGroups = groups.filter((g) => isWarmupGroup(g.key));
  const otherGroups = groups.filter((g) => !isWarmupGroup(g.key));

  // それぞれグループ順をシャッフル（大問内の小問順はそのまま）
  shuffleArray(warmupGroups);
  shuffleArray(otherGroups);

  // ウォーミングアップ → その他 の順で結合
  const orderedGroups = [...warmupGroups, ...otherGroups];

  if (dueProblems.length <= maxSize) {
    // 全問出題（大問1が先、それ以外はランダム順）
    return orderedGroups.flatMap((g) => g.problems);
  }

  // グループ単位で追加、5〜10問に収める
  const batch = [];
  for (const group of orderedGroups) {
    if (batch.length >= minSize && batch.length + group.problems.length > maxSize) {
      break;
    }
    batch.push(...group.problems);
  }

  // 最低1グループは含める
  if (batch.length === 0 && orderedGroups.length > 0) {
    batch.push(...orderedGroups[0].problems);
  }

  return batch;
}
