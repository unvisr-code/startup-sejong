'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaBars, FaTimes, FaRocket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicationModal from '../Modal/ApplicationModal';

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Check if current page has a gradient hero section
  const hasGradientHero = router.pathname === '/announcements' || 
                          router.pathname === '/calendar' ||
                          router.pathname.startsWith('/announcements/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const menuItems = [
    { href: 'about', label: '전공소개', isSection: true },
    { href: 'curriculum', label: '교육과정', isSection: true },
    { href: '/announcements', label: '공지사항', isSection: false },
    { href: '/calendar', label: '학사일정', isSection: false },
    { href: 'process', label: '지원절차', isSection: true },
    { href: 'contact', label: '문의하기', isSection: true },
  ];

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // 헤더 높이만큼 오프셋 추가
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 
        hasGradientHero ? 'bg-transparent' : 'bg-transparent'
      }`}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FaRocket className="text-white text-xl" />
            </div>
            <div>
              <span className={`font-bold text-xl ${
                isScrolled ? 'gradient-text' : 
                hasGradientHero ? 'text-white' : 'text-white'
              }`}>세종대 융합창업전공</span>
              <span className={`block text-xs ${
                isScrolled ? 'text-gray-600' : 
                hasGradientHero ? 'text-white/80' : 'text-white/80'
              }`}>LEAN STARTUP LAB</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              item.isSection ? (
                <a
                  key={item.href}
                  href="#"
                  onClick={(e) => handleMenuClick(e, item.href)}
                  className={`${
                    isScrolled ? 'text-gray-700 hover:text-primary' : 
                    hasGradientHero ? 'text-white hover:text-white/80' : 'text-white hover:text-white/80'
                  } transition-colors duration-300 font-medium cursor-pointer`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    isScrolled ? 'text-gray-700 hover:text-primary' : 
                    hasGradientHero ? 'text-white hover:text-white/80' : 'text-white hover:text-white/80'
                  } transition-colors duration-300 font-medium cursor-pointer`}
                >
                  {item.label}
                </Link>
              )
            ))}
            <button
              onClick={handleApplyClick}
              className={`px-6 py-2 rounded-full transition-all duration-300 cursor-pointer font-bold ${
                isScrolled 
                  ? 'bg-gradient-primary text-white hover:shadow-lg' 
                  : hasGradientHero
                    ? 'border-2 border-white text-white hover:bg-white hover:text-primary'
                    : 'border-2 border-white text-white hover:bg-white hover:text-primary'
              }`}
            >
              지원하기
            </button>
          </div>

          <button
            className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
              isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기/닫기"
            aria-expanded={isMenuOpen}
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMenuOpen ? (
                <FaTimes className={`text-2xl ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
              ) : (
                <FaBars className={`text-2xl ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
              )}
            </motion.div>
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute left-0 right-0 bg-white/95 backdrop-blur-lg shadow-2xl rounded-b-2xl mt-2 overflow-hidden"
            >
              <div className="py-2">
                {menuItems.map((item, index) => (
                  item.isSection ? (
                    <a
                      key={item.href}
                      href="#"
                      className="block px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent hover:text-primary transition-all duration-200 cursor-pointer font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      onClick={(e) => handleMenuClick(e, item.href)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent hover:text-primary transition-all duration-200 cursor-pointer font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
                <div className="px-4 py-3 border-t border-gray-100">
                  <button
                    className="w-full bg-gradient-primary text-white text-center py-3 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    onClick={handleApplyClick}
                  >
                    지원하기
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
    <ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;