import type { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt generation controlled by environment variable SITE_INDEXABLE.
 * Defaults to blocking all crawlers (disallow: /) unless explicitly enabled.
 */
export default function robots(): MetadataRoute.Robots {
  const isIndexable = process.env.SITE_INDEXABLE === 'true';

  if (!isIndexable) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
  };
}
