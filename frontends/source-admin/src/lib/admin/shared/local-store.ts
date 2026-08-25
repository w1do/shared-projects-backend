/**
 * Shared localStorage helpers for admin mock/offline stores.
 * Supports versioned list seeding plus raw JSON read/write for secondary maps.
 */

export type VersionedLocalStoreOptions<T> = {
  storageKey: string;
  seedVersionKey: string;
  seedVersion: string;
  /**
   * Mutable seed array kept in sync with localStorage.
   * Existing mock modules mutate this array so in-memory imports stay current.
   */
  seed: T[];
};

export type VersionedLocalStore<T> = {
  read: () => T[];
  save: (items: T[]) => void;
};

export function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Creates a versioned list store: when the seed version mismatches (or data is
 * missing), reseeds from the provided mutable seed array and persists it.
 */
export function createVersionedLocalStore<T>(
  options: VersionedLocalStoreOptions<T>,
): VersionedLocalStore<T> {
  const { storageKey, seedVersionKey, seedVersion, seed } = options;

  function save(items: T[]) {
    const copy = [...items];
    writeJson(storageKey, copy);
    seed.length = 0;
    seed.push(...copy);
  }

  function read(): T[] {
    const stored = readJson<T[]>(storageKey);
    const currentSeedVersion =
      typeof window !== "undefined" ? window.localStorage.getItem(seedVersionKey) : null;

    if (!stored || currentSeedVersion !== seedVersion) {
      save(seed);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(seedVersionKey, seedVersion);
      }
      return [...seed];
    }

    return [...stored];
  }

  return { read, save };
}
