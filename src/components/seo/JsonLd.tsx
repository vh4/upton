import React from 'react';

export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://upton.wirsumatmo.tech';

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'UP-TON',
    alternateName: ['Upton File Sharing', 'UP-TON Cloud', 'Up-ton'],
    url: baseUrl,
    description:
      'Fast, free, and secure file sharing for images and videos with configurable auto-expiration. No account required.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Instant drag-and-drop file upload for images and videos',
      'Configurable auto-expiration timers (1 hour to 30 days or permanent)',
      'Native HTML5 byte-range video streaming without wait',
      'Token-protected instant owner deletion',
      'No registration or personal data required',
      'High-speed cloud hybrid storage',
    ],
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'UP-TON',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    sameAs: [
      'https://github.com/vh4/upton',
      'https://buymeacoffee.com/fathoniwasl',
      'https://wirsumatmo.tech',
    ],
    parentOrganization: {
      '@type': 'Organization',
      name: 'Wirsumatmo Tech',
      alternateName: ['Atmo Tech', 'Atmo Consultant'],
      url: 'https://wirsumatmo.tech',
      description:
        'Jasa Pembuatan Website, Web App, dan Konsultan Teknologi Modern #1 di Indonesia.',
      founder: {
        '@type': 'Person',
        name: 'Fathoni Waseso Jati',
      },
      sameAs: [
        'https://github.com/vh4/atmo',
        'https://wirsumatmo.tech',
      ],
    },
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'UP-TON',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/dashboard`,
      'query-input': 'required name=search_term_string',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is UP-TON completely free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! UP-TON is 100% free with no registration, subscriptions, or hidden charges required.',
        },
      },
      {
        '@type': 'Question',
        name: 'What file formats and upload size limits are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UP-TON supports all major image formats (JPEG, PNG, GIF, WebP, SVG, AVIF) and video formats (MP4, WebM, QuickTime MOV) with file sizes up to 500 MB per file.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the auto-expiration timer work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can select presets like 1 hour, 24 hours, 7 days, 30 days, or customize down to the exact minute. Expired files are permanently purged automatically.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need an account or email to share files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No account, login, or personal information is required. You can upload and get a shareable link instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I delete my file before it reaches expiration?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Every uploaded file generates a unique, private deletion token and management link so you can delete it whenever you choose.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can videos be played and streamed directly in the browser?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, UP-TON provides native HTML5 byte-range video streaming, enabling smooth scrubbing and instant playback without waiting for full downloads.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
