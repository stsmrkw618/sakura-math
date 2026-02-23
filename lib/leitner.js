// Leitner Box intervals (in sessions) — kept for reference
const MAX_BOX = 5;
const MAX_CARDS_PER_SESSION = 15;

// Weight by box: lower box = higher weight = appears more often
const BOX_WEIGHTS = { 0: 8, 1: 6, 2: 4, 3: 2, 4: 1, 5: 1 };

export function getFlashcardsWeighted(allCards, boxData) {
  if (allCards.length === 0) return [];

  // Assign weight to each card based on its box
  const weighted = allCards.map((card) => {
    const box = boxData[card.id]?.box ?? 0;
    const weight = BOX_WEIGHTS[box] ?? 1;
    return { card, weight };
  });

  // Weighted random selection without replacement
  const count = Math.min(MAX_CARDS_PER_SESSION, allCards.length);
  const selected = [];
  const remaining = [...weighted];

  for (let i = 0; i < count; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosen = remaining.length - 1; // fallback
    for (let j = 0; j < remaining.length; j++) {
      rand -= remaining[j].weight;
      if (rand <= 0) {
        chosen = j;
        break;
      }
    }
    selected.push(remaining[chosen].card);
    remaining.splice(chosen, 1);
  }

  // Shuffle the selected cards
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  return selected;
}

// Legacy function kept for compatibility
export function getFlashcardsDue(allCards, boxData, sessionCount) {
  return getFlashcardsWeighted(allCards, boxData);
}

export function advanceCard(boxData, cardId, sessionCount) {
  const current = boxData[cardId] || { box: 1, lastSeenSession: sessionCount };
  const newBox = Math.min(current.box + 1, MAX_BOX);
  return {
    ...boxData,
    [cardId]: { box: newBox, lastSeenSession: sessionCount },
  };
}

export function demoteCard(boxData, cardId, sessionCount) {
  return {
    ...boxData,
    [cardId]: { box: 1, lastSeenSession: sessionCount },
  };
}

export function getMasteredCount(boxData) {
  return Object.values(boxData).filter((info) => info.box >= MAX_BOX).length;
}

export function getLearnedCount(boxData) {
  return Object.values(boxData).filter((info) => info.box >= 3).length;
}

export function getBoxForCard(boxData, cardId) {
  return boxData[cardId]?.box ?? 0;
}
