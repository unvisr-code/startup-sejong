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

export default function Home() {
  return (
    <>
      <Head>
        <title>세종대 융합창업연계전공 | 준비된 청년창업인 양성</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

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