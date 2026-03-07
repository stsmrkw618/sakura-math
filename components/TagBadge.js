'use client';

import { getTagColor } from '../lib/problems';

export default function TagBadge({ tag }) {
  const color = getTagColor(tag);

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${color.bg} ${color.text} ${color.border}`}
    >
      {tag}
    </span>
  );
}
