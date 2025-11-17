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

const TextEditorWrapper = forwardRef<IJodit, TextEditorWrapperProps>(
  (props, ref) => {
    return <JoditEditor {...props} ref={ref} />;
  }
);

TextEditorWrapper.displayName = 'TextEditorWrapper';

export default TextEditorWrapper;
