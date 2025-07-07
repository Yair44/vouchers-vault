import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitizes plain text input by removing any HTML tags
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

/**
 * Validates and sanitizes user input with length limits
 */
export const validateAndSanitizeInput = (
  input: string,
  maxLength: number = 1000,
  allowHtml: boolean = false
): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Apply length limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Sanitize based on HTML allowance
  return allowHtml ? sanitizeHtml(sanitized) : sanitizeText(sanitized);
};