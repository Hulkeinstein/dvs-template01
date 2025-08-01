import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Jodit Editor를 동적으로 import (SSR 비활성화)
const JoditEditor = dynamic(() => import("jodit-react"), { 
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

// 안전한 기본값 처리
const getSafeValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '<p><br></p>'; // Jodit이 기대하는 기본 HTML 구조
  }
  return value;
};

const TextEditorWrapper = (props) => {
  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    // 클라이언트 사이드 확인
    setIsClient(true);
    
    // Bootstrap Modal과의 충돌 방지를 위한 전역 처리
    const handleModalFocus = () => {
      // 에디터의 팝업이 열려있을 때 Modal backdrop의 포인터 이벤트 비활성화
      const joditPopups = document.querySelectorAll('.jodit-popup');
      const modalBackdrop = document.querySelector('.modal-backdrop');
      
      if (joditPopups.length > 0 && modalBackdrop) {
        modalBackdrop.style.pointerEvents = 'none';
      } else if (modalBackdrop) {
        modalBackdrop.style.pointerEvents = '';
      }
    };

    // MutationObserver로 DOM 변경 감지
    const observer = new MutationObserver(handleModalFocus);
    
    if (isClient) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // 키보드 이벤트 가로채기 (Delete/Backspace 에러 방지)
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('jodit-wysiwyg')) {
          const content = activeElement.innerHTML;
          // 에디터가 거의 비어있을 때 기본 동작 차단
          if (!content || content === '<br>' || content === '<p><br></p>' || content.trim() === '') {
            e.preventDefault();
            // 안전한 기본 구조 설정
            activeElement.innerHTML = '<p><br></p>';
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isClient]);

  // SSR 방지
  if (!isClient) {
    return <div>Loading...</div>;
  }

  // props를 처리하되, value는 안전하게 변환
  const { ref, value, onChange, onBlur, ...editorProps } = props;
  
  // 안전한 onChange 핸들러
  const safeOnChange = (newContent) => {
    // 빈 내용이거나 잘못된 내용인 경우 기본값으로 처리
    if (!newContent || newContent === '<br>' || newContent.trim() === '') {
      newContent = '<p><br></p>';
    }
    if (onChange) {
      onChange(newContent);
    }
  };

  // 안전한 onBlur 핸들러
  const safeOnBlur = (newContent) => {
    if (!newContent || newContent === '<br>' || newContent.trim() === '') {
      newContent = '<p><br></p>';
    }
    if (onBlur) {
      onBlur(newContent);
    }
  };

  return (
    <div className="jodit-editor-wrapper">
      <JoditEditor 
        ref={editorRef}
        value={getSafeValue(value)}
        onChange={safeOnChange}
        onBlur={safeOnBlur}
        {...editorProps} 
      />
    </div>
  );
};

export default TextEditorWrapper;