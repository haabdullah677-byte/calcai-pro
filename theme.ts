export type ThemeType = 'dark' | 'light' | 'royal' | 'gold' | 'cyberpunk';

export interface ThemeColors {
  id: ThemeType;
  name: string;
  badge: string;
  previewColor: string;
  bgClass: string;
  appShellClass: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  numBtnBg: string;
  numBtnText: string;
  numBtnHover: string;
  numBtnActive: string;
  opBtnBg: string;
  opBtnText: string;
  opBtnHover: string;
  actionBtnBg: string;
  actionBtnText: string;
  actionBtnHover: string;
  equalsBtnBg: string;
  equalsBtnText: string;
  accentColor: string;
  navBg: string;
  navActive: string;
  bannerBg: string;
}

export const THEMES: Record<ThemeType, ThemeColors> = {
  dark: {
    id: 'dark',
    name: 'Emerald Dark',
    badge: 'AMOLED Default',
    previewColor: '#10b981',
    bgClass: 'bg-black text-white',
    appShellClass: 'bg-black border-zinc-800/80',
    cardBg: 'bg-zinc-900/90',
    cardBorder: 'border-zinc-800',
    textPrimary: 'text-zinc-50',
    textSecondary: 'text-zinc-300',
    textMuted: 'text-zinc-500',
    numBtnBg: 'bg-zinc-900 text-zinc-100 hover:bg-zinc-850 active:bg-zinc-800 border-zinc-800/60',
    numBtnText: 'text-zinc-100',
    numBtnHover: 'hover:bg-zinc-800',
    numBtnActive: 'active:bg-zinc-750',
    opBtnBg: 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 active:bg-emerald-900/70 border-emerald-900/40',
    opBtnText: 'text-emerald-400',
    opBtnHover: 'hover:bg-emerald-900/40',
    actionBtnBg: 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 active:bg-zinc-650 border-zinc-700/60',
    actionBtnText: 'text-zinc-300',
    actionBtnHover: 'hover:bg-zinc-700',
    equalsBtnBg: 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-bold shadow-lg shadow-emerald-500/25',
    equalsBtnText: 'text-black font-bold',
    accentColor: '#10b981',
    navBg: 'bg-zinc-950/95 border-zinc-800/90 backdrop-blur-md',
    navActive: 'text-emerald-400 bg-emerald-500/10',
    bannerBg: 'bg-zinc-900/90 border-zinc-800',
  },
  light: {
    id: 'light',
    name: 'Clean MX Light',
    badge: 'Crisp Minimalist',
    previewColor: '#3b82f6',
    bgClass: 'bg-slate-100 text-slate-900',
    appShellClass: 'bg-slate-50 border-slate-200/90',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    numBtnBg: 'bg-white text-slate-900 hover:bg-slate-100 active:bg-slate-200 border-slate-200/80 shadow-xs',
    numBtnText: 'text-slate-900',
    numBtnHover: 'hover:bg-slate-100',
    numBtnActive: 'active:bg-slate-200',
    opBtnBg: 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 border-blue-200/60',
    opBtnText: 'text-blue-600',
    opBtnHover: 'hover:bg-blue-100',
    actionBtnBg: 'bg-slate-200/80 text-slate-700 hover:bg-slate-300 active:bg-slate-350 border-slate-300/60',
    actionBtnText: 'text-slate-700',
    actionBtnHover: 'hover:bg-slate-300',
    equalsBtnBg: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25',
    equalsBtnText: 'text-white font-bold',
    accentColor: '#3b82f6',
    navBg: 'bg-white/95 border-slate-200 backdrop-blur-md',
    navActive: 'text-blue-600 bg-blue-500/10',
    bannerBg: 'bg-slate-100/90 border-slate-200',
  },
  royal: {
    id: 'royal',
    name: 'Royal Blue',
    badge: 'Executive Sapphire',
    previewColor: '#38bdf8',
    bgClass: 'bg-[#070e1e] text-slate-100',
    appShellClass: 'bg-[#0b1428] border-blue-900/60',
    cardBg: 'bg-[#101c38]/90',
    cardBorder: 'border-blue-900/50',
    textPrimary: 'text-blue-50',
    textSecondary: 'text-blue-200',
    textMuted: 'text-blue-400/60',
    numBtnBg: 'bg-[#132244] text-blue-50 hover:bg-[#1a2d59] active:bg-[#20366b] border-blue-900/50',
    numBtnText: 'text-blue-50',
    numBtnHover: 'hover:bg-[#1a2d59]',
    numBtnActive: 'active:bg-[#20366b]',
    opBtnBg: 'bg-sky-950/60 text-sky-400 hover:bg-sky-900/70 active:bg-sky-850/80 border-sky-800/40',
    opBtnText: 'text-sky-400',
    opBtnHover: 'hover:bg-sky-900/60',
    actionBtnBg: 'bg-blue-950/70 text-blue-300 hover:bg-blue-900 active:bg-blue-800 border-blue-800/40',
    actionBtnText: 'text-blue-300',
    actionBtnHover: 'hover:bg-blue-900',
    equalsBtnBg: 'bg-sky-400 hover:bg-sky-300 active:bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-400/25',
    equalsBtnText: 'text-slate-950 font-bold',
    accentColor: '#38bdf8',
    navBg: 'bg-[#091224]/95 border-blue-950 backdrop-blur-md',
    navActive: 'text-sky-400 bg-sky-500/15',
    bannerBg: 'bg-[#101c38]/90 border-blue-900/40',
  },
  gold: {
    id: 'gold',
    name: 'Luxury Gold',
    badge: 'Obsidian Prestige',
    previewColor: '#eab308',
    bgClass: 'bg-[#0c0a07] text-amber-50',
    appShellClass: 'bg-[#14100b] border-amber-950/60',
    cardBg: 'bg-[#1c1710]/95',
    cardBorder: 'border-amber-900/40',
    textPrimary: 'text-amber-100',
    textSecondary: 'text-amber-200/80',
    textMuted: 'text-amber-600/70',
    numBtnBg: 'bg-[#221c13] text-amber-100 hover:bg-[#2c2419] active:bg-[#362d1f] border-amber-900/40',
    numBtnText: 'text-amber-100',
    numBtnHover: 'hover:bg-[#2c2419]',
    numBtnActive: 'active:bg-[#362d1f]',
    opBtnBg: 'bg-amber-950/60 text-amber-400 hover:bg-amber-900/70 active:bg-amber-850/80 border-amber-800/40',
    opBtnText: 'text-amber-400',
    opBtnHover: 'hover:bg-amber-900/60',
    actionBtnBg: 'bg-stone-900 text-amber-200/80 hover:bg-stone-850 active:bg-stone-800 border-amber-950/50',
    actionBtnText: 'text-amber-200/80',
    actionBtnHover: 'hover:bg-stone-850',
    equalsBtnBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:from-amber-500 active:to-yellow-600 text-black font-bold shadow-lg shadow-amber-500/25',
    equalsBtnText: 'text-black font-bold',
    accentColor: '#eab308',
    navBg: 'bg-[#110e09]/95 border-amber-950 backdrop-blur-md',
    navActive: 'text-amber-400 bg-amber-500/15',
    bannerBg: 'bg-[#1a150e]/95 border-amber-900/30',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Purple',
    badge: 'Neon Synthwave',
    previewColor: '#d946ef',
    bgClass: 'bg-[#0f071a] text-fuchsia-50',
    appShellClass: 'bg-[#150a24] border-fuchsia-900/60',
    cardBg: 'bg-[#1f1035]/95',
    cardBorder: 'border-fuchsia-900/50',
    textPrimary: 'text-fuchsia-50',
    textSecondary: 'text-fuchsia-200',
    textMuted: 'text-fuchsia-400/60',
    numBtnBg: 'bg-[#261440] text-fuchsia-100 hover:bg-[#321a54] active:bg-[#3e2168] border-fuchsia-900/50',
    numBtnText: 'text-fuchsia-100',
    numBtnHover: 'hover:bg-[#321a54]',
    numBtnActive: 'active:bg-[#3e2168]',
    opBtnBg: 'bg-fuchsia-950/70 text-fuchsia-400 hover:bg-fuchsia-900/80 active:bg-fuchsia-850 border-fuchsia-800/50',
    opBtnText: 'text-fuchsia-400',
    opBtnHover: 'hover:bg-fuchsia-900/70',
    actionBtnBg: 'bg-purple-950/80 text-fuchsia-300 hover:bg-purple-900 active:bg-purple-800 border-purple-800/50',
    actionBtnText: 'text-fuchsia-300',
    actionBtnHover: 'hover:bg-purple-900',
    equalsBtnBg: 'bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-black font-black shadow-lg shadow-fuchsia-500/30',
    equalsBtnText: 'text-black font-bold',
    accentColor: '#d946ef',
    navBg: 'bg-[#12071f]/95 border-fuchsia-950 backdrop-blur-md',
    navActive: 'text-fuchsia-400 bg-fuchsia-500/15',
    bannerBg: 'bg-[#1c0e30]/95 border-fuchsia-900/40',
  },
};
