import sanitizeHtml from 'sanitize-html';

/**
 * Strict server-side HTML sanitizer for story content.
 * Prevents XSS, script injection, iframes, and dangerous attributes.
 */
export function sanitizeStoryHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'blockquote',
      'strong',
      'em',
      'b',
      'i',
      'u',
      's',
      'hr',
      'span',
      'br',
      'ul',
      'ol',
      'li',
      'figure',
      'figcaption',
    ],
    allowedAttributes: {
      span: ['class'],
      p: ['class'],
      blockquote: ['class'],
      hr: ['class'],
      h3: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
  });
}
