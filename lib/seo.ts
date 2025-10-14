// SEO Utility Functions for 세종대 융합창업연계전공

export const SITE_CONFIG = {
  name: '세종대학교 융합창업연계전공',
  shortName: '세종창업',
  description: '기획부터 사업화까지, 아이디어를 성장시키는 창업 전공. 세종대학교 융합창업연계전공에서 준비된 청년창업인으로 성장하세요.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://startup-sejong.vercel.app',
  ogImage: '/og.png',
  twitterHandle: '@sejong_startup',
  keywords: [
    '세종대학교',
    '융합창업연계전공',
    '창업교육',
    '스타트업',
    '창업전공',
    '대학창업',
    '청년창업',
    '기업가정신',
    '창업지원',
    '세종대',
  ],
};

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetaTags(props: SEOProps) {
  const {
    title,
    description = SITE_CONFIG.description,
    canonical,
    ogImage = SITE_CONFIG.ogImage,
    ogType = 'website',
    article,
    noindex = false,
    nofollow = false,
  } = props;

  const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const fullCanonical = canonical ? `${SITE_CONFIG.url}${canonical}` : SITE_CONFIG.url;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_CONFIG.url}${ogImage}`;

  const metaTags = {
    title: fullTitle,
    description,
    canonical: fullCanonical,
    openGraph: {
      title: fullTitle,
      description,
      url: fullCanonical,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'ko_KR',
      type: ogType,
      ...(article && {
        article: {
          publishedTime: article.publishedTime,
          modifiedTime: article.modifiedTime,
          authors: article.author ? [article.author] : [],
          tags: article.tags || [],
        },
      }),
    },
    twitter: {
      handle: SITE_CONFIG.twitterHandle,
      site: SITE_CONFIG.twitterHandle,
      cardType: 'summary_large_image',
      title: fullTitle,
      description,
      image: fullOgImage,
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  return metaTags;
}

// JSON-LD Schema Generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '209 Neungdong-ro, Gwangjin-gu',
      addressLocality: 'Seoul',
      postalCode: '05006',
      addressCountry: 'KR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Korean'],
    },
    sameAs: [
      // Add social media URLs here if available
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    publisher: {
      '@type': 'EducationalOrganization',
      name: '세종대학교',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.url}/announcements?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  publishedTime: string;
  modifiedTime: string;
  author?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image ? `${SITE_CONFIG.url}${article.image}` : `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime,
    author: {
      '@type': 'Organization',
      name: article.author || SITE_CONFIG.name,
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: '세종대학교',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}${article.url}`,
    },
  };
}

export function generateEventSchema(event: {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: event.location
      ? {
          '@type': 'Place',
          name: event.location,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'KR',
          },
        }
      : {
          '@type': 'VirtualLocation',
          url: `${SITE_CONFIG.url}${event.url}`,
        },
    organizer: {
      '@type': 'EducationalOrganization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}

// Helper to strip HTML tags from content
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

// Generate excerpt from content
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const stripped = stripHtml(content);
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength).trim() + '...';
}
