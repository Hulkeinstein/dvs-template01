import React, { useEffect, useRef, useState, useImperativeHandle } from "react";
import dynamic from "next/dynamic";

// Quill을 동적으로 import (SSR 비활성화)
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      minHeight: '200px', 
      backgroundColor: '#f5f5f5', 
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      border: '1px solid #ddd'
    }}>
      <span style={{ color: '#666' }}>Loading editor...</span>
    </div>
  )
});

// 커스텀 폰트 설정을 위한 초기화 함수
const initializeQuillFonts = () => {
  if (typeof window !== 'undefined') {
    // ReactQuill이 로드된 후 Quill 접근
    const checkQuill = () => {
      if (window.Quill || (ReactQuill && ReactQuill.Quill)) {
        const Quill = window.Quill || ReactQuill.Quill;
        try {
          const Font = Quill.import('formats/font');
          Font.whitelist = [
            'nanumgothic',
            'nanummyeongjo',
            'nanumpen',
            'notosanskr',
            'gothica1',
            'jua',
            'dohyeon',
            'malgun-gothic', 
            'arial',
            'georgia',
            'times-new-roman',
            'courier-new',
            'verdana'
          ];
          Quill.register(Font, true);
        } catch (error) {
          console.warn('Failed to initialize Quill fonts:', error);
        }
      } else {
        // Quill이 아직 로드되지 않았다면 재시도
        setTimeout(checkQuill, 100);
      }
    };
    checkQuill();
  }
};

// Quill 툴바 설정
const modules = {
  toolbar: {
    container: [
      [{ 'font': ['', 'nanumgothic', 'nanummyeongjo', 'nanumpen', 'notosanskr', 'gothica1', 'jua', 'dohyeon', 'malgun-gothic', 'arial', 'georgia', 'times-new-roman', 'courier-new', 'verdana'] }],
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    handlers: {
      // 커스텀 링크 핸들러
      link: function(value) {
        if (value) {
          const href = prompt('링크 URL을 입력하세요:');
          if (href) {
            this.quill.format('link', href);
          }
        } else {
          this.quill.format('link', false);
        }
      },
      // 커스텀 비디오 핸들러
      video: function() {
        const url = prompt('YouTube 또는 Vimeo URL을 입력하세요:');
        if (url) {
          // YouTube URL 처리
          const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
          if (youtubeMatch) {
            const videoId = youtubeMatch[1];
            const placeholder = `<div class="video-placeholder" data-video-type="youtube" data-video-id="${videoId}" contenteditable="false" style="background: #f0f0f0; border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; cursor: pointer;">
              <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
              <div style="font-weight: bold;">YouTube Video</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">ID: ${videoId}</div>
              <div style="font-size: 11px; color: #999; margin-top: 5px;">(저장 시 영상으로 변환됩니다)</div>
            </div>`;
            const range = this.quill.getSelection(true);
            this.quill.clipboard.dangerouslyPasteHTML(range.index, placeholder);
            return;
          }
          
          // Vimeo URL 처리
          const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
          if (vimeoMatch) {
            const videoId = vimeoMatch[1];
            const placeholder = `<div class="video-placeholder" data-video-type="vimeo" data-video-id="${videoId}" contenteditable="false" style="background: #f0f0f0; border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; cursor: pointer;">
              <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
              <div style="font-weight: bold;">Vimeo Video</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">ID: ${videoId}</div>
              <div style="font-size: 11px; color: #999; margin-top: 5px;">(저장 시 영상으로 변환됩니다)</div>
            </div>`;
            const range = this.quill.getSelection(true);
            this.quill.clipboard.dangerouslyPasteHTML(range.index, placeholder);
            return;
          }
          
          alert('올바른 YouTube 또는 Vimeo URL을 입력해주세요.');
        }
      }
    }
  }
};

// 안전한 기본값 처리
const getSafeValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '<p><br></p>';
  }
  return value;
};

const TextEditorWrapper = React.forwardRef((props, ref) => {
  const [isClient, setIsClient] = useState(false);
  const quillRef = useRef(null);
  const { value, onChange, onBlur, ...otherProps } = props;

  // ref를 외부로 노출
  useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current?.getEditor(),
    focus: () => quillRef.current?.focus(),
    blur: () => quillRef.current?.blur()
  }), []);

  useEffect(() => {
    // 클라이언트 사이드 확인
    setIsClient(true);
    
    // Quill 스타일시트 동적 로드
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/react-quill@2.0.0/dist/quill.snow.css';
      document.head.appendChild(link);
      
      // 폰트 초기화
      initializeQuillFonts();
      
      return () => {
        // Cleanup: 스타일시트 제거
        const existingLink = document.querySelector('link[href*="quill.snow.css"]');
        if (existingLink) {
          existingLink.remove();
        }
      };
    }
  }, []);

  // SSR 방지
  if (!isClient) {
    return <div>Loading...</div>;
  }

  // 안전한 onChange 핸들러
  const handleChange = (content, delta, source, editor) => {
    // Quill은 빈 에디터일 때 "<p><br></p>"를 반환
    const isEmpty = content === '<p><br></p>';
    
    if (onChange) {
      onChange(isEmpty ? '' : content);
    }
  };

  // 안전한 onBlur 핸들러
  const handleBlur = () => {
    if (onBlur && quillRef.current) {
      const editor = quillRef.current.getEditor();
      const content = editor.root.innerHTML;
      const isEmpty = content === '<p><br></p>';
      onBlur(isEmpty ? '' : content);
    }
  };

  return (
    <div className="quill-editor-wrapper">
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={getSafeValue(value)}
        onChange={handleChange}
        onBlur={handleBlur}
        modules={modules}
        placeholder="Start typing..."
        {...otherProps}
      />
      <style jsx global>{`
        .quill-editor-wrapper .ql-container {
          min-height: 200px;
          font-size: 16px;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 200px;
        }
        /* Modal 내에서 z-index 조정 */
        .modal .ql-tooltip {
          z-index: 10000;
        }
        
        /* 폰트 드롭다운 스타일 */
        .ql-snow .ql-picker.ql-font {
          width: 150px;
        }
        
        /* 나눔고딕 */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="nanumgothic"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="nanumgothic"]::before {
          content: "나눔고딕";
          font-family: "Nanum Gothic", sans-serif;
        }
        .ql-font-nanumgothic {
          font-family: "Nanum Gothic", sans-serif;
        }
        
        /* 맑은고딕 */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="malgun-gothic"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="malgun-gothic"]::before {
          content: "맑은고딕";
          font-family: "Malgun Gothic", sans-serif;
        }
        .ql-font-malgun-gothic {
          font-family: "Malgun Gothic", sans-serif;
        }
        
        /* 나눔명조 */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="nanummyeongjo"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="nanummyeongjo"]::before {
          content: "나눔명조";
          font-family: "Nanum Myeongjo", serif;
        }
        .ql-font-nanummyeongjo {
          font-family: "Nanum Myeongjo", serif;
        }
        
        /* Gothic A1 */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="gothica1"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="gothica1"]::before {
          content: "Gothic A1";
          font-family: "Gothic A1", sans-serif;
        }
        .ql-font-gothica1 {
          font-family: "Gothic A1", sans-serif;
        }
        
        /* 주아 */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="jua"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="jua"]::before {
          content: "주아";
          font-family: "Jua", sans-serif;
        }
        .ql-font-jua {
          font-family: "Jua", sans-serif;
        }
        
        /* 나눔펜 */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="nanumpen"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="nanumpen"]::before {
          content: "나눔펜";
          font-family: "Nanum Pen Script", cursive;
        }
        .ql-font-nanumpen {
          font-family: "Nanum Pen Script", cursive;
        }
        
        /* 노토 산스 KR */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="notosanskr"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="notosanskr"]::before {
          content: "노토 산스 KR";
          font-family: "Noto Sans KR", sans-serif;
        }
        .ql-font-notosanskr {
          font-family: "Noto Sans KR", sans-serif;
        }
        
        /* 도현 */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="dohyeon"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="dohyeon"]::before {
          content: "도현";
          font-family: "Do Hyeon", sans-serif;
        }
        .ql-font-dohyeon {
          font-family: "Do Hyeon", sans-serif;
        }
        
        /* Arial */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before {
          content: "Arial";
          font-family: Arial, sans-serif;
        }
        .ql-font-arial {
          font-family: Arial, sans-serif;
        }
        
        /* Georgia */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="georgia"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before {
          content: "Georgia";
          font-family: Georgia, serif;
        }
        .ql-font-georgia {
          font-family: Georgia, serif;
        }
        
        /* Times New Roman */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times-new-roman"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times-new-roman"]::before {
          content: "Times New Roman";
          font-family: "Times New Roman", serif;
        }
        .ql-font-times-new-roman {
          font-family: "Times New Roman", serif;
        }
        
        /* Courier New */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="courier-new"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="courier-new"]::before {
          content: "Courier New";
          font-family: "Courier New", monospace;
        }
        .ql-font-courier-new {
          font-family: "Courier New", monospace;
        }
        
        /* Verdana */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="verdana"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="verdana"]::before {
          content: "Verdana";
          font-family: Verdana, sans-serif;
        }
        .ql-font-verdana {
          font-family: Verdana, sans-serif;
        }
        
        /* 기본 폰트 (Sans Serif) */
        .ql-snow .ql-picker.ql-font .ql-picker-label::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item::before {
          content: "기본 폰트";
        }
      `}</style>
    </div>
  );
});

TextEditorWrapper.displayName = 'TextEditorWrapper';

export default TextEditorWrapper;