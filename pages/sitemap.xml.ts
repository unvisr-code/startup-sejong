import { GetServerSideProps } from 'next';
import { supabase } from '../lib/supabase';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateSiteMap(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls
  .map((url) => {
    return `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `
    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority !== undefined ? `
    <priority>${url.priority}</priority>` : ''}
  </url>`;
  })
  .join('\n')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://csstartup-sejong.vercel.app';
  const currentDate = new Date().toISOString();

  try {
    // Static pages
    const staticUrls: SitemapUrl[] = [
      {
        loc: baseUrl,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 1.0,
      },
      {
        loc: `${baseUrl}/announcements`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        loc: `${baseUrl}/calendar`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.9,
      },
    ];

    // Dynamic announcements pages
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('id, updated_at')
      .order('updated_at', { ascending: false });

    const announcementUrls: SitemapUrl[] = announcements
      ? announcements.map((announcement) => ({
          loc: `${baseUrl}/announcements/${announcement.id}`,
          lastmod: announcement.updated_at || currentDate,
          changefreq: 'weekly' as const,
          priority: 0.7,
        }))
      : [];

    // Combine all URLs
    const allUrls = [...staticUrls, ...announcementUrls];

    // Generate sitemap
    const sitemap = generateSiteMap(allUrls);

    // Set cache control headers
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return minimal sitemap on error
    const minimalSitemap = generateSiteMap([
      {
        loc: baseUrl,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 1.0,
      },
    ]);

    res.setHeader('Content-Type', 'text/xml');
    res.write(minimalSitemap);
    res.end();

    return {
      props: {},
    };
  }
};

// Default export to prevent Next.js errors
export default function Sitemap() {
  return null;
}
