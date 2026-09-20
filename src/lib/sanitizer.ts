import sanitizeHtml from 'sanitize-html';

/**
 * Strict server-side HTML sanitizer for story content.
 * Prevents XSS, script injection, iframes, and dangerous attributes.
 * Allows safe archival photo plate markup strictly from verified storage.
 */
export function sanitizeStoryHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';

  const supabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    : null;

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
      'img',
    ],
    allowedAttributes: {
      span: ['class'],
      p: ['class'],
      blockquote: ['class'],
      hr: ['class'],
      h3: ['class'],
      figure: ['class', 'data-effect', 'data-tilt'],
      figcaption: ['class'],
      img: [
        'src',
        'alt',
        'title',
        'class',
        'loading',
        'width',
        'height',
        'data-caption',
        'data-year',
        'data-effect',
      ],
    },
    allowedSchemes: ['http', 'https'],
    transformTags: {
      img: (tagName, attribs) => {
        const src = attribs.src || '';

        // If a supabase domain is configured, ensure external images originate from storage or local
        if (supabaseDomain && src.startsWith('http')) {
          try {
            const parsedUrl = new URL(src);
            const isSupabase = parsedUrl.hostname.includes('supabase.co') || parsedUrl.hostname === supabaseDomain;
            const isLocal = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';
            if (!isSupabase && !isLocal) {
              // Disallow unapproved external image hosts
              return { tagName: 'span', attribs: { class: 'untrusted-image-omitted' } };
            }
          } catch {
            return { tagName: 'span', attribs: { class: 'untrusted-image-omitted' } };
          }
        }

        const cleanAttribs: Record<string, string> = {};
        for (const [k, v] of Object.entries(attribs)) {
          if (typeof v === 'string') {
            cleanAttribs[k] = v;
          }
        }
        cleanAttribs.loading = 'lazy';
        cleanAttribs.alt = attribs.alt || 'Archival photograph';

        return {
          tagName: 'img',
          attribs: cleanAttribs,
        };
      },
    },
    disallowedTagsMode: 'discard',
  });
}

