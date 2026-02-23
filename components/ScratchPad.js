'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function ScratchPad() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hasContent, setHasContent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const stateRef = useRef({
    isDrawing: false,
    hasContent: false,
    lastX: 0,
    lastY: 0,
    canvasRect: null,
  });

  const COLLAPSED_HEIGHT = 200;
  const EXPANDED_HEIGHT = 400;

  const drawGrid = useCallback((ctx, width, height) => {
    ctx.save();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    ctx.beginPath();
    for (let x = gridSize; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
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

    // Cache rect for fast coordinate calculation
    stateRef.current.canvasRect = canvas.getBoundingClientRect();
  }, [isExpanded, drawGrid]);

  // Attach native pointer events directly (bypasses React synthetic events)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    const onPointerDown = (e) => {
      if (e.pointerType === 'touch') return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);

      s.canvasRect = canvas.getBoundingClientRect();
      s.isDrawing = true;
      s.lastX = e.clientX - s.canvasRect.left;
      s.lastY = e.clientY - s.canvasRect.top;

      // Draw initial dot
      const pressure = e.pressure || 0.5;
      ctx.beginPath();
      ctx.arc(s.lastX, s.lastY, Math.max(0.8, pressure * 2), 0, Math.PI * 2);
      ctx.fillStyle = '#374151';
      ctx.fill();
    };

    const onPointerMove = (e) => {
      if (!s.isDrawing || e.pointerType === 'touch') return;
      e.preventDefault();

      const rect = s.canvasRect;
      ctx.strokeStyle = '#374151';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Use coalesced events for smoother Apple Pencil strokes
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      const points = (events && events.length > 0) ? events : [e];

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const x = pt.clientX - rect.left;
        const y = pt.clientY - rect.top;
        const pressure = pt.pressure || 0.5;

        ctx.beginPath();
        ctx.moveTo(s.lastX, s.lastY);
        ctx.lineTo(x, y);
        ctx.lineWidth = Math.max(1.2, pressure * 3.5);
        ctx.stroke();

        s.lastX = x;
        s.lastY = y;
      }

      if (!s.hasContent) {
        s.hasContent = true;
        setHasContent(true);
      }
    };

    const onPointerUp = (e) => {
      if (!s.isDrawing) return;
      s.isDrawing = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isExpanded]);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    const height = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, rect.width, height);
    stateRef.current.hasContent = false;
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
        />
      </div>
    </div>
  );
}
