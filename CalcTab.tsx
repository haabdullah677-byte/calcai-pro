import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  RotateCcw,
  Delete,
  Sliders,
  ChevronDown,
  Trash2,
  Lock,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Languages,
  Maximize2,
  Layers,
} from 'lucide-react';
import { ThemeColors } from '../utils/theme';
import {
  evaluateExpression,
  formatResult,
  getLivePreview,
  checkSecretVaultTrigger,
} from '../utils/calculator';
import {
  getVaultPin,
  getHistory,
  saveHistory,
  HistoryEntry,
} from '../utils/storage';
import { getRealVaultPin, getDecoyVaultPin } from '../utils/vaultStorage';
import { numberToEnglishWords, numberToUrduWords, numberToRomanUrduWords } from '../utils/numberToWords';
import { playFeedback } from '../utils/audio';

interface CalcTabProps {
  theme: ThemeColors;
  onOpenVault: (isDecoy?: boolean) => void;
  onToggleMiniCalc: () => void;
  isMiniCalcOpen: boolean;
}

export const CalcTab: React.FC<CalcTabProps> = ({
  theme,
  onOpenVault,
  onToggleMiniCalc,
  isMiniCalcOpen,
}) => {
  const [expression, setExpression] = useState('');
  const [preview, setPreview] = useState('');
  const [isScientific, setIsScientific] = useState(false);
  const [isRadian, setIsRadian] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [vaultHint, setVaultHint] = useState<string | null>(null);

  // Memory keys state
  const [memory, setMemory] = useState<number>(0);

  // Number to Words language switch ('en' | 'ur' | 'roman')
  const [wordLang, setWordLang] = useState<'en' | 'ur' | 'roman'>('en');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const displayEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Update live preview when expression changes
  useEffect(() => {
    if (!expression) {
      setPreview('');
      return;
    }
    const p = getLivePreview(expression, isRadian);
    setPreview(p);
  }, [expression, isRadian]);

  // Scroll to end of expression
  useEffect(() => {
    if (displayEndRef.current) {
      displayEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [expression]);

  const handleInput = (val: string) => {
    playFeedback('click');
    setExpression((prev) => {
      if (val === '.') {
        const lastToken = prev.split(/[\+\−×÷\*\/\(\)\^]/).pop() || '';
        if (lastToken.includes('.')) return prev;
      }
      return prev + val;
    });
  };

  const handleOperator = (op: string) => {
    playFeedback('operator');
    setExpression((prev) => {
      if (!prev) {
        if (op === '−' || op === '-') return '−';
        return '';
      }
      const lastChar = prev.slice(-1);
      if (['+', '−', '-', '×', '*', '÷', '/', '^'].includes(lastChar)) {
        return prev.slice(0, -1) + op;
      }
      return prev + op;
    });
  };

  const handleClear = () => {
    playFeedback('clear');
    setExpression('');
    setPreview('');
  };

  const handleBackspace = () => {
    playFeedback('click');
    setExpression((prev) => {
      if (!prev) return '';
      const funcMatches = prev.match(/(sin\(|cos\(|tan\(|asin\(|acos\(|atan\(|sqrt\(|cbrt\(|log\(|ln\(|fact\()$/);
      if (funcMatches) {
        return prev.slice(0, -funcMatches[0].length);
      }
      return prev.slice(0, -1);
    });
  };

  const handleScientificFunction = (fn: string) => {
    playFeedback('operator');
    setExpression((prev) => prev + fn + '(');
  };

  // Memory Key Handlers
  const handleMemoryClear = () => {
    playFeedback('clear');
    setMemory(0);
  };

  const handleMemoryRecall = () => {
    playFeedback('click');
    if (memory !== 0) {
      setExpression((prev) => prev + String(memory));
    }
  };

  const handleMemoryAdd = () => {
    playFeedback('operator');
    const currentVal = getCurrentNumericValue();
    if (currentVal !== null) {
      setMemory((prev) => prev + currentVal);
    }
  };

  const handleMemorySubtract = () => {
    playFeedback('operator');
    const currentVal = getCurrentNumericValue();
    if (currentVal !== null) {
      setMemory((prev) => prev - currentVal);
    }
  };

  const getCurrentNumericValue = (): number | null => {
    if (!expression) return null;
    const res = evaluateExpression(expression, isRadian);
    return res.success && res.result !== null ? res.result : null;
  };

  const handleEquals = () => {
    if (!expression.trim()) return;

    // 1. CHECK SECRET VAULT DUAL-PIN TRIGGER!
    const realPin = getRealVaultPin();
    const decoyPin = getDecoyVaultPin();
    const triggerType = checkSecretVaultTrigger(expression, realPin, decoyPin);

    if (triggerType === 'real') {
      playFeedback('unlock');
      setVaultHint('🔓 Secret Vault Unlocked (Real)!');
      setExpression('');
      setTimeout(() => {
        setVaultHint(null);
        onOpenVault(false);
      }, 500);
      return;
    } else if (triggerType === 'decoy') {
      playFeedback('unlock');
      setVaultHint('🔓 Vault Unlocked (Decoy)!');
      setExpression('');
      setTimeout(() => {
        setVaultHint(null);
        onOpenVault(true);
      }, 500);
      return;
    }

    // 2. REGULAR MATHEMATICAL CALCULATION
    const res = evaluateExpression(expression, isRadian);
    if (res.success && res.result !== null) {
      playFeedback('equals');
      const formatted = formatResult(res.result);
      const newEntry: HistoryEntry = {
        id: 'hist_' + Date.now(),
        expression,
        result: formatted,
        timestamp: Date.now(),
      };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
      setExpression(formatted.replace(/,/g, ''));
      setPreview('');
    } else {
      playFeedback('error');
      setPreview('Invalid Expression');
      setTimeout(() => {
        setPreview('');
      }, 1500);
    }
  };

  const handleClearHistory = () => {
    playFeedback('clear');
    setHistory([]);
    saveHistory([]);
  };

  const handleCopyHistory = (text: string, id: string) => {
    playFeedback('click');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Convert current expression or preview to words
  const numericForWords = (() => {
    if (!expression) return null;
    const parsed = parseFloat(expression.replace(/,/g, ''));
    if (!isNaN(parsed) && Number.isFinite(parsed)) return parsed;
    if (preview) {
      const match = preview.match(/=\s*([0-9.,]+)/);
      if (match) {
        const p = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(p)) return p;
      }
    }
    return null;
  })();

  const wordsEnglish = numericForWords !== null ? numberToEnglishWords(numericForWords) : '';
  const wordsUrdu = numericForWords !== null ? numberToUrduWords(numericForWords) : '';
  const wordsRoman = numericForWords !== null ? numberToRomanUrduWords(numericForWords) : '';

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-3 py-2 overflow-y-auto">
      {/* Vault Trigger Alert / Success Banner */}
      {vaultHint && (
        <div className="mb-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-center font-bold text-sm animate-bounce flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          <span>{vaultHint}</span>
        </div>
      )}

      {/* Calculator Screen / Display Card */}
      <div
        className={`w-full rounded-2xl p-3.5 flex flex-col justify-between border shadow-inner transition-all mb-2 ${theme.cardBg} ${theme.cardBorder}`}
        style={{ minHeight: '148px' }}
      >
        {/* Top Display Controls (RAD/DEG, Memory, History, Mini-Calc, Scientific Toggle) */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playFeedback('click');
                setIsRadian(!isRadian);
              }}
              aria-label={`Toggle Angle Unit. Current: ${isRadian ? 'Radians' : 'Degrees'}`}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wider transition-colors ${
                isRadian
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isRadian ? 'RAD' : 'DEG'}
            </button>

            {/* Memory Active Indicator */}
            {memory !== 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                M
              </span>
            )}

            {/* Secret Vault hint badge */}
            <span
              onClick={() => {
                playFeedback('click');
                setVaultHint(`💡 Type PIN (default 1234 or Decoy 0000) & press =`);
                setTimeout(() => setVaultHint(null), 3500);
              }}
              className="text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer flex items-center gap-1 opacity-70"
              title="Click for Vault trigger hint"
            >
              <Lock className="w-2.5 h-2.5" /> PIN Trigger
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Floating Mini-Calc Toggle */}
            <button
              onClick={() => {
                playFeedback('click');
                onToggleMiniCalc();
              }}
              aria-label="Toggle Floating Mini Calculator"
              title="Floating Widget Mode"
              className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isMiniCalcOpen
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-white/5 ' + theme.textSecondary + ' ' + theme.cardBorder
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Scientific Toggle */}
            <button
              onClick={() => {
                playFeedback('click');
                setIsScientific(!isScientific);
              }}
              aria-label="Toggle Scientific Keys"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                isScientific
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-white/5 ' + theme.textSecondary + ' ' + theme.cardBorder
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>{isScientific ? 'Std' : 'Sci'}</span>
            </button>

            {/* History Drawer Button */}
            <button
              onClick={() => {
                playFeedback('click');
                setIsHistoryOpen(true);
              }}
              aria-label="Open Calculation History"
              title="History"
              className={`p-1.5 rounded-lg border relative transition-colors ${theme.actionBtnBg}`}
            >
              <History className="w-3.5 h-3.5" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>

        {/* Live Calculation Preview */}
        <div className="h-5 flex items-center justify-end text-xs font-mono tracking-wide text-emerald-400 font-medium overflow-hidden">
          {preview ? (
            <span className="opacity-90 animate-fadeIn">{preview}</span>
          ) : (
            <span className="text-transparent select-none">-</span>
          )}
        </div>

        {/* Main Number Expression Input */}
        <div className="overflow-x-auto whitespace-nowrap text-right py-0.5 scrollbar-none">
          <span
            className={`font-mono font-bold tracking-tight select-text ${
              expression.length > 14
                ? 'text-2xl'
                : expression.length > 9
                ? 'text-3xl'
                : 'text-4xl'
            } ${theme.textPrimary}`}
          >
            {expression || '0'}
          </span>
          <div ref={displayEndRef} />
        </div>

        {/* Number to Words Live Bar (English & Urdu for cheques/banking) */}
        {numericForWords !== null && (
          <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] gap-2">
            <div className="flex items-center gap-1 truncate text-zinc-400">
              <span className="font-semibold text-emerald-400 shrink-0">In Words:</span>
              <span className="truncate italic">
                {wordLang === 'en' && wordsEnglish}
                {wordLang === 'ur' && wordsUrdu}
                {wordLang === 'roman' && wordsRoman}
              </span>
            </div>

            <button
              onClick={() => {
                playFeedback('click');
                setWordLang((prev) => (prev === 'en' ? 'ur' : prev === 'ur' ? 'roman' : 'en'));
              }}
              className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-zinc-700 bg-white/5 hover:bg-emerald-500/20 text-emerald-300 shrink-0"
              title="Switch Words Language (EN / UR / Roman)"
            >
              {wordLang.toUpperCase()}
            </button>
          </div>
        )}
      </div>

      {/* Memory & Quick Action Row (MC, MR, M+, M-) */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <button
          onClick={handleMemoryClear}
          aria-label="Memory Clear"
          className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95 ${
            memory !== 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-white/5 border-zinc-800 text-zinc-500'
          }`}
        >
          MC
        </button>
        <button
          onClick={handleMemoryRecall}
          aria-label="Memory Recall"
          className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95 ${
            memory !== 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/5 border-zinc-800 text-zinc-500'
          }`}
        >
          MR {memory !== 0 ? `(${memory})` : ''}
        </button>
        <button
          onClick={handleMemoryAdd}
          aria-label="Memory Add"
          className="py-1.5 px-2 rounded-xl text-xs font-mono font-bold border bg-white/5 border-zinc-800 text-zinc-300 hover:text-emerald-400 active:scale-95"
        >
          M+
        </button>
        <button
          onClick={handleMemorySubtract}
          aria-label="Memory Subtract"
          className="py-1.5 px-2 rounded-xl text-xs font-mono font-bold border bg-white/5 border-zinc-800 text-zinc-300 hover:text-rose-400 active:scale-95"
        >
          M-
        </button>
      </div>

      {/* Scientific Keys Grid (Collapsible/Togglable) */}
      {isScientific && (
        <div className="grid grid-cols-5 gap-1.5 mb-2 animate-fadeIn">
          {[
            { label: 'sin', action: () => handleScientificFunction('sin') },
            { label: 'cos', action: () => handleScientificFunction('cos') },
            { label: 'tan', action: () => handleScientificFunction('tan') },
            { label: 'log', action: () => handleScientificFunction('log') },
            { label: 'ln', action: () => handleScientificFunction('ln') },
            { label: '√', action: () => handleScientificFunction('sqrt') },
            { label: '^', action: () => handleOperator('^') },
            { label: 'π', action: () => handleInput('π') },
            { label: 'e', action: () => handleInput('e') },
            { label: 'n!', action: () => handleScientificFunction('fact') },
            { label: '(', action: () => handleInput('(') },
            { label: ')', action: () => handleInput(')') },
            { label: '%', action: () => handleInput('%') },
            { label: '1/x', action: () => handleScientificFunction('1/') },
            {
              label: isRadian ? 'RAD' : 'DEG',
              action: () => setIsRadian(!isRadian),
              special: true,
            },
          ].map((key, i) => (
            <button
              key={i}
              onClick={key.action}
              className={`py-2 px-1 rounded-xl text-xs font-mono font-semibold transition-all active:scale-95 border ${
                key.special
                  ? 'bg-purple-950/40 text-purple-300 border-purple-800/40 hover:bg-purple-900/50'
                  : 'bg-zinc-850/70 text-zinc-300 border-zinc-700/40 hover:bg-zinc-750'
              }`}
            >
              {key.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Standard Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 mb-1.5">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          aria-label="Clear All"
          className="h-13 rounded-2xl font-bold text-base bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/30 transition-all active:scale-95 shadow-xs"
        >
          AC
        </button>
        <button
          onClick={() => handleInput('(')}
          aria-label="Open bracket"
          className={`h-13 rounded-2xl font-bold text-base transition-all active:scale-95 border shadow-xs ${theme.actionBtnBg}`}
        >
          (
        </button>
        <button
          onClick={() => handleInput(')')}
          aria-label="Close bracket"
          className={`h-13 rounded-2xl font-bold text-base transition-all active:scale-95 border shadow-xs ${theme.actionBtnBg}`}
        >
          )
        </button>
        <button
          onClick={() => handleOperator('÷')}
          aria-label="Divide"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.opBtnBg}`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleInput('7')}
          aria-label="7"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          7
        </button>
        <button
          onClick={() => handleInput('8')}
          aria-label="8"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          8
        </button>
        <button
          onClick={() => handleInput('9')}
          aria-label="9"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          9
        </button>
        <button
          onClick={() => handleOperator('×')}
          aria-label="Multiply"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.opBtnBg}`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleInput('4')}
          aria-label="4"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          4
        </button>
        <button
          onClick={() => handleInput('5')}
          aria-label="5"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          5
        </button>
        <button
          onClick={() => handleInput('6')}
          aria-label="6"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          6
        </button>
        <button
          onClick={() => handleOperator('−')}
          aria-label="Subtract"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.opBtnBg}`}
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleInput('1')}
          aria-label="1"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          1
        </button>
        <button
          onClick={() => handleInput('2')}
          aria-label="2"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          2
        </button>
        <button
          onClick={() => handleInput('3')}
          aria-label="3"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          aria-label="Add"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.opBtnBg}`}
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={handleBackspace}
          aria-label="Backspace"
          className={`h-13 rounded-2xl font-bold text-lg flex items-center justify-center transition-all active:scale-95 border shadow-xs ${theme.actionBtnBg}`}
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleInput('0')}
          aria-label="0"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          0
        </button>
        <button
          onClick={() => handleInput('.')}
          aria-label="Decimal dot"
          className={`h-13 rounded-2xl font-bold text-xl transition-all active:scale-95 border shadow-xs ${theme.numBtnBg}`}
        >
          .
        </button>
        <button
          onClick={handleEquals}
          aria-label="Calculate Equals or Unlock Vault"
          className={`h-13 rounded-2xl font-black text-2xl transition-all active:scale-95 border ${theme.equalsBtnBg}`}
        >
          =
        </button>
      </div>

      {/* History Drawer Modal with Copy/Reuse */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-2">
          <div
            className={`w-full max-w-md rounded-3xl p-5 border shadow-2xl flex flex-col max-h-[80vh] ${theme.cardBg} ${theme.cardBorder}`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                <h3 className={`font-bold text-base ${theme.textPrimary}`}>Calculation History</h3>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    aria-label="Clear All History"
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  aria-label="Close History"
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${theme.actionBtnBg}`}
                >
                  Done
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No calculations yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Calculations will appear here automatically</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-zinc-800/80 hover:border-emerald-500/50 bg-white/5 flex items-center justify-between"
                  >
                    <div
                      className="cursor-pointer flex-1 mr-2"
                      onClick={() => {
                        playFeedback('click');
                        setExpression(item.result.replace(/,/g, ''));
                        setIsHistoryOpen(false);
                      }}
                    >
                      <div className="text-xs font-mono text-zinc-400">{item.expression}</div>
                      <div className="text-lg font-mono font-bold text-emerald-400">= {item.result}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyHistory(item.result, item.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300"
                        title="Copy result"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          playFeedback('click');
                          setExpression(item.result.replace(/,/g, ''));
                          setIsHistoryOpen(false);
                        }}
                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold"
                        title="Reuse in calculator"
                      >
                        Reuse
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
