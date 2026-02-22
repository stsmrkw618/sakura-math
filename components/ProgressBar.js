'use client';

export default function ProgressBar({ current, total }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-600">
          {current} / {total} もん
        </span>
        <span className="text-sm font-medium text-sakura-400">
          {percent}%
        </span>
      </div>
      <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden border border-sakura-100">
        <div
          className="h-full bg-gradient-to-r from-sakura-300 to-sakura-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
