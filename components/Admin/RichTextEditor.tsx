import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// React Quill을 dynamic import로 불러오기 (SSR 문제 방지)
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    // CSS를 dynamic import 내에서 처리
    await import('react-quill/dist/quill.snow.css');
    return RQ;
  },
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = '내용을 입력하세요...',
  height = '400px'
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Quill 모듈 설정
  const modules = {
    toolbar: [
      // 제목 스타일
      [{ 'header': [1, 2, 3, false] }],
      
      // 텍스트 스타일
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      
      // 목록
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      
      // 정렬
      [{ 'align': [] }],
      
      // 링크와 이미지
      ['link', 'image'],
      
      // 기타
      ['blockquote', 'code-block'],
      ['clean'] // 서식 지우기
    ]
  };

  // Quill 포맷 설정
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image',
    'blockquote', 'code-block'
  ];

  // 커스텀 스타일
  const editorStyle = {
    height: height,
    backgroundColor: 'white'
  };

  if (!isClient) {
    return <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />;
  }

  // 에러 발생 시 폴백 UI
  if (isError) {
    return (
      <div className="border border-gray-300 rounded-lg p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 border-0 outline-none resize-none"
          style={{ minHeight: height }}
        />
      </div>
    );
  }

  // React Quill 렌더링을 try-catch로 감싸기
  try {
    return (
      <div className="rich-text-editor">
        <style dangerouslySetInnerHTML={{ __html: `
        .rich-text-editor .ql-toolbar {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem 0.5rem 0 0;
          background-color: #f9fafb;
        }
        
        .rich-text-editor .ql-container {
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
          font-size: 16px;
          font-family: inherit;
        }
        
        .rich-text-editor .ql-editor {
          min-height: ${height};
          padding: 1rem;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        .rich-text-editor .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        .rich-text-editor .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        .rich-text-editor .ql-editor h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }
        
        .rich-text-editor .ql-editor p {
          margin: 1em 0;
        }
        
        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
        }
        
        .rich-text-editor .ql-editor pre {
          background-color: #f3f4f6;
          border-radius: 0.375rem;
          padding: 1em;
          margin: 1em 0;
          overflow-x: auto;
        }
        
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1em 0;
        }
        
        /* 툴바 아이콘 hover 효과 */
        .rich-text-editor .ql-toolbar button:hover {
          background-color: #e5e7eb;
          border-radius: 0.25rem;
        }
        
        .rich-text-editor .ql-toolbar button.ql-active {
          background-color: #dbeafe;
          color: #2563eb;
        }
        
        /* 드롭다운 스타일 */
        .rich-text-editor .ql-toolbar .ql-picker-label:hover {
          background-color: #e5e7eb;
          border-radius: 0.25rem;
        }
      ` }} />
      
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={editorStyle}
      />
      
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>
          💡 Tip: 이미지는 드래그 앤 드롭하거나 도구 모음의 이미지 버튼을 사용하세요
        </span>
        <span>
          글자 수: {value.replace(/<[^>]*>/g, '').length}자
        </span>
      </div>
    </div>
  );
  } catch (error) {
    console.error('RichTextEditor error:', error);
    setIsError(true);
    return (
      <div className="border border-gray-300 rounded-lg p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 border-0 outline-none resize-none"
          style={{ minHeight: height }}
        />
      </div>
    );
  }
};

export default RichTextEditor;