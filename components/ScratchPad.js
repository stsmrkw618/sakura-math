'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function ScratchPad() {
  const canvasRef = useRef(null);
  const predictCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hasContent, setHasContent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const stateRef = useRef({
    isDrawing: false,
    hasContent: false,
    lastX: 0,
    lastY: 0,
    rectLeft: 0,
    rectTop: 0,
    ctx: null,
    predictCtx: null,
  });

  const COLLAPSED_HEIGHT = 200;
  const EXPANDED_HEIGHT = 400;

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const predictCanvas = predictCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !predictCanvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const height = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;

    // Main canvas (committed strokes)
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d', {
      desynchronized: true,
      willReadFrequently: false,
    });
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#374151';
    ctx.fillStyle = '#374151';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;

    // Prediction canvas (temporary predicted strokes, cleared each frame)
    predictCanvas.width = rect.width * dpr;
    predictCanvas.height = height * dpr;
    predictCanvas.style.width = `${rect.width}px`;
    predictCanvas.style.height = `${height}px`;

    const predictCtx = predictCanvas.getContext('2d', {
      desynchronized: true,
      willReadFrequently: false,
    });
    predictCtx.scale(dpr, dpr);
    predictCtx.strokeStyle = '#374151';
    predictCtx.lineCap = 'round';
    predictCtx.lineJoin = 'round';
    predictCtx.lineWidth = 2;

    // Cache contexts
    stateRef.current.ctx = ctx;
    stateRef.current.predictCtx = predictCtx;
  }, [isExpanded]);

  useEffect(() => {
    const predictCanvas = predictCanvasRef.current;
    if (!predictCanvas) return;

    const s = stateRef.current;

    const onPointerDown = (e) => {
      if (e.pointerType === 'touch') return;
      e.preventDefault();
      predictCanvas.setPointerCapture(e.pointerId);

      const rect = predictCanvas.getBoundingClientRect();
      s.rectLeft = rect.left;
      s.rectTop = rect.top;
      s.isDrawing = true;
      s.lastX = e.clientX - s.rectLeft;
      s.lastY = e.clientY - s.rectTop;

      // Draw initial dot
      s.ctx.beginPath();
      s.ctx.arc(s.lastX, s.lastY, 1, 0, Math.PI * 2);
      s.ctx.fill();
    };

    const onPointerMove = (e) => {
      if (!s.isDrawing || e.pointerType === 'touch') return;
      e.preventDefault();

      // --- Draw actual (coalesced) points on main canvas ---
      const coalesced = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      const events = (coalesced && coalesced.length > 0) ? coalesced : [e];

      s.ctx.beginPath();
      s.ctx.moveTo(s.lastX, s.lastY);

      for (let i = 0; i < events.length; i++) {
        s.lastX = events[i].clientX - s.rectLeft;
        s.lastY = events[i].clientY - s.rectTop;
        s.ctx.lineTo(s.lastX, s.lastY);
      }
      s.ctx.stroke();

      // --- Draw predicted points on prediction canvas ---
      // Clear prediction layer, then draw predicted future path
      s.predictCtx.clearRect(0, 0, predictCanvas.width, predictCanvas.height);

      if (e.getPredictedEvents) {
        const predicted = e.getPredictedEvents();
        if (predicted.length > 0) {
          s.predictCtx.beginPath();
          s.predictCtx.moveTo(s.lastX, s.lastY);
          for (let i = 0; i < predicted.length; i++) {
            s.predictCtx.lineTo(
              predicted[i].clientX - s.rectLeft,
              predicted[i].clientY - s.rectTop
            );
          }
          s.predictCtx.stroke();
        }
      }

      if (!s.hasContent) {
        s.hasContent = true;
        setHasContent(true);
      }
    };

    const onPointerUp = () => {
      if (!s.isDrawing) return;
      s.isDrawing = false;
      // Clear prediction layer
      s.predictCtx.clearRect(0, 0, predictCanvas.width, predictCanvas.height);
    };

    predictCanvas.addEventListener('pointerdown', onPointerDown);
    predictCanvas.addEventListener('pointermove', onPointerMove);
    predictCanvas.addEventListener('pointerup', onPointerUp);
    predictCanvas.addEventListener('pointerleave', onPointerUp);
    predictCanvas.addEventListener('pointercancel', onPointerUp);

    return () => {
      predictCanvas.removeEventListener('pointerdown', onPointerDown);
      predictCanvas.removeEventListener('pointermove', onPointerMove);
      predictCanvas.removeEventListener('pointerup', onPointerUp);
      predictCanvas.removeEventListener('pointerleave', onPointerUp);
      predictCanvas.removeEventListener('pointercancel', onPointerUp);
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
    const predictCanvas = predictCanvasRef.current;
    if (!canvas) return;
    stateRef.current.ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (predictCanvas) {
      stateRef.current.predictCtx.clearRect(0, 0, predictCanvas.width, predictCanvas.height);
    }
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
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        stateRef.current.ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
      };
      img.src = imageData;
    }, 50);
  };

  const gridBg = `repeating-linear-gradient(
    0deg, transparent, transparent 19px, #f0f0f0 19px, #f0f0f0 20px
  ), repeating-linear-gradient(
    90deg, transparent, transparent 19px, #f0f0f0 19px, #f0f0f0 20px
  )`;

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
        className="rounded-xl border border-gray-200 overflow-hidden shadow-sm relative"
        style={{
          height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
          background: gridBg,
          backgroundColor: 'white',
          willChange: 'transform',
        }}
      >
        {/* Main canvas: committed strokes */}
        <canvas
          ref={canvasRef}
          style={{ display: 'block', position: 'absolute', inset: 0 }}
        />
        {/* Prediction canvas: temporary predicted path (on top, receives events) */}
        <canvas
          ref={predictCanvasRef}
          className="touch-none cursor-crosshair"
          style={{ display: 'block', position: 'absolute', inset: 0 }}
        />
      </div>
    </div>
  );
}
