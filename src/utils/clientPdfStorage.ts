/**
 * Aswanna Client-Side PDF Multi-Tier Storage & Caching System
 * 
 * Provides resilient, lightning-fast client-side caching so PDFs are downloaded
 * only ONCE per user browser session/device:
 * 1. Tier 1: IndexedDB (Native Binary ArrayBuffer - High capacity, 100MB+ support)
 * 2. Tier 2: Browser CacheStorage API (Standard ServiceWorker/HTTP cache)
 * 3. Tier 3: localStorage (Reading progress, bookmarks, metadata & safe small fallbacks)
 */

const DB_NAME = 'aswanna_pdf_db';
const STORE_NAME = 'pdf_buffers';
const DB_VERSION = 1;
const CACHE_STORAGE_NAME = 'aswanna-pdf-cache-v1';
const LS_META_PREFIX = 'aswanna_pdf_meta_';
const LS_PAGE_PREFIX = 'aswanna_pdf_page_';
const LS_BLOB_PREFIX = 'aswanna_pdf_b64_';
const MAX_LOCAL_STORAGE_BYTES = 2.5 * 1024 * 1024; // 2.5MB max for localStorage to avoid quota limits

/**
 * Creates a stable deterministic hash key from any URL string.
 */
export function getPdfCacheKey(url: string): string {
  if (!url) return 'unknown';
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const cleanUrl = url.split('?')[0].split('/').pop() || 'doc';
  return `${cleanUrl.substring(0, 30)}_${Math.abs(hash).toString(36)}`;
}

/**
 * Open or upgrade the client IndexedDB database.
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Retrieve ArrayBuffer directly from client IndexedDB.
 */
export async function getPdfFromIndexedDB(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        const result = req.result;
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else if (result && result.buffer instanceof ArrayBuffer) {
          resolve(result.buffer);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Persist ArrayBuffer directly to client IndexedDB.
 */
export async function savePdfToIndexedDB(key: string, buffer: ArrayBuffer): Promise<boolean> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(buffer, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Check Browser CacheStorage API.
 */
export async function getPdfFromCacheStorage(url: string): Promise<ArrayBuffer | null> {
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  try {
    const cache = await caches.open(CACHE_STORAGE_NAME);
    const match = await cache.match(url);
    if (match && match.ok) {
      return await match.arrayBuffer();
    }
  } catch {
    // Ignore cache storage errors
  }
  return null;
}

/**
 * Save Response directly to Browser CacheStorage API.
 */
export async function savePdfToCacheStorage(url: string, response: Response): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_STORAGE_NAME);
    await cache.put(url, response);
  } catch {
    // Ignore cache storage errors
  }
}

/**
 * Convert ArrayBuffer to Base64.
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convert Base64 back to ArrayBuffer.
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Safely retrieve small PDF buffer from localStorage if present.
 */
export function getPdfFromLocalStorage(key: string): ArrayBuffer | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const b64 = localStorage.getItem(`${LS_BLOB_PREFIX}${key}`);
    if (b64) {
      return base64ToBuffer(b64);
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Safely save small PDF buffer to localStorage if within safe limits (< 2.5MB).
 */
export function savePdfToLocalStorage(key: string, buffer: ArrayBuffer): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  if (buffer.byteLength > MAX_LOCAL_STORAGE_BYTES) return false;

  try {
    const b64 = bufferToBase64(buffer);
    localStorage.setItem(`${LS_BLOB_PREFIX}${key}`, b64);
    return true;
  } catch {
    return false; // Quota exceeded, safely handled
  }
}

/**
 * Save user reading progress (last opened page) to localStorage.
 */
export function saveReadingProgress(url: string, page: number): void {
  if (typeof window === 'undefined' || !window.localStorage || !url || page < 1) return;
  try {
    const key = getPdfCacheKey(url);
    localStorage.setItem(`${LS_PAGE_PREFIX}${key}`, String(page));
  } catch {
    // Ignore
  }
}

/**
 * Get user reading progress (last opened page) from localStorage.
 */
export function getReadingProgress(url: string): number {
  if (typeof window === 'undefined' || !window.localStorage || !url) return 1;
  try {
    const key = getPdfCacheKey(url);
    const val = localStorage.getItem(`${LS_PAGE_PREFIX}${key}`);
    if (val) {
      const page = parseInt(val, 10);
      if (!isNaN(page) && page >= 1) return page;
    }
  } catch {
    // Ignore
  }
  return 1;
}

/**
 * Save metadata to localStorage for easy client inspection.
 */
export function saveDocumentMetadata(url: string, meta: { title?: string; size?: number }): void {
  if (typeof window === 'undefined' || !window.localStorage || !url) return;
  try {
    const key = getPdfCacheKey(url);
    const data = {
      ...meta,
      url,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${LS_META_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // Ignore
  }
}

/**
 * Check if the PDF is already cached locally on client (IndexedDB / CacheStorage / localStorage).
 */
export async function isPdfCachedLocally(url: string): Promise<boolean> {
  const key = getPdfCacheKey(url);

  // 1. Check IndexedDB
  const idbBuf = await getPdfFromIndexedDB(key);
  if (idbBuf && idbBuf.byteLength > 0) return true;

  // 2. Check localStorage small cache
  const lsBuf = getPdfFromLocalStorage(key);
  if (lsBuf && lsBuf.byteLength > 0) return true;

  // 3. Check CacheStorage
  const csBuf = await getPdfFromCacheStorage(url);
  if (csBuf && csBuf.byteLength > 0) return true;

  return false;
}

/**
 * Master multi-tier client PDF loader.
 * Checks IndexedDB -> CacheStorage -> localStorage -> Network Fetch.
 * Upon fetching, saves into IndexedDB, CacheStorage, and localStorage metadata.
 */
export async function fetchPdfWithMultiTierClientCache(
  targetUrl: string,
  options?: { title?: string }
): Promise<{ buffer: ArrayBuffer; source: 'indexeddb' | 'cache_api' | 'local_storage' | 'network' }> {
  const key = getPdfCacheKey(targetUrl);

  // Tier 1: Check IndexedDB (Native Binary, fast & unlimited)
  try {
    const idbBuffer = await getPdfFromIndexedDB(key);
    if (idbBuffer && idbBuffer.byteLength > 0) {
      return { buffer: idbBuffer, source: 'indexeddb' };
    }
  } catch (idbErr) {
    console.warn('IndexedDB check failed:', idbErr);
  }

  // Tier 2: Check Browser CacheStorage API
  try {
    const csBuffer = await getPdfFromCacheStorage(targetUrl);
    if (csBuffer && csBuffer.byteLength > 0) {
      // Re-hydrate IndexedDB in background
      savePdfToIndexedDB(key, csBuffer).catch(() => {});
      return { buffer: csBuffer, source: 'cache_api' };
    }
  } catch (csErr) {
    console.warn('CacheStorage check failed:', csErr);
  }

  // Tier 3: Check localStorage
  const lsBuffer = getPdfFromLocalStorage(key);
  if (lsBuffer && lsBuffer.byteLength > 0) {
    savePdfToIndexedDB(key, lsBuffer).catch(() => {});
    return { buffer: lsBuffer, source: 'local_storage' };
  }

  // Tier 4: Fetch from network (Proxied S3)
  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // Clone response for CacheStorage before reading body
  try {
    const clone = response.clone();
    savePdfToCacheStorage(targetUrl, clone).catch(() => {});
  } catch {
    // Ignore clone error
  }

  const arrayBuffer = await response.arrayBuffer();

  // Save to IndexedDB (Tier 1)
  savePdfToIndexedDB(key, arrayBuffer).catch(() => {});

  // Save small files to localStorage safely (Tier 3)
  savePdfToLocalStorage(key, arrayBuffer);

  // Save metadata to localStorage
  saveDocumentMetadata(targetUrl, {
    title: options?.title,
    size: arrayBuffer.byteLength,
  });

  return { buffer: arrayBuffer, source: 'network' };
}
