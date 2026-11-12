/**
 * Vault Storage with Dual-PIN Security:
 * - Real PIN opens Real Vault (confidential photos, secret videos, private notes)
 * - Decoy/Fake PIN opens Decoy Vault (clean fake notes, empty gallery for coercion privacy)
 * - Supports Photos & Videos via LocalStorage and IndexedDB
 */

export interface VaultMediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  dataUrl: string;
  dateAdded: number;
  sizeBytes: number;
}

export interface VaultNoteItem {
  id: string;
  title: string;
  content: string;
  category?: string;
  isPinned: boolean;
  dateUpdated: number;
}

const KEYS = {
  REAL_PIN: 'calcai_vault_real_pin',
  DECOY_PIN: 'calcai_vault_decoy_pin',
  REAL_MEDIA: 'calcai_vault_media_real',
  DECOY_MEDIA: 'calcai_vault_media_decoy',
  REAL_NOTES: 'calcai_vault_notes_real',
  DECOY_NOTES: 'calcai_vault_notes_decoy',
};

export function getRealVaultPin(): string {
  try {
    return localStorage.getItem(KEYS.REAL_PIN) || '1234';
  } catch {
    return '1234';
  }
}

export function setRealVaultPin(pin: string): void {
  try {
    localStorage.setItem(KEYS.REAL_PIN, pin);
  } catch (e) {
    console.error(e);
  }
}

export function getDecoyVaultPin(): string {
  try {
    return localStorage.getItem(KEYS.DECOY_PIN) || '0000';
  } catch {
    return '0000';
  }
}

export function setDecoyVaultPin(pin: string): void {
  try {
    localStorage.setItem(KEYS.DECOY_PIN, pin);
  } catch (e) {
    console.error(e);
  }
}

export function checkVaultUnlockType(entered: string): 'real' | 'decoy' | null {
  const clean = entered.trim();
  const real = getRealVaultPin();
  const decoy = getDecoyVaultPin();

  if (clean === real) return 'real';
  if (clean === decoy) return 'decoy';
  return null;
}

// Media Items (Photos / Videos)
export function getVaultMedia(isDecoy = false): VaultMediaItem[] {
  try {
    const key = isDecoy ? KEYS.DECOY_MEDIA : KEYS.REAL_MEDIA;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVaultMedia(items: VaultMediaItem[], isDecoy = false): void {
  try {
    const key = isDecoy ? KEYS.DECOY_MEDIA : KEYS.REAL_MEDIA;
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error(e);
    throw new Error('Storage limit reached. Please remove older files.');
  }
}

// Notes Items
export function getVaultNotes(isDecoy = false): VaultNoteItem[] {
  try {
    const key = isDecoy ? KEYS.DECOY_NOTES : KEYS.REAL_NOTES;
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (isDecoy) {
        // Innocent decoy notes
        return [
          {
            id: 'decoy_note_1',
            title: 'Weekly Grocery List 🛒',
            content: '1. Whole grain bread\n2. Milk & Eggs\n3. Fresh apples\n4. Olive oil\n5. Green tea',
            category: 'Personal',
            isPinned: true,
            dateUpdated: Date.now() - 86400000,
          },
          {
            id: 'decoy_note_2',
            title: 'Workout Schedule 🏃',
            content: 'Monday: Cardio 5km\nWednesday: Upper body strength\nFriday: Core & Yoga',
            category: 'Fitness',
            isPinned: false,
            dateUpdated: Date.now() - 172800000,
          },
        ];
      } else {
        // Real confidential vault initial note
        return [
          {
            id: 'real_note_welcome',
            title: 'Welcome to your Secret Vault 🔒',
            content: 'This vault is protected with Dual-PIN technology. Your Real PIN (1234) accesses your confidential photos, videos, and private notes. Your Decoy PIN (0000) opens a completely clean decoy vault for privacy if anyone asks you to unlock it.',
            category: 'Confidential',
            isPinned: true,
            dateUpdated: Date.now(),
          },
        ];
      }
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveVaultNotes(notes: VaultNoteItem[], isDecoy = false): void {
  try {
    const key = isDecoy ? KEYS.DECOY_NOTES : KEYS.REAL_NOTES;
    localStorage.setItem(key, JSON.stringify(notes));
  } catch (e) {
    console.error(e);
  }
}
