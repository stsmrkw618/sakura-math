'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function ScratchPad() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const hasContentRef = useRef(false);
  const [hasContent, setHasContent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const lastPoint = useRef(null);
  const rafId = useRef(null);
  const pendingPoints = useRef([]);

  const COLLAPSED_HEIGHT = 200;
  const EXPANDED_HEIGHT = 400;

  const drawGrid = useCallback((ctx, width, height) => {
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
  }, []);

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

    drawGrid(ctx, rect.width, height);
  }, [isExpanded, drawGrid]);

  useEffect(() => {
    setupCanvas();

    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [setupCanvas]);

  // Reject touch (palm) — only allow pen and mouse
  const isAllowedInput = (e) => {
    return e.pointerType === 'pen' || e.pointerType === 'mouse';
  };

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  };

  const flushPoints = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const points = pendingPoints.current;
    if (points.length === 0) return;

    ctx.strokeStyle = '#374151';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const seg of points) {
      ctx.beginPath();
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(seg.to.x, seg.to.y);
      ctx.lineWidth = Math.max(1.2, seg.to.pressure * 3.5);
      ctx.stroke();
    }

    pendingPoints.current = [];
    rafId.current = null;
  }, []);

  const startDrawing = (e) => {
    if (!isAllowedInput(e)) return;
    e.preventDefault();
    isDrawingRef.current = true;

    const point = getPoint(e);
    lastPoint.current = point;

    // Draw initial dot
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(0.8, point.pressure * 2), 0, Math.PI * 2);
    ctx.fillStyle = '#374151';
    ctx.fill();
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !isAllowedInput(e)) return;
    e.preventDefault();

    const prev = lastPoint.current;
    if (!prev) return;

    // Use coalesced events for smoother Apple Pencil strokes
    let events = [e];
    if (e.getCoalescedEvents) {
      const coalesced = e.getCoalescedEvents();
      if (coalesced.length > 0) events = coalesced;
    }

    for (const evt of events) {
      const point = getPoint(evt);
      pendingPoints.current.push({ from: { ...lastPoint.current }, to: point });
      lastPoint.current = point;
    }

    // Batch render via requestAnimationFrame
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(flushPoints);
    }

    if (!hasContentRef.current) {
      hasContentRef.current = true;
      setHasContent(true);
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawingRef.current) return;
    // Flush any remaining points
    if (pendingPoints.current.length > 0) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      flushPoints();
    }
    isDrawingRef.current = false;
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    const height = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, rect.width, height);
    hasContentRef.current = false;
    setHasContent(false);
  };

  const toggleExpand = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();

    setIsExpanded((prev) => !prev);

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
