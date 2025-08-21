import React from 'react';
import Link from 'next/link';
import { FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="col-span-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold mb-2 sm:mb-3">바로가기</h3>
                <ul className="space-y-1">
                  <li>
                    <button 
                      onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left text-xs sm:text-sm"
                    >
                      전공소개
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left text-xs sm:text-sm"
                    >
                      교육과정
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left text-xs sm:text-sm"
                    >
                      지원절차
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left text-xs sm:text-sm"
                    >
                      문의하기
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold mb-2 sm:mb-3">연락처</h3>
                <ul className="space-y-1 text-gray-400">
                  <li className="text-xs sm:text-sm break-keep">세종대학교 린스타트업랩</li>
                  <li className="text-xs sm:text-sm">02-3408-3360</li>
                  <li className="text-xs sm:text-sm break-all">cscsejong@sejong.ac.kr</li>
                  <li className="flex space-x-3 mt-2">
                    <a
                      href="https://www.instagram.com/sejong_startup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="Instagram"
                    >
                      <FaInstagram size={20} />
                    </a>
                    <a
                      href="https://youtu.be/DQ23hx55Y7A"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="YouTube"
                    >
                      <FaYoutube size={20} />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm sm:text-base font-bold mb-2 sm:mb-3">세종대 융합창업연계전공</h3>
            <p className="text-gray-400 mb-2 sm:mb-3 text-xs sm:text-sm break-keep">
              세종대학교 유일의 창업교육으로 준비된 청년창업인을 양성합니다.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mb-2">
              <FaMapMarkerAlt className="inline mr-1" />
              서울특별시 광진구 능동로 209 세종대학교
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-4 sm:mt-6 pt-3 sm:pt-4 text-center text-gray-400">
          <p className="text-xs sm:text-sm">&copy; 2025 세종대학교 융합창업연계전공. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;