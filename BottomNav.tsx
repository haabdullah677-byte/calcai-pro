import React from 'react';
import { Calculator, Sparkles, Wrench, Shield, Lock } from 'lucide-react';
import { ThemeColors } from '../utils/theme';
import { playFeedback } from '../utils/audio';

export type TabType = 'calc' | 'ai' | 'tools' | 'vault';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  theme: ThemeColors;
  isVaultUnlocked: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  theme,
  isVaultUnlocked,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'calc',
      label: 'CALC',
      icon: <Calculator className="w-5 h-5" />,
    },
    {
      id: 'ai',
      label: 'AI SOLVER',
      icon: <Sparkles className="w-5 h-5" />,
      badge: 'AI',
    },
    {
      id: 'tools',
      label: 'TOOLS',
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      id: 'vault',
      label: 'VAULT & ME',
      icon: isVaultUnlocked ? <Shield className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5" />,
      badge: isVaultUnlocked ? 'OPEN' : 'PIN',
    },
  ];

  const handleSelect = (tab: TabType) => {
    playFeedback('click');
    onChangeTab(tab);
  };

  return (
    <nav
      className={`w-full border-t z-30 shrink-0 select-none pb-safe ${theme.navBg}`}
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              aria-label={`Switch to ${tab.label} tab`}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive ? theme.navActive + ' font-semibold' : `${theme.textMuted} hover:${theme.textSecondary}`
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[8px] font-black px-1 py-0.2 rounded-full uppercase leading-tight ${
                      tab.badge === 'OPEN'
                        ? 'bg-emerald-500 text-black'
                        : tab.badge === 'AI'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                        : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="w-4 h-0.5 rounded-full mt-0.5 animate-pulse"
                  style={{ backgroundColor: theme.accentColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
