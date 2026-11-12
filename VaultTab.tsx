import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Image as ImageIcon,
  Video,
  FileText,
  Palette,
  Volume2,
  Smartphone,
  Plus,
  Trash2,
  Download,
  Eye,
  X,
  KeyRound,
  Check,
  AlertCircle,
  Pin,
  Search,
  ShieldAlert,
  Play,
} from 'lucide-react';
import { ThemeColors, THEMES } from '../utils/theme';
import {
  ThemeType,
  getSoundEnabled,
  saveSoundEnabled,
  getVibrationEnabled,
  saveVibrationEnabled,
} from '../utils/storage';
import {
  getRealVaultPin,
  setRealVaultPin,
  getDecoyVaultPin,
  setDecoyVaultPin,
  checkVaultUnlockType,
  getVaultMedia,
  saveVaultMedia,
  getVaultNotes,
  saveVaultNotes,
  VaultMediaItem,
  VaultNoteItem,
} from '../utils/vaultStorage';
import { playFeedback } from '../utils/audio';

interface VaultTabProps {
  theme: ThemeColors;
  onThemeChange: (theme: ThemeType) => void;
  isUnlocked: boolean;
  setIsUnlocked: (unlocked: boolean) => void;
  isDecoyMode: boolean;
  setIsDecoyMode: (isDecoy: boolean) => void;
}

export const VaultTab: React.FC<VaultTabProps> = ({
  theme,
  onThemeChange,
  isUnlocked,
  setIsUnlocked,
  isDecoyMode,
  setIsDecoyMode,
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [vaultSubTab, setVaultSubTab] = useState<'media' | 'notes' | 'themes' | 'settings'>('media');

  // Media & Notes
  const [mediaItems, setMediaItems] = useState<VaultMediaItem[]>([]);
  const [viewingMedia, setViewingMedia] = useState<VaultMediaItem | null>(null);

  const [notes, setNotes] = useState<VaultNoteItem[]>([]);
  const [noteSearch, setNoteSearch] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentNote, setCurrentNote] = useState<{ id?: string; title: string; content: string; isPinned: boolean }>({
    title: '',
    content: '',
    isPinned: false,
  });

  // PIN settings
  const [targetPinType, setTargetPinType] = useState<'real' | 'decoy'>('real');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Audio/vibrate
  const [soundOn, setSoundOn] = useState(getSoundEnabled());
  const [vibrateOn, setVibrateOn] = useState(getVibrationEnabled());

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isUnlocked) {
      setMediaItems(getVaultMedia(isDecoyMode));
      setNotes(getVaultNotes(isDecoyMode));
    }
  }, [isUnlocked, isDecoyMode]);

  const handlePinKey = (digit: string) => {
    if (enteredPin.length >= 4) return;
    playFeedback('click');
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);

    if (nextPin.length === 4) {
      const unlockType = checkVaultUnlockType(nextPin);
      if (unlockType === 'real') {
        playFeedback('unlock');
        setIsDecoyMode(false);
        setIsUnlocked(true);
        setEnteredPin('');
      } else if (unlockType === 'decoy') {
        playFeedback('unlock');
        setIsDecoyMode(true);
        setIsUnlocked(true);
        setEnteredPin('');
      } else {
        playFeedback('error');
        setPinError(true);
        setTimeout(() => {
          setEnteredPin('');
          setPinError(false);
        }, 800);
      }
    }
  };

  const handlePinBackspace = () => {
    playFeedback('click');
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    playFeedback('clear');
    setEnteredPin('');
  };

  // Upload Media (Photos or Videos)
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');

    if (!isImg && !isVid) {
      alert('Please select an image or video file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newItem: VaultMediaItem = {
        id: 'media_' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: isVid ? 'video' : 'image',
        dataUrl: reader.result as string,
        dateAdded: Date.now(),
        sizeBytes: file.size,
      };

      try {
        const updated = [newItem, ...mediaItems];
        saveVaultMedia(updated, isDecoyMode);
        setMediaItems(updated);
        playFeedback('equals');
      } catch (err: any) {
        alert(err.message || 'Storage limit reached. Please remove older files.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteMedia = (id: string) => {
    if (!confirm('Permanently delete this secret media item?')) return;
    playFeedback('clear');
    const updated = mediaItems.filter((m) => m.id !== id);
    saveVaultMedia(updated, isDecoyMode);
    setMediaItems(updated);
    if (viewingMedia?.id === id) setViewingMedia(null);
  };

  // Notes
  const handleSaveNote = () => {
    if (!currentNote.title.trim() && !currentNote.content.trim()) return;
    playFeedback('equals');

    let updated: VaultNoteItem[] = [];
    if (currentNote.id) {
      updated = notes.map((n) =>
        n.id === currentNote.id
          ? {
              ...n,
              title: currentNote.title || 'Untitled',
              content: currentNote.content,
              isPinned: currentNote.isPinned,
              dateUpdated: Date.now(),
            }
          : n
      );
    } else {
      const newN: VaultNoteItem = {
        id: 'note_' + Date.now(),
        title: currentNote.title || 'Untitled Secret Note',
        content: currentNote.content,
        isPinned: currentNote.isPinned,
        dateUpdated: Date.now(),
      };
      updated = [newN, ...notes];
    }

    saveVaultNotes(updated, isDecoyMode);
    setNotes(updated);
    setIsEditingNote(false);
    setCurrentNote({ title: '', content: '', isPinned: false });
  };

  const handleDeleteNote = (id: string) => {
    if (!confirm('Permanently delete this note?')) return;
    playFeedback('clear');
    const updated = notes.filter((n) => n.id !== id);
    saveVaultNotes(updated, isDecoyMode);
    setNotes(updated);
  };

  // Change PIN submit
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStored = targetPinType === 'real' ? getRealVaultPin() : getDecoyVaultPin();

    if (oldPin !== currentStored) {
      setPinChangeMsg({ type: 'error', text: 'Current PIN is incorrect.' });
      playFeedback('error');
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinChangeMsg({ type: 'error', text: 'New PIN must be exactly 4 digits.' });
      playFeedback('error');
      return;
    }

    if (newPin !== confirmPin) {
      setPinChangeMsg({ type: 'error', text: 'New PIN confirmation does not match.' });
      playFeedback('error');
      return;
    }

    if (targetPinType === 'real') {
      setRealVaultPin(newPin);
    } else {
      setDecoyVaultPin(newPin);
    }

    playFeedback('unlock');
    setPinChangeMsg({
      type: 'success',
      text: `${targetPinType === 'real' ? 'Real PIN' : 'Decoy PIN'} successfully updated to ${newPin}`,
    });
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinChangeMsg(null), 3000);
  };

  const filteredNotes = notes
    .filter(
      (n) =>
        n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
        n.content.toLowerCase().includes(noteSearch.toLowerCase())
    )
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  // ==========================================
  // VIEW 1: LOCKED PIN ENTRY SCREEN
  // ==========================================
  if (!isUnlocked) {
    return (
      <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 py-3 overflow-y-auto select-none">
        <div className="text-center pt-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 shadow-lg shadow-emerald-500/10 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className={`text-xl font-black tracking-tight ${theme.textPrimary}`}>
            Secret Vault Locker
          </h2>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>
            Dual-PIN Protected: Real PIN (1234) • Decoy PIN (0000)
          </p>

          {/* PIN Indicators */}
          <div
            className={`flex items-center justify-center gap-3 my-5 transition-transform ${
              pinError ? 'animate-shake' : ''
            }`}
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    isFilled
                      ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-md shadow-emerald-400/40'
                      : pinError
                      ? 'border-rose-500 bg-rose-500/20'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <p className="text-xs text-rose-400 font-bold mb-2">Incorrect PIN. Try again.</p>
          )}

          <div className="inline-block px-3 py-1.5 rounded-full bg-white/5 border border-zinc-800 text-[11px] text-zinc-400">
            Real PIN: <strong className="text-emerald-400">1234</strong> • Decoy PIN: <strong className="text-amber-400">0000</strong>
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto w-full my-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handlePinKey(digit)}
              className={`h-14 rounded-2xl font-mono text-xl font-bold transition-all active:scale-90 border shadow-xs ${theme.numBtnBg}`}
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handlePinClear}
            className={`h-14 rounded-2xl text-xs font-bold transition-all active:scale-90 border shadow-xs ${theme.actionBtnBg}`}
          >
            CLEAR
          </button>
          <button
            onClick={() => handlePinKey('0')}
            className={`h-14 rounded-2xl font-mono text-xl font-bold transition-all active:scale-90 border shadow-xs ${theme.numBtnBg}`}
          >
            0
          </button>
          <button
            onClick={handlePinBackspace}
            aria-label="Backspace"
            className={`h-14 rounded-2xl text-xs font-bold transition-all active:scale-90 border shadow-xs flex items-center justify-center ${theme.actionBtnBg}`}
          >
            ⌫
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs pb-1">
          <button
            onClick={() => {
              playFeedback('unlock');
              setIsDecoyMode(false);
              setIsUnlocked(true);
            }}
            className="text-zinc-500 hover:text-emerald-400 underline underline-offset-2"
          >
            Unlock Real Vault (1234)
          </button>
          <span className="text-zinc-700">•</span>
          <button
            onClick={() => {
              playFeedback('unlock');
              setIsDecoyMode(true);
              setIsUnlocked(true);
            }}
            className="text-zinc-500 hover:text-amber-400 underline underline-offset-2"
          >
            Unlock Decoy Vault (0000)
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNLOCKED VAULT (REAL OR DECOY)
  // ==========================================
  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-3 py-2 overflow-y-auto">
      {/* Vault Status Bar */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between mb-3 shadow-xs ${theme.cardBg} ${theme.cardBorder}`}>
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDecoyMode ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <Unlock className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-bold leading-tight ${theme.textPrimary}`}>
              {isDecoyMode ? 'Decoy Vault (Safe Mode)' : 'Secret Vault Unlocked (Real)'}
            </div>
            <div className="text-[10px] text-zinc-400">
              {isDecoyMode ? 'Clean decoy data visible' : 'Confidential photos, videos & notes'}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            playFeedback('click');
            setIsUnlocked(false);
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all flex items-center gap-1 active:scale-95"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock</span>
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[
          { id: 'media', label: 'Media', icon: <ImageIcon className="w-4 h-4" /> },
          { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
          { id: 'themes', label: 'Themes', icon: <Palette className="w-4 h-4" /> },
          { id: 'settings', label: 'Security', icon: <KeyRound className="w-4 h-4" /> },
        ].map((sub) => {
          const isActive = vaultSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                playFeedback('click');
                setVaultSubTab(sub.id as any);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                isActive
                  ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-sm'
                  : `bg-white/5 ${theme.textSecondary} ${theme.cardBorder} hover:bg-white/10`
              }`}
            >
              {sub.icon}
              <span className="text-[10px]">{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. MEDIA (PHOTOS & VIDEOS) */}
      {vaultSubTab === 'media' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className={`text-xs font-bold ${theme.textPrimary}`}>
              Hidden Photos & Videos ({mediaItems.length})
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
            <button
              onClick={() => {
                playFeedback('click');
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Hide Media</span>
            </button>
          </div>

          {mediaItems.length === 0 ? (
            <div className={`p-8 rounded-2xl border text-center ${theme.cardBg} ${theme.cardBorder}`}>
              <ImageIcon className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
              <p className={`text-xs font-semibold ${theme.textSecondary}`}>No hidden media yet</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                Tap 'Hide Media' above to safely store personal pictures and private videos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 group bg-zinc-900 cursor-pointer shadow-xs"
                  onClick={() => setViewingMedia(item)}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/60">
                      <Play className="w-8 h-8 text-emerald-400" />
                    </div>
                  ) : (
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  {item.type === 'video' && (
                    <span className="absolute bottom-1 right-1 p-1 rounded bg-black/60 text-white text-[9px] font-bold">
                      VIDEO
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Lightbox / Video Player */}
          {viewingMedia && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3">
              <div className="max-w-md w-full flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between pb-2 text-white">
                  <span className="text-xs font-bold truncate pr-2">{viewingMedia.name}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={viewingMedia.dataUrl}
                      download={`${viewingMedia.name}.${viewingMedia.type === 'video' ? 'mp4' : 'png'}`}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteMedia(viewingMedia.id)}
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewingMedia(null)}
                      className="p-1.5 rounded-lg bg-white/10 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black border border-zinc-800">
                  {viewingMedia.type === 'video' ? (
                    <video src={viewingMedia.dataUrl} controls autoPlay className="max-h-[75vh] w-full" />
                  ) : (
                    <img
                      src={viewingMedia.dataUrl}
                      alt={viewingMedia.name}
                      className="max-h-[75vh] w-auto object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. NOTES */}
      {vaultSubTab === 'notes' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Search notes..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
              />
            </div>
            <button
              onClick={() => {
                playFeedback('click');
                setCurrentNote({ title: '', content: '', isPinned: false });
                setIsEditingNote(true);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all active:scale-95 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </div>

          {isEditingNote && (
            <div className={`p-4 rounded-2xl border space-y-3 shadow-md ${theme.cardBg} ${theme.cardBorder}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${theme.textPrimary}`}>
                  {currentNote.id ? 'Edit Secret Note' : 'Create Secret Note'}
                </span>
                <button
                  onClick={() =>
                    setCurrentNote({ ...currentNote, isPinned: !currentNote.isPinned })
                  }
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                    currentNote.isPinned
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'border-zinc-700 text-zinc-400'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{currentNote.isPinned ? 'Pinned' : 'Pin'}</span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Note Title"
                value={currentNote.title}
                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
              />

              <textarea
                placeholder="Write secret contents here..."
                rows={4}
                value={currentNote.content}
                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                className={`w-full p-2.5 rounded-xl border text-xs outline-none bg-black/25 resize-none ${theme.cardBorder} ${theme.textPrimary}`}
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${theme.actionBtnBg}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3.5 rounded-2xl border space-y-1 transition-all ${theme.cardBg} ${theme.cardBorder} hover:border-emerald-500/40`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    <h4 className={`text-xs font-bold ${theme.textPrimary}`}>{note.title}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        playFeedback('click');
                        setCurrentNote(note);
                        setIsEditingNote(true);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className={`text-[11px] leading-relaxed line-clamp-2 ${theme.textSecondary}`}>
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. THEME STUDIO (5 PRO THEMES) */}
      {vaultSubTab === 'themes' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          <div className={`p-4 rounded-2xl border space-y-3 ${theme.cardBg} ${theme.cardBorder}`}>
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary}`}>
                Pro Theme Studio
              </h3>
              <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>
                Choose from 5 ultra-sleek high contrast themes
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {Object.values(THEMES).map((th) => {
                const isCurrent = theme.id === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      playFeedback('click');
                      onThemeChange(th.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isCurrent
                        ? 'border-emerald-400 ring-2 ring-emerald-400/30 shadow-md scale-[1.02]'
                        : 'border-zinc-800 hover:border-zinc-700'
                    } ${th.id === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-zinc-900 text-white'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: th.previewColor }}
                      />
                      {isCurrent && (
                        <span className="p-0.5 rounded-full bg-emerald-500 text-black">
                          <Check className="w-3 h-3 font-bold" />
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs">{th.name}</div>
                    <div className="text-[9px] opacity-70">{th.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. DUAL-PIN SECURITY SETTINGS */}
      {vaultSubTab === 'settings' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          {/* Dual-PIN Switch */}
          <div className={`p-4 rounded-2xl border space-y-3 ${theme.cardBg} ${theme.cardBorder}`}>
            <h3 className={`text-xs font-bold flex items-center gap-1.5 ${theme.textPrimary}`}>
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Dual-PIN Security Manager
            </h3>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/30 border border-zinc-800">
              <button
                onClick={() => setTargetPinType('real')}
                className={`py-1.5 rounded-lg text-xs font-bold ${
                  targetPinType === 'real' ? 'bg-emerald-500 text-black font-extrabold' : 'text-zinc-400'
                }`}
              >
                Change Real PIN (1234)
              </button>
              <button
                onClick={() => setTargetPinType('decoy')}
                className={`py-1.5 rounded-lg text-xs font-bold ${
                  targetPinType === 'decoy' ? 'bg-amber-500 text-black font-extrabold' : 'text-zinc-400'
                }`}
              >
                Change Decoy PIN (0000)
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 text-zinc-400">Current PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Enter current PIN"
                  className={`w-full p-2.5 rounded-xl border font-mono text-center text-sm font-bold tracking-widest outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-zinc-400">New 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="New PIN"
                    className={`w-full p-2.5 rounded-xl border font-mono text-center text-sm font-bold tracking-widest outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-zinc-400">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Confirm PIN"
                    className={`w-full p-2.5 rounded-xl border font-mono text-center text-sm font-bold tracking-widest outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
              </div>

              {pinChangeMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold ${
                    pinChangeMsg.type === 'success'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {pinChangeMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400"
              >
                Update {targetPinType === 'real' ? 'Real PIN' : 'Decoy PIN'}
              </button>
            </form>
          </div>

          {/* Sound & Haptic Preferences */}
          <div className={`p-4 rounded-2xl border space-y-3 ${theme.cardBg} ${theme.cardBorder}`}>
            <h3 className={`text-xs font-bold ${theme.textPrimary}`}>Tactile & Sound</h3>

            <div className="flex items-center justify-between py-1 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className={`text-xs font-bold ${theme.textPrimary}`}>Button Sound</span>
              </div>
              <input
                type="checkbox"
                checked={soundOn}
                onChange={(e) => {
                  setSoundOn(e.target.checked);
                  saveSoundEnabled(e.target.checked);
                  if (e.target.checked) playFeedback('click');
                }}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className={`text-xs font-bold ${theme.textPrimary}`}>Haptic Vibration</span>
              </div>
              <input
                type="checkbox"
                checked={vibrateOn}
                onChange={(e) => {
                  setVibrateOn(e.target.checked);
                  saveVibrationEnabled(e.target.checked);
                  if (e.target.checked) playFeedback('click');
                }}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
