import React, { useEffect, useState } from 'react';
import { sanitizeAdminPreview } from '../../lib/sanitize';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { showError } from '../../lib/toast';

// React Quill New를 dynamic import로 불러오기 (React 19 지원)
const ReactQuill = dynamic(
  () => import('react-quill-new'),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
  }
);

// Quill Image Resize Module을 dynamic import로 불러오기
let ImageResize: any = null;
if (typeof window !== 'undefined') {
  ImageResize = require('quill-image-resize-module-react').default;
}

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
  const [quillReady, setQuillReady] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Quill 모듈 등록
    if (typeof window !== 'undefined' && ImageResize) {
      const Quill = require('react-quill-new').Quill;
      if (Quill && !Quill.imports['modules/imageResize']) {
        Quill.register('modules/imageResize', ImageResize);
      }
      setQuillReady(true);
    }
  }, []);

  // Quill 모듈 설정 - react-quill-new에서 지원되는 기능만 사용
  const modules = {
    toolbar: [
      // 제목 스타일
      [{ 'header': [1, 2, 3, false] }],

      // 텍스트 스타일
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],

      // 목록 - check는 지원되지 않을 수 있으므로 제거
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],

      // 정렬
      [{ 'align': [] }],

      // 링크와 미디어
      ['link', 'image'],

      // 기타
      ['blockquote', 'code-block'],
      ['clean'] // 서식 지우기
    ],
    clipboard: {
      matchVisual: false // 붙여넣기 시 원본 스타일 유지
    },
    // 이미지 리사이즈 모듈 추가
    ...(ImageResize && quillReady ? {
      imageResize: {
        parchment: typeof window !== 'undefined' ? require('react-quill-new').Quill.import('parchment') : null,
        modules: ['Resize', 'DisplaySize', 'Toolbar']
      }
    } : {})
  };

  // Quill 포맷 설정 - 지원되는 포맷만 포함
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

  // 에러 발생 시 toast 알림 (최초 1회만)
  useEffect(() => {
    if (isError) {
      showError('에디터를 불러오는 중 문제가 발생했습니다. 텍스트 입력 모드로 전환됩니다.');
    }
  }, [isError]);

  // React Quill 렌더링을 try-catch로 감싸기
  try {
    return (
      <div className="rich-text-editor">
        <style dangerouslySetInnerHTML={{ __html: `
        .rich-text-editor .ql-toolbar {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem 0.5rem 0 0;
          background-color: #f9fafb;
          padding: 0.75rem !important;
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
          line-height: 1.6;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        /* 정렬 스타일 */
        .rich-text-editor .ql-editor .ql-align-center {
          text-align: center;
        }
        
        .rich-text-editor .ql-editor .ql-align-right {
          text-align: right;
        }
        
        .rich-text-editor .ql-editor .ql-align-justify {
          text-align: justify;
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
          cursor: pointer;
        }

        /* 이미지 리사이즈 핸들 스타일 */
        .rich-text-editor .ql-editor img.img-resize {
          position: relative;
        }

        .rich-text-editor .ql-editor .img-resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #2563eb;
          border: 1px solid white;
          border-radius: 2px;
          cursor: nwse-resize;
        }

        .rich-text-editor .ql-editor .img-resize-display-size {
          position: absolute;
          bottom: -30px;
          right: 0;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          pointer-events: none;
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
        
        /* 툴바 그룹 구분 */
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 15px !important;
        }
        
        /* 툴바 버튼 크기 조정 */
        .rich-text-editor .ql-toolbar button {
          width: 28px !important;
          height: 28px !important;
        }
        
        /* 드롭다운 크기 조정 */
        .rich-text-editor .ql-toolbar .ql-picker {
          height: 28px !important;
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
      
      <div className="flex justify-end items-center mt-2 text-xs text-gray-500">
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