'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function ScratchPad() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const lastPoint = useRef(null);

  const COLLAPSED_HEIGHT = 200;
  const EXPANDED_HEIGHT = 400;

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const height = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Draw grid
    drawGrid(ctx, rect.width, height);
  }, [isExpanded]);

  const drawGrid = (ctx, width, height) => {
    ctx.save();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    const gridSize = 20;

    for (let x = gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  useEffect(() => {
    setupCanvas();

    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  };

  const startDrawing = (e) => {
    // Prevent scrolling while drawing
    e.preventDefault();
    setIsDrawing(true);
    const point = getPoint(e);
    lastPoint.current = point;

    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(1, point.pressure * 2.5), 0, Math.PI * 2);
    ctx.fillStyle = '#374151';
    ctx.fill();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const ctx = canvasRef.current.getContext('2d');
    const point = getPoint(e);
    const prev = lastPoint.current;

    if (!prev) {
      lastPoint.current = point;
      return;
    }

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = '#374151';
    // Pressure-sensitive line width (Apple Pencil)
    ctx.lineWidth = Math.max(1, point.pressure * 3.5);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPoint.current = point;
    if (!hasContent) setHasContent(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const height = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, rect.width, height);
    setHasContent(false);
  };

  const toggleExpand = () => {
    // Save current drawing
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();

    setIsExpanded((prev) => !prev);

    // Restore drawing after resize
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      };
      img.src = imageData;
    }, 50);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span>✏️</span> メモ・計算スペース
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpand}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg active:scale-[0.95] transition-transform"
          >
            {isExpanded ? '↕ 小さく' : '↕ 大きく'}
          </button>
          {hasContent && (
            <button
              onClick={clearCanvas}
              className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded-lg active:scale-[0.95] transition-transform"
            >
              消す
            </button>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
        style={{ height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT }}
      >
        <canvas
          ref={canvasRef}
          className="touch-none cursor-crosshair"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
        />
      </div>
    </div>
  );
}
