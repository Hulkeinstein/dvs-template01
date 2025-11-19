import React, { forwardRef } from 'react';
import dynamic from 'next/dynamic';
import type { IJodit } from 'jodit/esm/types/jodit';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

interface TextEditorWrapperProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string, event: MouseEvent) => void;
  config?: Record<string, unknown>;
  className?: string;
  id?: string;
  name?: string;
  tabIndex?: number;
  editorRef?: (editor: IJodit) => void;
}

// CSP 호환 기본 설정
const defaultConfig = {
  readonly: false,
  toolbar: true,
  spellcheck: true,
  language: 'auto',
  toolbarButtonSize: 'middle' as const,
  toolbarAdaptive: false,
  showCharsCounter: true,
  showWordsCounter: true,
  showXPathInStatusbar: false,
  askBeforePasteHTML: true,
  askBeforePasteFromWord: true,
  defaultActionOnPaste: 'insert_as_html' as const,
  // CSP 위반 방지: 외부 스크립트 로드 비활성화
  beautifyHTML: false, // js-beautify CDN 로드 차단
  useSearch: false, // 외부 검색 스크립트 로드 차단
  iframe: false, // iframe 비활성화
  iframeStyle: '',
  iframeCSSLinks: [],
};

const TextEditorWrapper = forwardRef<IJodit, TextEditorWrapperProps>(
  (props, ref) => {
    // 사용자 config와 기본 config 병합
    const mergedConfig = { ...defaultConfig, ...props.config };
    return <JoditEditor {...props} config={mergedConfig} ref={ref} />;
  }
);

TextEditorWrapper.displayName = 'TextEditorWrapper';

export default TextEditorWrapper;
