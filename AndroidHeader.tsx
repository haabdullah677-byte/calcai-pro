import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, VolumeX, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import { ThemeColors } from '../utils/theme';
import { getSoundEnabled, saveSoundEnabled, getVibrationEnabled, saveVibrationEnabled } from '../utils/storage';
import { playFeedback } from '../utils/audio';

interface AndroidHeaderProps {
  theme: ThemeColors;
  activeTab: string;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({ theme, activeTab }) => {
  const [timeStr, setTimeStr] = useState('');
  const [soundOn, setSoundOn] = useState(getSoundEnabled());
  const [vibrateOn, setVibrateOn] = useState(getVibrationEnabled());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    saveSoundEnabled(next);
    if (next) playFeedback('click');
  };

  const toggleVibrate = () => {
    const next = !vibrateOn;
    setVibrateOn(next);
    saveVibrationEnabled(next);
    playFeedback('click');
  };

  return (
    <header className="w-full shrink-0 select-none">
      {/* Android Top System Status Bar */}
      <div className={`px-4 pt-1.5 pb-1 flex items-center justify-between text-xs font-mono tracking-wider opacity-80 ${theme.textSecondary}`}>
        <span className="font-semibold text-[13px]">{timeStr || '12:00'}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-tight px-1 py-0.5 rounded bg-white/10">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold">98%</span>
            <Battery className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
      </div>

      {/* App Branding & Action Bar */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-b ${theme.cardBorder}`}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: theme.accentColor, color: theme.id === 'light' ? '#ffffff' : '#000000' }}
          >
            C<span className="text-xs">AI</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`text-base font-bold tracking-tight leading-tight ${theme.textPrimary}`}>
                CalcAI <span className="font-extrabold" style={{ color: theme.accentColor }}>PRO</span>
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                v2.5
              </span>
            </div>
            <p className={`text-[10px] tracking-wide ${theme.textMuted}`}>
              {activeTab === 'calc' && 'Smart Math & Secret Vault'}
              {activeTab === 'ai' && 'Gemini AI Math & Voice Engine'}
              {activeTab === 'tools' && 'Multi-Utility Everyday Calculators'}
              {activeTab === 'vault' && 'Privacy Locker & Customization'}
            </p>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
            title={soundOn ? 'Click Sound: On' : 'Click Sound: Off'}
            className={`p-2 rounded-lg transition-colors border ${
              soundOn ? 'bg-white/10 ' + theme.cardBorder : 'bg-transparent border-transparent opacity-50'
            }`}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className={`w-4 h-4 ${theme.textMuted}`} />
            )}
          </button>

          <button
            onClick={toggleVibrate}
            aria-label={vibrateOn ? 'Disable vibration' : 'Enable vibration'}
            title={vibrateOn ? 'Haptics: On' : 'Haptics: Off'}
            className={`p-2 rounded-lg transition-colors border ${
              vibrateOn ? 'bg-white/10 ' + theme.cardBorder : 'bg-transparent border-transparent opacity-50'
            }`}
          >
            <Smartphone className={`w-4 h-4 ${vibrateOn ? 'text-emerald-400' : theme.textMuted}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
