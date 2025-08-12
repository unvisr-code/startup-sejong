import React from 'react';
import Link from 'next/link';
import { FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">세종대 융합창업연계전공</h3>
            <p className="text-gray-400 mb-4">
              세종대학교 유일의 창업교육으로 준비된 청년창업인을 양성합니다.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/sejong_startup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://youtu.be/DQ23hx55Y7A"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube size={24} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                  전공소개
                </a>
              </li>
              <li>
                <a href="#curriculum" className="text-gray-400 hover:text-white transition-colors">
                  교육과정
                </a>
              </li>
              <li>
                <a href="#process" className="text-gray-400 hover:text-white transition-colors">
                  지원절차
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">연락처</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 flex-shrink-0" />
                <span>서울특별시 광진구 능동로 209 세종대학교</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3" />
                <span>startup@sejong.ac.kr</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3" />
                <span>02-3408-3000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 세종대학교 융합창업연계전공. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;