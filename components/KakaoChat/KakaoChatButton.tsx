'use client';

import React from 'react';
import { FaComment } from 'react-icons/fa';

const KakaoChatButton = () => {
  const openKakaoChat = () => {
    // 카카오톡 채널 채팅 URL로 직접 연결
    window.open('http://pf.kakao.com/_RqLxan/chat', '_blank');
  };

  return (
    <button
      onClick={openKakaoChat}
      className="fixed bottom-6 right-6 z-50 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="카카오톡 채팅 상담"
    >
      <FaComment size={24} />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        카카오톡 문의하기
      </span>
    </button>
  );
};

export default KakaoChatButton;