/**
 * Ensures an external web link has a valid absolute protocol (https:// or http://).
 * Prevents browsers from interpreting domain-only links (e.g. 'www.doenets.lk' or 'forms.gle/...')
 * as relative routes under the current website domain (e.g. 'http://localhost:5173/careers/.../www.doenets.lk').
 */
export function formatExternalUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already has protocol (http://, https://, mailto:, tel:)
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  // Protocol-relative URL (//example.com)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Otherwise, prepend https://
  return `https://${trimmed}`;
}
