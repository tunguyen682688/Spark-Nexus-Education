import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize HTML to prevent XSS attacks.
 * Use this whenever rendering user-generated HTML via dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'cite',
      'a', 'img',
      'figure', 'figcaption',
      'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'hr',
      'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'className', 'class',
      'target', 'rel', 'width', 'height',
      'colSpan', 'rowSpan',
    ],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize CSS content (for inline style injection).
 */
export function sanitizeCss(css: string): string {
  return DOMPurify.sanitize(css, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
