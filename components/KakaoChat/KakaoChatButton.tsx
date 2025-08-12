'use client';

import React, { useEffect } from 'react';
import { FaComment } from 'react-icons/fa';

declare global {
  interface Window {
    Kakao: any;
  }
}

const KakaoChatButton = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init('5a0289570935a7da911263629d4000c0');
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openKakaoChat = () => {
    if (window.Kakao && window.Kakao.Channel) {
      window.Kakao.Channel.chat({
        channelPublicId: '_RqLxan',
      });
    } else {
      window.open('https://pf.kakao.com/_RqLxan/chat', '_blank');
    }
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