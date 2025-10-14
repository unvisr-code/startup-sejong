import React from 'react';
import Head from 'next/head';
import Header from '../components/Layout/Header';
import HeroSection from '../components/Hero/HeroSection';
import AboutSection from '../components/About/AboutSection';
import CurriculumSection from '../components/Curriculum/CurriculumSection';
import ProcessSection from '../components/Process/ProcessSection';
import ContactSection from '../components/Contact/ContactSection';
import Footer from '../components/Layout/Footer';
import KakaoChatButton from '../components/KakaoChat/KakaoChatButton';
import JsonLd from '../components/SEO/JsonLd';
import { generateOrganizationSchema, generateWebSiteSchema, SITE_CONFIG } from '../lib/seo';

export default function Home() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      <Head>
        <title>세종대 융합창업연계전공 | 준비된 청년창업인 양성</title>
        <meta name="description" content={SITE_CONFIG.description} />
        <meta name="keywords" content={SITE_CONFIG.keywords.join(', ')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="세종대 융합창업연계전공 | 준비된 청년창업인 양성" />
        <meta property="og:description" content={SITE_CONFIG.description} />
        <meta property="og:url" content={SITE_CONFIG.url} />
        <meta property="og:image" content={`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`} />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:site_name" content={SITE_CONFIG.name} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="세종대 융합창업연계전공 | 준비된 청년창업인 양성" />
        <meta name="twitter:description" content={SITE_CONFIG.description} />
        <meta name="twitter:image" content={`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`} />

        {/* Canonical */}
        <link rel="canonical" href={SITE_CONFIG.url} />
      </Head>

      <JsonLd data={[organizationSchema, websiteSchema]} />

      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <AboutSection />
          <CurriculumSection />
          <ProcessSection />
          <ContactSection />
        </main>
        <Footer />
        <KakaoChatButton />
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}