const DB_NAME = 'rhams-db';
const DB_VERSION = 1;

export const STORE_NAMES = {
  meta: 'meta',
  planHistory: 'planHistory',
  surveyHistory: 'surveyHistory',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAMES.meta)) {
        db.createObjectStore(STORE_NAMES.meta);
      }
      if (!db.objectStoreNames.contains(STORE_NAMES.planHistory)) {
        db.createObjectStore(STORE_NAMES.planHistory, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_NAMES.surveyHistory)) {
        db.createObjectStore(STORE_NAMES.surveyHistory, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function runRequest<T>(db: IDBDatabase, storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return runRequest<T>(db, STORE_NAMES.meta, 'readonly', (store) => store.get(key));
}

export async function setMeta<T>(key: string, value: T): Promise<void> {
  const db = await openDb();
  await runRequest(db, STORE_NAMES.meta, 'readwrite', (store) => store.put(value, key));
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDb();
  return runRequest<T[]>(db, storeName, 'readonly', (store) => store.getAll());
}

export async function putRecord<T>(storeName: string, value: T): Promise<void> {
  const db = await openDb();
  await runRequest(db, storeName, 'readwrite', (store) => store.put(value));
}

export async function deleteRecord(storeName: string, key: IDBValidKey): Promise<void> {
  const db = await openDb();
  await runRequest(db, storeName, 'readwrite', (store) => store.delete(key));
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDb();
  await runRequest(db, storeName, 'readwrite', (store) => store.clear());
}

export async function replaceAll<T>(storeName: string, values: T[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    for (const value of values) store.put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
