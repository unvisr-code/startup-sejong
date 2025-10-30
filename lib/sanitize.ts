/**
 * HTML Sanitization Utility
 *
 * Uses DOMPurify to sanitize HTML content and prevent XSS attacks
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param dirty - Unsafe HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (dirty: string, options?: any): string => {
  if (!dirty) return '';

  // Default configuration - allows most safe HTML elements
  const defaultConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre',
      'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'hr',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'style', 'id',
      'colspan', 'rowspan',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    FORCE_BODY: false,
    SANITIZE_DOM: true,
    ...options,
  };

  return DOMPurify.sanitize(dirty, defaultConfig) as unknown as string;
};

/**
 * Sanitize HTML for display in admin preview
 * More permissive than user-facing sanitization
 */
export const sanitizeAdminPreview = (dirty: string): string => {
  return sanitizeHtml(dirty, {
    ADD_TAGS: ['iframe', 'video', 'audio', 'source'],
    ADD_ATTR: ['frameborder', 'allowfullscreen', 'controls', 'autoplay', 'loop', 'muted'],
  });
};

/**
 * Sanitize plain text excerpt (removes all HTML)
 */
export const sanitizeTextOnly = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  }) as unknown as string;
};

/**
 * Create a safe dangerouslySetInnerHTML prop
 * Usage: <div {...createMarkup(htmlContent)} />
 */
export const createMarkup = (html: string, isAdminPreview = false) => {
  const sanitized = isAdminPreview ? sanitizeAdminPreview(html) : sanitizeHtml(html);
  return { dangerouslySetInnerHTML: { __html: sanitized } };
};
