import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UP-TON — Fast & Ephemeral File Sharing',
    short_name: 'UP-TON',
    description: 'Instant, secure, and free file sharing for images and videos with configurable expiration.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
