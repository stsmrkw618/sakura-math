// Leitner Box intervals (in sessions)
// Box 1: every session, Box 2: every 2, Box 3: every 5, Box 4: every 10, Box 5: mastered
const LEITNER_INTERVALS = { 1: 1, 2: 2, 3: 5, 4: 10 };
const MAX_BOX = 5;
const MAX_CARDS_PER_SESSION = 15;

export function getFlashcardsDue(allCards, boxData, sessionCount) {
  const due = allCards.filter((card) => {
    const info = boxData[card.id];
    if (!info) return true; // New card → always due
    if (info.box >= MAX_BOX) return false; // Mastered
    const interval = LEITNER_INTERVALS[info.box] || 1;
    return (sessionCount - info.lastSeenSession) >= interval;
  });

  // Sort: lower box first (struggling cards get priority), then new cards
  due.sort((a, b) => {
    const boxA = boxData[a.id]?.box ?? 0;
    const boxB = boxData[b.id]?.box ?? 0;
    return boxA - boxB;
  });

  return due.slice(0, MAX_CARDS_PER_SESSION);
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

export function getBoxForCard(boxData, cardId) {
  return boxData[cardId]?.box ?? 0;
}
