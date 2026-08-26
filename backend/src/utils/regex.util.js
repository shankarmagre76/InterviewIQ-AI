/**
 * Escape special regular expression characters in a user-supplied search string
 * to prevent Regex Injection (ReDoS & regex operator manipulation).
 *
 * @param {string} string - Raw user input string
 * @returns {string} Escaped safe regex string
 */
export const escapeRegex = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Safely create a Case-Insensitive RegExp object from raw user input
 *
 * @param {string} input - Raw user search input
 * @param {string} [flags='i'] - Regex flags
 * @returns {RegExp|null} Safe RegExp instance or null if input is invalid
 */
export const createSafeRegex = (input, flags = 'i') => {
  if (!input || typeof input !== 'string') return null;
  const escaped = escapeRegex(input.trim());
  if (!escaped) return null;
  return new RegExp(escaped, flags);
};

export default {
  escapeRegex,
  createSafeRegex,
};
