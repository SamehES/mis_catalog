import { CatalogProject } from '../types';

const DB_NAME = 'ProductCatalogBuilderDB';
const DB_VERSION = 1;
const STORE_NAME = 'catalog_projects';
const CURRENT_PROJECT_KEY = 'latest_catalog_project';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('IndexedDB failed to open'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Saves project state to IndexedDB for continuous autosave
 */
export async function saveProjectToDB(project: CatalogProject): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(project, CURRENT_PROJECT_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save project to IndexedDB'));
    });
  } catch (error) {
    console.error('Autosave IndexedDB error:', error);
  }
}

/**
 * Loads latest project state from IndexedDB
 */
export async function loadProjectFromDB(): Promise<CatalogProject | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(CURRENT_PROJECT_KEY);

      request.onsuccess = () => {
        resolve((request.result as CatalogProject) || null);
      };
      request.onerror = () => reject(new Error('Failed to load project from IndexedDB'));
    });
  } catch (error) {
    console.error('Load IndexedDB error:', error);
    return null;
  }
}

/**
 * Clears the stored project in IndexedDB
 */
export async function clearProjectDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(CURRENT_PROJECT_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear project from IndexedDB'));
    });
  } catch (error) {
    console.error('Clear IndexedDB error:', error);
  }
}
