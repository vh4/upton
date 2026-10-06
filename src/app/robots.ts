import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://upton.wirsumatmo.tech';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/dashboard', '/f/'],
        disallow: ['/api/', '/reset', '/f/*/manage'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/dashboard', '/f/'],
        disallow: ['/api/', '/reset', '/f/*/manage'],
      },
      {
        userAgent: 'bingbot',
        allow: ['/', '/dashboard', '/f/'],
        disallow: ['/api/', '/reset', '/f/*/manage'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
