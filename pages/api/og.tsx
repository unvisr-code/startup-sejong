import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default function handler(req: NextRequest) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #2974FF 0%, #0099FE 100%)',
            color: 'white',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              fontSize: '24px',
              fontWeight: '600',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '10px 20px',
              borderRadius: '30px',
            }}
          >
            세종대학교 유일 창업 학위과정
          </div>
          
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              marginBottom: '30px',
              textAlign: 'center',
            }}
          >
            세종대 융합창업연계전공
          </h1>
          
          <p
            style={{
              fontSize: '36px',
              marginBottom: '40px',
              opacity: 0.95,
            }}
          >
            융합창업, 아이디어가 현실이 되는 과정
          </p>
          
          <div
            style={{
              fontSize: '24px',
              textAlign: 'center',
              lineHeight: '1.6',
              opacity: 0.9,
              maxWidth: '800px',
            }}
          >
            창업 기초부터 실전까지, 체계적인 교육과정으로<br />
            준비된 청년창업인으로 성장하세요
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}