/**
 * LocalStorage state and persistence helpers for CalcAI Pro
 */

export type ThemeType = 'dark' | 'light' | 'royal' | 'gold' | 'cyberpunk';

export interface VaultPhoto {
  id: string;
  name: string;
  dataUrl: string; // base64
  dateAdded: number;
  sizeBytes: number;
}

export interface VaultNote {
  id: string;
  title: string;
  content: string;
  category?: string;
  isPinned: boolean;
  dateUpdated: number;
}

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

const KEYS = {
  VAULT_PIN: 'calcai_vault_pin',
  VAULT_PHOTOS: 'calcai_vault_photos',
  VAULT_NOTES: 'calcai_vault_notes',
  HISTORY: 'calcai_history',
  THEME: 'calcai_theme',
  SOUND_ENABLED: 'calcai_sound_enabled',
  VIBRATION_ENABLED: 'calcai_vibration_enabled',
  RADIAN_MODE: 'calcai_radian_mode',
};

// Vault PIN defaults to "1234" if not set yet, so user can immediately test typing 1234 and pressing =
export function getVaultPin(): string {
  try {
    const pin = localStorage.getItem(KEYS.VAULT_PIN);
    return pin || '1234';
  } catch {
    return '1234';
  }
}

export function setVaultPin(pin: string): void {
  try {
    localStorage.setItem(KEYS.VAULT_PIN, pin);
  } catch (e) {
    console.error('Failed to save vault pin', e);
  }
}

export function getVaultPhotos(): VaultPhoto[] {
  try {
    const raw = localStorage.getItem(KEYS.VAULT_PHOTOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVaultPhotos(photos: VaultPhoto[]): void {
  try {
    localStorage.setItem(KEYS.VAULT_PHOTOS, JSON.stringify(photos));
  } catch (e) {
    console.error('Storage quota exceeded or error', e);
    throw new Error('Storage limit reached. Please remove older photos.');
  }
}

export function getVaultNotes(): VaultNote[] {
  try {
    const raw = localStorage.getItem(KEYS.VAULT_NOTES);
    if (!raw) {
      // Seed initial sample private note
      const defaultNotes: VaultNote[] = [
        {
          id: 'note-welcome',
          title: 'Welcome to your Secret Vault 🔒',
          content: 'This note is encrypted and stored locally on your device. You can hide private photos and secret notes here. Nobody can access this unless they type your 4-digit PIN and press "=" on the calculator!',
          category: 'Personal',
          isPinned: true,
          dateUpdated: Date.now(),
        },
      ];
      localStorage.setItem(KEYS.VAULT_NOTES, JSON.stringify(defaultNotes));
      return defaultNotes;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveVaultNotes(notes: VaultNote[]): void {
  try {
    localStorage.setItem(KEYS.VAULT_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    // Keep last 50 entries
    const trimmed = entries.slice(0, 50);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function getSavedTheme(): ThemeType {
  try {
    const theme = localStorage.getItem(KEYS.THEME) as ThemeType;
    if (theme && ['dark', 'light', 'royal', 'gold', 'cyberpunk'].includes(theme)) {
      return theme;
    }
    return 'dark'; // default AMOLED dark
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: ThemeType): void {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function getSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(KEYS.SOUND_ENABLED);
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
}

export function saveSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(KEYS.SOUND_ENABLED, String(enabled));
  } catch (e) {
    console.error(e);
  }
}

export function getVibrationEnabled(): boolean {
  try {
    const val = localStorage.getItem(KEYS.VIBRATION_ENABLED);
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
}

export function saveVibrationEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(KEYS.VIBRATION_ENABLED, String(enabled));
  } catch (e) {
    console.error(e);
  }
}
