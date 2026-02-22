'use client';

import { getTagColor } from '../lib/problems';

export default function TagBadge({ tag }) {
  const color = getTagColor(tag);

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}
    >
      {tag}
    </span>
  );
}
