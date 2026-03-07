'use client';

import { useState } from 'react';

export default function FigureDisplay({ figure }) {
  const [expanded, setExpanded] = useState(false);

  if (!figure) return null;

  if (figure.type === 'svg') {
    return (
      <div className="my-4 flex justify-center">
        <div
          className="w-full max-w-[280px] bg-white rounded-xl p-4 border border-gray-100"
          dangerouslySetInnerHTML={{ __html: figure.svg }}
        />
      </div>
    );
  }

  if (figure.type === 'image') {
    return (
      <>
        <div className="my-4 flex justify-center">
          <div
            className="w-full max-w-[320px] bg-white rounded-xl p-3 border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setExpanded(true)}
          >
            <img
              src={`/${figure.path}`}
              alt={figure.description}
              className="w-full h-auto rounded-lg"
            />
            <p className="text-[10px] text-gray-300 text-center mt-1">タップで拡大</p>
          </div>
        </div>

        {expanded && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setExpanded(false)}
          >
            <div className="relative w-[95vw] max-w-[600px] max-h-[85vh] p-2">
              <img
                src={`/${figure.path}`}
                alt={figure.description}
                className="w-full h-auto rounded-xl"
              />
              <button
                onClick={() => setExpanded(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
