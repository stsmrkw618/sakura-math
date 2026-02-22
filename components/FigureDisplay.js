'use client';

export default function FigureDisplay({ figure }) {
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
      <div className="my-4 flex justify-center">
        <div className="w-full max-w-[320px] bg-white rounded-xl p-3 border border-gray-100">
          <img
            src={`/${figure.path}`}
            alt={figure.description}
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    );
  }

  return null;
}
