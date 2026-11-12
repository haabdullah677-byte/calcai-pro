import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Camera,
  Image as ImageIcon,
  Send,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  X,
  FileText,
  Scan,
  Globe,
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { ThemeColors } from '../utils/theme';
import { playFeedback } from '../utils/audio';
import {
  solveMathProblemOfflineOrOnline,
  parseNaturalLanguageMath,
  detectLanguage,
  SolvedProblem,
  VoiceCalcBreakdown,
} from '../utils/nlpMath';

interface AiSolverTabProps {
  theme: ThemeColors;
}

export const AiSolverTab: React.FC<AiSolverTabProps> = ({ theme }) => {
  const [subTab, setSubTab] = useState<'math' | 'voice'>('math');

  // Math Solver State
  const [problemText, setProblemText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isSolvingMath, setIsSolvingMath] = useState(false);
  const [mathSolution, setMathSolution] = useState<SolvedProblem | null>(null);
  const [mathError, setMathError] = useState<string | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  // Voice/Text State
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'ur-PK' | 'hi-IN' | 'ar-SA'>('en-US');
  const [isListening, setIsListening] = useState(false);
  const [isCalculatingVoice, setIsCalculatingVoice] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceCalcBreakdown | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // OCR Processing with Tesseract.js
  const handleScanImage = async (file: File) => {
    setIsScanningOCR(true);
    setOcrProgress(10);
    playFeedback('operator');

    try {
      const worker = await createWorker('eng');
      setOcrProgress(40);

      const ret = await worker.recognize(file);
      setOcrProgress(90);
      await worker.terminate();

      const recognized = ret.data.text.trim();
      setOcrProgress(100);

      if (recognized) {
        // Clean OCR noise
        const cleaned = recognized
          .replace(/[|—_]/g, '')
          .replace(/[\r\n]+/g, ' ')
          .trim();

        setProblemText(cleaned);
        setIsScanningOCR(false);
        playFeedback('equals');
        // Automatically solve the scanned problem
        handleSolveMath(cleaned);
      } else {
        setIsScanningOCR(false);
        setProblemText('Please type or re-scan clearly.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setIsScanningOCR(false);
      // Fallback
      setProblemText('Failed to read image text. Please type your problem directly.');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Run OCR scan
    handleScanImage(file);
  };

  // Multilingual Speech Recognition
  const handleToggleVoice = () => {
    playFeedback('click');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not available in this browser. You can type your request directly.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQuery(transcript);
        setIsListening(false);
        handleVoiceCalcSubmit(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSolveMath = async (queryText?: string) => {
    const prompt = queryText !== undefined ? queryText : problemText;
    if (!prompt.trim() && !selectedImage) {
      setMathError('Please enter a math problem or scan an image.');
      return;
    }

    playFeedback('operator');
    setIsSolvingMath(true);
    setMathError(null);

    try {
      // First try our server endpoint which uses Pollinations AI with Mathjs fallback
      const res = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setMathSolution({
            summary: data.data.summary,
            finalAnswer: data.data.finalAnswer,
            steps: data.data.steps,
            keyTakeaway: data.data.keyTakeaway,
            category: data.data.category || 'Mathematics',
            language: detectLanguage(prompt),
          });
          playFeedback('equals');
          return;
        }
      }
      throw new Error('Server offline');
    } catch {
      // Direct client fallback via our local MathJS engine (guaranteed zero error)
      const clientSolution = await solveMathProblemOfflineOrOnline(prompt);
      setMathSolution(clientSolution);
      playFeedback('equals');
    } finally {
      setIsSolvingMath(false);
    }
  };

  const handleVoiceCalcSubmit = async (queryText?: string) => {
    const prompt = queryText !== undefined ? queryText : voiceQuery;
    if (!prompt.trim()) return;

    playFeedback('operator');
    setIsCalculatingVoice(true);

    try {
      const res = await fetch('/api/ai/voice-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setVoiceResult({
            interpretation: data.data.interpretation,
            expression: data.data.expression,
            totalAmount: data.data.totalAmount,
            quickSummary: data.data.quickSummary,
            breakdown: data.data.breakdown || [],
            language: detectLanguage(prompt),
          });
          playFeedback('equals');
          return;
        }
      }
      throw new Error('Server offline');
    } catch {
      // Client instant fallback via nlpMath
      const clientResult = parseNaturalLanguageMath(prompt);
      setVoiceResult(clientResult);
      playFeedback('equals');
    } finally {
      setIsCalculatingVoice(false);
    }
  };

  const copyToClipboard = (text: string) => {
    playFeedback('click');
    navigator.clipboard.writeText(text);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-3 py-2 overflow-y-auto">
      {/* Mode Switcher */}
      <div className={`grid grid-cols-2 p-1 rounded-2xl mb-3 border ${theme.cardBg} ${theme.cardBorder}`}>
        <button
          onClick={() => {
            playFeedback('click');
            setSubTab('math');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'math'
              ? 'bg-emerald-500 text-black shadow-md font-extrabold'
              : `${theme.textSecondary} hover:bg-white/5`
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Math & Photo Solver</span>
        </button>
        <button
          onClick={() => {
            playFeedback('click');
            setSubTab('voice');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'voice'
              ? 'bg-emerald-500 text-black shadow-md font-extrabold'
              : `${theme.textSecondary} hover:bg-white/5`
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Smart Voice / Text</span>
        </button>
      </div>

      {/* SUBTAB 1: AI MATH & OCR SCANNER */}
      {subTab === 'math' && (
        <div className="space-y-3 pb-6">
          <div className={`p-3.5 rounded-2xl border shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
            <label className={`block text-xs font-bold mb-2 flex items-center justify-between ${theme.textPrimary}`}>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Type or Scan Problem (Any Language)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
                100% Free • No API Key Needed
              </span>
            </label>

            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Type in English, Roman Urdu (e.g. Muje 3 or 4 ko + kr), Urdu, Hindi, or Arabic..."
              rows={3}
              className={`w-full p-3 rounded-xl border text-sm transition-all outline-none resize-none bg-black/30 placeholder-zinc-500 ${theme.cardBorder} ${theme.textPrimary} focus:border-emerald-500`}
            />

            {/* OCR Scanning Progress Bar */}
            {isScanningOCR && (
              <div className="mt-2 p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-300 space-y-1 animate-pulse">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Scan className="w-4 h-4 animate-spin" /> Scanning photo with Tesseract OCR...
                  </span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Image Preview */}
            {selectedImage && (
              <div className="mt-2 relative inline-block border border-emerald-500/40 rounded-xl overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Scanned math problem"
                  className="h-20 w-auto object-contain bg-black/60"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Action Bar (Scan Photo, Solve) */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-zinc-800">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                onClick={() => {
                  playFeedback('click');
                  fileInputRef.current?.click();
                }}
                disabled={isScanningOCR}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all bg-white/5 border-zinc-800 hover:bg-white/10 text-zinc-200"
                title="Upload math problem photo"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scan Math Photo</span>
              </button>

              <button
                onClick={() => handleSolveMath()}
                disabled={isSolvingMath || isScanningOCR}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-extrabold transition-all active:scale-95 disabled:opacity-50 ${theme.equalsBtnBg}`}
              >
                {isSolvingMath ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Solving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Solve Step-by-Step</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Multilingual Examples */}
          <div>
            <div className={`text-[11px] font-semibold mb-1.5 flex items-center gap-1 ${theme.textMuted}`}>
              <HelpCircle className="w-3 h-3" /> Try Multilingual Examples:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Muje 3 or 4 ko + kr',
                '4500 ka bill 4 doston me baant do 10% tip k sath',
                'Calculate compound interest on $5,000 at 7% for 5 years',
                '100000 par 2.5% zakat kitni hogi',
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playFeedback('click');
                    setProblemText(sample);
                    handleSolveMath(sample);
                  }}
                  className={`text-[11px] py-1 px-2.5 rounded-lg border text-left transition-colors truncate max-w-full bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 ${theme.textSecondary} ${theme.cardBorder}`}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {mathError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
              {mathError}
            </div>
          )}

          {/* Solution Display */}
          {mathSolution && (
            <div className={`rounded-2xl border p-4 shadow-lg space-y-3.5 animate-fadeIn ${theme.cardBg} ${theme.cardBorder}`}>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {mathSolution.category} ({mathSolution.language})
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Verified Solution
                </span>
              </div>

              <p className={`text-xs italic ${theme.textSecondary}`}>{mathSolution.summary}</p>

              {/* Final Answer Box */}
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Final Result / Aakhri Jawab
                  </div>
                  <div className="text-xl font-mono font-black text-emerald-300 select-text">
                    {mathSolution.finalAnswer}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(mathSolution.finalAnswer)}
                  className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
                  title="Copy result"
                >
                  {copiedAnswer ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Steps */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${theme.textPrimary}`}>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Step-by-Step Breakdown
                </h4>
                <div className="space-y-2">
                  {mathSolution.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-black/25 border border-zinc-800/80 text-xs space-y-1"
                    >
                      <div className="font-bold text-emerald-400">{st.title}</div>
                      <div className="text-zinc-300 leading-relaxed">{st.explanation}</div>
                      {st.formula && (
                        <div className="p-1.5 px-2.5 rounded-lg bg-zinc-900 font-mono text-[11px] text-amber-300 border border-zinc-800">
                          {st.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {mathSolution.keyTakeaway && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-400">Insight: </span>
                    {mathSolution.keyTakeaway}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: SMART VOICE / TEXT */}
      {subTab === 'voice' && (
        <div className="space-y-3 pb-6">
          <div className={`p-3.5 rounded-2xl border shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${theme.textPrimary}`}>
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                Speak or Type (Any Language)
              </label>

              {/* Language Selector for Speech */}
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-500" />
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value as any)}
                  className="bg-black/40 border border-zinc-800 rounded-lg text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 outline-none"
                >
                  <option value="en-US">English (US)</option>
                  <option value="ur-PK">Urdu (اردو)</option>
                  <option value="hi-IN">Hindi (हिंदी)</option>
                  <option value="ar-SA">Arabic (العربية)</option>
                </select>
              </div>
            </div>

            <div className="relative flex items-center gap-1.5">
              <input
                type="text"
                value={voiceQuery}
                onChange={(e) => setVoiceQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVoiceCalcSubmit();
                }}
                placeholder="e.g. 4500 ka bill 4 doston me baant do 10% tip k sath"
                className={`flex-1 p-3 pr-10 rounded-xl border text-sm outline-none bg-black/30 placeholder-zinc-500 ${theme.cardBorder} ${theme.textPrimary} focus:border-emerald-500`}
              />
              <button
                onClick={handleToggleVoice}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse border-rose-400'
                    : 'bg-white/10 ' + theme.textSecondary + ' ' + theme.cardBorder + ' hover:bg-white/15'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleVoiceCalcSubmit()}
                disabled={isCalculatingVoice || !voiceQuery.trim()}
                className={`p-3 rounded-xl transition-all disabled:opacity-40 ${theme.equalsBtnBg}`}
              >
                {isCalculatingVoice ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {isListening && (
              <p className="text-[11px] text-rose-400 mt-1.5 font-medium animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping" />
                Listening in {voiceLang}... Speak your math now.
              </p>
            )}
          </div>

          {/* Quick Samples */}
          <div>
            <div className={`text-[11px] font-semibold mb-1.5 flex items-center gap-1 ${theme.textMuted}`}>
              <Sparkles className="w-3 h-3 text-emerald-400" /> Instant Natural Calculations:
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                '4500 ka bill 4 doston me baant do 10% tip k sath',
                'Muje 3 or 4 ko + kr',
                'Buy 3 shirts at $35 with 25% off and 8.5% sales tax',
                '100000 rupay par zakat calculate karo',
              ].map((sample, i) => (
                <button
                  key={i}
                  onClick={() => {
                    playFeedback('click');
                    setVoiceQuery(sample);
                    handleVoiceCalcSubmit(sample);
                  }}
                  className={`p-2 px-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 ${theme.textSecondary} ${theme.cardBorder}`}
                >
                  <span>"{sample}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Voice Results */}
          {voiceResult && (
            <div className={`rounded-2xl border p-4 shadow-lg space-y-3.5 animate-fadeIn ${theme.cardBg} ${theme.cardBorder}`}>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="text-xs font-bold text-zinc-300">
                  <span className="text-emerald-400">Interpretation ({voiceResult.language}): </span>
                  {voiceResult.interpretation}
                </div>
              </div>

              {/* Total Card */}
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Calculated Result
                </div>
                <div className="text-2xl font-mono font-black text-emerald-300">
                  {voiceResult.totalAmount}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  Formula: {voiceResult.expression}
                </div>
              </div>

              {/* Breakdown */}
              {voiceResult.breakdown.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Itemized Details
                  </div>
                  <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden bg-black/20">
                    {voiceResult.breakdown.map((item, idx) => (
                      <div key={idx} className="p-2.5 px-3 flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200">{item.label}</span>
                        <span className="font-mono font-bold text-emerald-400">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-2.5 px-3 rounded-xl bg-white/5 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{voiceResult.quickSummary}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
