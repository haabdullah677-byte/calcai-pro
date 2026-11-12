/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AndroidHeader } from './components/AndroidHeader';
import { BottomNav, TabType } from './components/BottomNav';
import { AdBanner } from './components/AdBanner';
import { CalcTab } from './components/CalcTab';
import { AiSolverTab } from './components/AiSolverTab';
import { ToolsTab } from './components/ToolsTab';
import { VaultTab } from './components/VaultTab';
import { FloatingMiniCalc } from './components/FloatingMiniCalc';
import { THEMES } from './utils/theme';
import { ThemeType, getSavedTheme, saveTheme } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('calc');
  const [themeType, setThemeType] = useState<ThemeType>('dark');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [isDecoyMode, setIsDecoyMode] = useState(false);
  const [isMiniCalcOpen, setIsMiniCalcOpen] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = getSavedTheme();
    setThemeType(saved);
  }, []);

  const handleThemeChange = (newTheme: ThemeType) => {
    setThemeType(newTheme);
    saveTheme(newTheme);
  };

  const handleOpenVaultFromCalc = (isDecoy = false) => {
    setIsDecoyMode(isDecoy);
    setIsVaultUnlocked(true);
    setActiveTab('vault');
  };

  const currentTheme = THEMES[themeType] || THEMES.dark;

  return (
    <div
      className={`min-h-screen w-full flex justify-center items-center font-sans transition-colors duration-300 ${currentTheme.bgClass}`}
    >
      {/* Android Device Shell Container */}
      <div
        className={`w-full max-w-md h-screen max-h-[100dvh] flex flex-col justify-between overflow-hidden shadow-2xl relative border-x sm:border-y sm:rounded-[36px] sm:max-h-[92vh] sm:my-auto transition-all ${currentTheme.appShellClass}`}
      >
        {/* Android Top Header & Status Bar */}
        <AndroidHeader theme={currentTheme} activeTab={activeTab} />

        {/* Tab Content Views */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'calc' && (
            <CalcTab
              theme={currentTheme}
              onOpenVault={handleOpenVaultFromCalc}
              onToggleMiniCalc={() => setIsMiniCalcOpen(!isMiniCalcOpen)}
              isMiniCalcOpen={isMiniCalcOpen}
            />
          )}

          {activeTab === 'ai' && <AiSolverTab theme={currentTheme} />}

          {activeTab === 'tools' && <ToolsTab theme={currentTheme} />}

          {activeTab === 'vault' && (
            <VaultTab
              theme={currentTheme}
              onThemeChange={handleThemeChange}
              isUnlocked={isVaultUnlocked}
              setIsUnlocked={setIsVaultUnlocked}
              isDecoyMode={isDecoyMode}
              setIsDecoyMode={setIsDecoyMode}
            />
          )}
        </main>

        {/* Floating Mini-Calculator Widget (Overlays screen) */}
        <FloatingMiniCalc
          theme={currentTheme}
          isOpen={isMiniCalcOpen}
          onClose={() => setIsMiniCalcOpen(false)}
        />

        {/* Sponsored Ad Banner placeholder (above bottom nav) */}
        <AdBanner theme={currentTheme} />

        {/* 4 Bottom Navigation Tabs */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          theme={currentTheme}
          isVaultUnlocked={isVaultUnlocked}
        />
      </div>
    </div>
  );
}
