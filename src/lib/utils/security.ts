// Utility security helpers
// Super-light HTML tag stripper to prevent basic XSS vectors coming from
// user-supplied strings such as player names. For production consider a
// well-maintained sanitizer library but we intentionally avoid external deps.
export function sanitizeText(input: string): string {
  if (!input) return '';
  // Remove anything between < and > including the brackets.
  return input.replace(/<[^>]*>/g, '').trim();
} 