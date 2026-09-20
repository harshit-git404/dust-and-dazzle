import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dust and Dazzle — Short Stories by Ajeet Kumar Singh',
    short_name: 'Dust & Dazzle',
    description: 'Tales from a Village and a City by Ajeet Kumar Singh',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF6F0',
    theme_color: '#8C3A27',
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
