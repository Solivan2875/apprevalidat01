import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Station, Scores } from '../types';
import { USERS_KEY } from '../constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Gets all user data from LS
const getAllUsers = (): Record<string, any> => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load user data from localStorage", e);
    return {};
  }
};

// Checks if a user exists
export const userExists = (username: string): boolean => {
  const allUsers = getAllUsers();
  return !!allUsers[username];
};


// Loads state for a specific user
export const loadUserState = (username: string): any | null => {
  try {
    const allUsers = getAllUsers();
    return allUsers[username] || null;
  } catch (e) {
    console.error("Failed to load state from localStorage", e);
    return null;
  }
};

// Saves state for a specific user
export const saveUserState = (username: string, state: any): void => {
  try {
    const allUsers = getAllUsers();
    allUsers[username] = state;
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
  } catch (e) {
    console.error("Failed to save state to localStorage", e);
  }
};

/**
 * Weighted lottery without replacement.
 * If a station had score < 5 yesterday, boost its weight.
 */
export function sampleWeighted(items: Station[], k: number, excludeIds: string[] = []): Station[] {
  const pool = items
    .filter((i) => !excludeIds.includes(i.id))
    .map((i) => ({ ...i, w: Math.max(0.0001, i.weight || 1) }));
  const chosen: Station[] = [];
  while (chosen.length < k && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * total;
    let idx = 0;
    while (idx < pool.length) {
      r -= pool[idx].w;
      if (r <= 0) break;
      idx++;
    }
    const pick = pool[idx] || pool[pool.length - 1];
    chosen.push(pick);
    pool.splice(idx, 1);
  }
  return chosen;
}

export function calcGlobalAvg(scores: Scores): number {
  const all = Object.values(scores).flat();
  if (!all.length) return 0;
  return all.reduce((a, b) => a + b.score, 0) / all.length;
}


/**
 * Determines the patient's gender based on their name in the station title.
 * Used to select an appropriate voice for text-to-speech.
 * @param title The title of the station, e.g., "Case Title (João, 20 anos)".
 * @returns 'male' or 'female'. Defaults to 'female'.
 */
export function getPatientGender(title: string): 'male' | 'female' {
  const match = title.match(/\(([^,]+),/);
  if (!match || !match[1]) {
    return 'female'; // Default to a female voice
  }
  const name = match[1].trim().toLowerCase();

  // Common Brazilian names for better accuracy
  const maleNames = ['joão', 'marcus', 'miguel', 'arthur', 'davi', 'gabriel', 'pedro', 'bernardo', 'lucas', 'heitor', 'rafael', 'enzo', 'guilherme', 'nicolas', 'lorenzo', 'gustavo', 'felipe', 'samuel', 'daniel', 'benjamin', 'joaquim', 'matheus', 'rodrigo', 'sérgio', 'josé', 'carlos'];
  const femaleNames = ['ana', 'maria', 'valentina', 'julia', 'sofia', 'isabella', 'manuela', 'laura', 'alice', 'helena', 'eloá', 'lívia', 'giovanna', 'mariana', 'cecília', 'beatriz', 'luiza', 'helô', 'isadora', 'letícia'];

  if (maleNames.includes(name)) {
    return 'male';
  }
  if (femaleNames.includes(name)) {
    return 'female';
  }

  // Heuristic for names not in the list (common in Portuguese)
  if (name.endsWith('o')) {
    return 'male';
  }
  if (name.endsWith('a')) {
    return 'female';
  }

  return 'female'; // Default to female if unsure
}