'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes, FaRocket } from 'react-icons/fa';
import ApplicationModal from '../Modal/ApplicationModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { href: '#about', label: '전공소개' },
    { href: '#curriculum', label: '교육과정' },
    { href: '#process', label: '지원절차' },
    { href: '#contact', label: '문의하기' },
  ];

  const handleApplyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FaRocket className="text-white text-xl" />
            </div>
            <div>
              <span className="font-bold text-xl gradient-text">LEAN STARTUP LAB</span>
              <span className="block text-xs text-gray-600">세종대 융합창업전공</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-primary transition-colors duration-300 font-medium"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#apply"
              onClick={handleApplyClick}
              className="bg-gradient-primary text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              지원하기
            </a>
          </div>

          <button
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-lg mt-2 py-4">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#apply"
              className="block mx-4 mt-3 bg-gradient-primary text-white text-center py-3 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={(e) => {
                handleApplyClick(e);
                setIsMenuOpen(false);
              }}
            >
              지원하기
            </a>
          </div>
        )}
      </nav>
    </header>
    <ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;