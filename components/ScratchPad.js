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
    rectLeft: 0,
    rectTop: 0,
  });

  const COLLAPSED_HEIGHT = 200;
  const EXPANDED_HEIGHT = 400;

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Cap DPR at 2 for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const height = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    // desynchronized: true = low-latency canvas (bypasses compositor)
    const ctx = canvas.getContext('2d', {
      desynchronized: true,
      willReadFrequently: false,
    });
    ctx.scale(dpr, dpr);

    // Pre-set drawing style (never changes)
    ctx.strokeStyle = '#374151';
    ctx.fillStyle = '#374151';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
  }, [isExpanded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = stateRef.current;

    const onPointerDown = (e) => {
      if (e.pointerType === 'touch') return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);

      const rect = canvas.getBoundingClientRect();
      s.rectLeft = rect.left;
      s.rectTop = rect.top;
      s.isDrawing = true;
      s.lastX = e.clientX - s.rectLeft;
      s.lastY = e.clientY - s.rectTop;

      // Draw initial dot
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(s.lastX, s.lastY, 1, 0, Math.PI * 2);
      ctx.fill();
    };

    const onPointerMove = (e) => {
      if (!s.isDrawing || e.pointerType === 'touch') return;
      e.preventDefault();

      const ctx = canvas.getContext('2d');

      // Coalesced events for Apple Pencil smoothness
      let events;
      if (e.getCoalescedEvents) {
        const coalesced = e.getCoalescedEvents();
        events = coalesced.length > 0 ? coalesced : [e];
      } else {
        events = [e];
      }

      // Single path for all coalesced points → one stroke() call
      ctx.beginPath();
      ctx.moveTo(s.lastX, s.lastY);

      for (let i = 0; i < events.length; i++) {
        const x = events[i].clientX - s.rectLeft;
        const y = events[i].clientY - s.rectTop;
        ctx.lineTo(x, y);
        s.lastX = x;
        s.lastY = y;
      }

      ctx.stroke();

      if (!s.hasContent) {
        s.hasContent = true;
        setHasContent(true);
      }
    };

    const onPointerUp = () => {
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        ctx.drawImage(img, 0, 0, canvas.width / Math.min(window.devicePixelRatio || 1, 2), canvas.height / Math.min(window.devicePixelRatio || 1, 2));
      };
      img.src = imageData;
    }, 50);
  };

  // CSS grid background (not drawn on canvas — zero performance cost)
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
        className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
        style={{
          height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
          background: gridBg,
          backgroundColor: 'white',
        }}
      >
        <canvas
          ref={canvasRef}
          className="touch-none cursor-crosshair"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
