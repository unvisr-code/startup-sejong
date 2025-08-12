import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="세종대학교 융합창업연계전공 - 준비된 청년창업인을 양성하는 창업 학위과정" />
        <meta name="keywords" content="세종대학교, 융합창업, 창업교육, 스타트업, 창업전공" />
        <meta property="og:title" content="세종대 융합창업연계전공" />
        <meta property="og:description" content="융합창업, 아이디어가 현실이 되는 과정" />
        <meta property="og:image" content="/api/og" />
        <link rel="icon" href="/logo.png" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}