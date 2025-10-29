import { GetServerSideProps } from 'next';
import { supabase } from '../lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://startup-sejong.vercel.app';

function generateRssItem(post: any): string {
  // HTML 태그 제거
  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');
  const description = stripHtml(post.content).substring(0, 200) + '...';

  return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/announcements/${post.id}</link>
      <guid>${SITE_URL}/announcements/${post.id}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category>${post.category === 'important' ? '중요' : post.category === 'event' ? '행사' : '학사'}</category>
    </item>
  `;
}

function generateRss(posts: any[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>세종대학교 융합창업연계전공 공지사항</title>
    <link>${SITE_URL}</link>
    <description>세종대학교 융합창업연계전공의 최신 공지사항을 확인하세요</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(generateRssItem).join('')}
  </channel>
</rss>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    // Fetch latest announcements
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('id, title, content, category, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching announcements for RSS:', error);
      throw error;
    }

    const rss = generateRss(announcements || []);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    res.write(rss);
    res.end();
  } catch (error) {
    console.error('RSS generation failed:', error);
    // Return minimal RSS feed on error
    const minimalRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>세종대학교 융합창업연계전공</title>
    <link>${SITE_URL}</link>
    <description>세종대학교 융합창업연계전공</description>
  </channel>
</rss>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.write(minimalRss);
    res.end();
  }

  return {
    props: {},
  };
};

export default function RssFeed() {
  return null;
}
