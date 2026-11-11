import DOMPurify from 'dompurify';

/**
 * Sanitizes arbitrary HTML input to eliminate Cross-Site Scripting (XSS) attacks
 * while preserving legitimate rich text formatting (paragraphs, headings, lists, tables, links, images).
 *
 * Explicitly forbids malicious tags (<script>, <style>, <iframe>, <object>, <form>)
 * and event handlers (onerror, onload, onclick, javascript: URIs).
 */
export const sanitizeHtml = (dirty: string | null | undefined): string => {
  if (!dirty || typeof dirty !== 'string') return '';

  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'strike', 's', 'sub', 'sup',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'a', 'img', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
      'width', 'height', 'colspan', 'rowspan', 'align'
    ],
    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'input', 'textarea'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    ALLOW_DATA_ATTR: false
  });
};

