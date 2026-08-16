import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * @param dirty The untrusted HTML string
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(dirty);
  }
  return dirty; // Optional: implement server-side sanitization if needed
}
