import React, { useState, useRef, useEffect } from 'react';
import { Minus, X, Maximize2, Move, Calculator } from 'lucide-react';
import { ThemeColors } from '../utils/theme';
import { evaluateExpression, formatResult } from '../utils/calculator';
import { playFeedback } from '../utils/audio';

interface FloatingMiniCalcProps {
  theme: ThemeColors;
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingMiniCalc: React.FC<FloatingMiniCalcProps> = ({ theme, isOpen, onClose }) => {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [pos, setPos] = useState({ x: 20, y: 120 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    setPos({
      x: Math.max(10, Math.min(window.innerWidth - 240, dragStartRef.current.startX + dx)),
      y: Math.max(50, Math.min(window.innerHeight - 300, dragStartRef.current.startY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleBtn = (val: string) => {
    playFeedback('click');
    setExpr((prev) => prev + val);
  };

  const handleClear = () => {
    playFeedback('clear');
    setExpr('');
    setResult('');
  };

  const handleBackspace = () => {
    playFeedback('click');
    setExpr((prev) => prev.slice(0, -1));
  };

  const handleEquals = () => {
    if (!expr) return;
    const res = evaluateExpression(expr);
    if (res.success && res.result !== null) {
      playFeedback('equals');
      const formatted = formatResult(res.result);
      setResult(formatted);
      setExpr(formatted.replace(/,/g, ''));
    } else {
      playFeedback('error');
      setResult('Error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className={`fixed z-50 w-56 rounded-2xl border shadow-2xl backdrop-blur-md transition-shadow select-none ${
        theme.id === 'light' ? 'bg-white/95 border-slate-300' : 'bg-zinc-950/95 border-zinc-700'
      }`}
    >
      {/* Draggable Title Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="px-2.5 py-2 flex items-center justify-between border-b border-zinc-800/80 cursor-grab active:cursor-grabbing rounded-t-2xl bg-white/5"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: theme.accentColor }}>
          <Move className="w-3 h-3 opacity-60" />
          <span>Mini Calc</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-white/10 text-zinc-400"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-2 space-y-1.5">
          {/* Display */}
          <div className="p-2 rounded-xl bg-black/40 border border-zinc-800 text-right">
            <div className="text-[10px] text-zinc-500 font-mono truncate">{expr || '0'}</div>
            <div className="text-sm font-bold font-mono text-emerald-400 truncate">
              {result || expr || '0'}
            </div>
          </div>

          {/* Compact Keypad */}
          <div className="grid grid-cols-4 gap-1 text-xs font-bold font-mono">
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px]"
            >
              C
            </button>
            <button
              onClick={handleBackspace}
              className="p-1.5 rounded-lg bg-white/5 border border-zinc-800 text-zinc-300"
            >
              ⌫
            </button>
            <button
              onClick={() => handleBtn('%')}
              className="p-1.5 rounded-lg bg-white/5 border border-zinc-800 text-zinc-300"
            >
              %
            </button>
            <button
              onClick={() => handleBtn('÷')}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            >
              ÷
            </button>

            {['7', '8', '9', '×'].map((k) => (
              <button
                key={k}
                onClick={() => (k === '×' ? handleBtn('×') : handleBtn(k))}
                className={`p-1.5 rounded-lg border ${
                  k === '×'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 border-zinc-800 text-zinc-100'
                }`}
              >
                {k}
              </button>
            ))}

            {['4', '5', '6', '−'].map((k) => (
              <button
                key={k}
                onClick={() => (k === '−' ? handleBtn('−') : handleBtn(k))}
                className={`p-1.5 rounded-lg border ${
                  k === '−'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 border-zinc-800 text-zinc-100'
                }`}
              >
                {k}
              </button>
            ))}

            {['1', '2', '3', '+'].map((k) => (
              <button
                key={k}
                onClick={() => (k === '+' ? handleBtn('+') : handleBtn(k))}
                className={`p-1.5 rounded-lg border ${
                  k === '+'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 border-zinc-800 text-zinc-100'
                }`}
              >
                {k}
              </button>
            ))}

            <button
              onClick={() => handleBtn('0')}
              className="col-span-2 p-1.5 rounded-lg bg-white/5 border border-zinc-800 text-zinc-100"
            >
              0
            </button>
            <button
              onClick={() => handleBtn('.')}
              className="p-1.5 rounded-lg bg-white/5 border border-zinc-800 text-zinc-100"
            >
              .
            </button>
            <button
              onClick={handleEquals}
              className="p-1.5 rounded-lg font-black bg-emerald-500 text-black shadow-md"
            >
              =
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
