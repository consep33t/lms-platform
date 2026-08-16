/**
 * Utility: HTML & Script Sanitizer
 * Removes malicious script tags, onerror/onload attributes, and javascript: URI schemes
 * to protect against Cross-Site Scripting (XSS) attacks.
 *
 * @param dirty The untrusted HTML / raw string
 * @returns Sanitized, safe HTML string
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // If in browser environment, use DOMParser with whitelist parsing
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(dirty, 'text/html');

      // 1. Remove dangerous script and iframe elements
      const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style', 'base', 'meta'];
      dangerousTags.forEach((tagName) => {
        const elements = doc.body.querySelectorAll(tagName);
        elements.forEach((el) => el.remove());
      });

      // 2. Clean dangerous attributes (event listeners and javascript: protocols)
      const allElements = doc.body.querySelectorAll('*');
      allElements.forEach((el) => {
        const attributes = Array.from(el.attributes);
        attributes.forEach((attr) => {
          const name = attr.name.toLowerCase();
          const value = attr.value.toLowerCase();

          // Strip on* event handlers (onclick, onerror, onload, etc.)
          if (name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
          // Strip javascript: pseudo-protocols in href or src
          if ((name === 'href' || name === 'src' || name === 'action') && value.replace(/\s+/g, '').startsWith('javascript:')) {
            el.removeAttribute(attr.name);
          }
        });
      });

      return doc.body.innerHTML;
    } catch {
      // Fallback regex sanitizer
    }
  }

  // Fallback regex-based basic sanitizer
  return dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:[^\s"'>]*/gi, '');
}
