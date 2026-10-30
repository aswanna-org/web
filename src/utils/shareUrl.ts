/**
 * Clean Share URL Generator
 * Generates user-friendly share links without the '/api' prefix (e.g. https://aswanna.lk/share/...)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SHARE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export function getShareUrl(entityPath: string, identifier?: string | null): string {
  if (!identifier) {
    return typeof window !== 'undefined' ? window.location.href : `${SHARE_BASE_URL}/${entityPath}`;
  }
  const cleanEntity = entityPath.replace(/^\/+|\/+$/g, '');
  return `${SHARE_BASE_URL}/share/${cleanEntity}/${encodeURIComponent(identifier)}`;
}

