/**
 * Quick-Obs - lokal IndexedDB-lagring.
 *
 * Al data forbliver paa enheden. Ingen cloud-synkronisering. Databasen er
 * versioneret, saa fremtidige faser kan migrere skemaet uden datatab.
 */

export const DB_NAME = "quick-obs";
export const DB_VERSION = 1;

export const STORES = {
  drafts: "drafts",
  reports: "reports",
  media: "media",
  contacts: "contacts",
  settings: "settings",
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB er ikke tilgaengelig i denne browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.drafts)) {
        db.createObjectStore(STORES.drafts, { keyPath: "kind" });
      }
      if (!db.objectStoreNames.contains(STORES.reports)) {
        const store = db.createObjectStore(STORES.reports, { keyPath: "id" });
        store.createIndex("kind", "kind", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.media)) {
        db.createObjectStore(STORES.media, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.contacts)) {
        db.createObjectStore(STORES.contacts, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/** Faelles fejlnavn, saa UI-laget kan vise en forklarende besked ved fuld lagerplads. */
export class StorageQuotaError extends Error {
  constructor() {
    super("Der er ikke mere ledig lagerplads paa enheden (QuotaExceededError).");
    this.name = "StorageQuotaError";
  }
}

function wrapRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      if (request.error?.name === "QuotaExceededError") {
        reject(new StorageQuotaError());
      } else {
        reject(request.error);
      }
    };
  });
}

export async function dbGet<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDb();
  const tx = db.transaction(store, "readonly");
  return wrapRequest(tx.objectStore(store).get(key));
}

export async function dbGetAll<T>(store: string): Promise<T[]> {
  const db = await openDb();
  const tx = db.transaction(store, "readonly");
  return wrapRequest(tx.objectStore(store).getAll());
}

export async function dbPut<T>(store: string, value: T): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  await wrapRequest(tx.objectStore(store).put(value));
}

export async function dbDelete(store: string, key: IDBValidKey): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  await wrapRequest(tx.objectStore(store).delete(key));
}

export async function dbClear(store: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  await wrapRequest(tx.objectStore(store).clear());
}

/** Bruges af admin-lagringsstatus. Ikke understoettet i alle browsere. */
export async function estimateStorage(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  return { usage: usage ?? 0, quota: quota ?? 0 };
}
