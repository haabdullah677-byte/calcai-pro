import React, { useState } from 'react';
import { ExternalLink, X, Info } from 'lucide-react';
import { ThemeColors } from '../utils/theme';

interface AdBannerProps {
  theme: ThemeColors;
}

export const AdBanner: React.FC<AdBannerProps> = ({ theme }) => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <aside
      className={`w-full max-w-md mx-auto px-3 py-1.5 shrink-0 z-20 ${theme.bgClass}`}
      aria-label="Sponsored Content"
    >
      <div
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all shadow-xs ${theme.bannerBg} ${theme.cardBorder}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="shrink-0 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
            Ad
          </span>
          <div className="truncate">
            <span className={`font-semibold tracking-tight text-[11px] ${theme.textPrimary}`}>
              Apex Vault & High-Yield 5.2% APY
            </span>
            <span className={`hidden sm:inline text-[10px] ml-1.5 ${theme.textMuted}`}>
              • Automated Smart Wealth & Zero Fees
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer">
            Install <ExternalLink className="w-2.5 h-2.5" />
          </span>
          <button
            onClick={() => setClosed(true)}
            aria-label="Dismiss banner"
            title="Ad placeholder ready for AdMob/AdSense slot"
            className={`p-1 rounded hover:bg-white/10 ${theme.textMuted} transition-colors`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};
