import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import JoditEditor from "jodit-react";

const CorrespondenceEditor = ({ defaultText, onTextUpdate, placeholder }) => {
  const [contents, setContents] = useState(defaultText || "");
  const editorRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const editorInstanceRef = useRef(null);

  useEffect(() => {
    if (defaultText !== contents && !isUpdatingRef.current) {
      setContents(defaultText || "");
    }
  }, [defaultText]);

  const handleEditorChange = useCallback((newContent) => {
    setContents(newContent);
    // Notify parent immediately to keep editors in sync
    onTextUpdate?.(newContent);
  }, [onTextUpdate]);

  const handleEditorFocus = useCallback(() => {
    if (editorRef.current?.editor) {
      editorInstanceRef.current = editorRef.current.editor;
      editorInstanceRef.current.selection?.focus();
    }
  }, []);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: placeholder || "Start typing...",
    height: 400,
    // Improve focus handling
    events: {
      afterInit: (jodit) => {
        editorInstanceRef.current = jodit;
        jodit.e.on('blur', () => {
          // Prevent focus from jumping to toolbar
          setTimeout(() => {
            if (document.activeElement.tagName === 'BODY') {
              jodit.selection.focus();
            }
          }, 0);
        });
      }
    }
  }), [placeholder]);

  return (
    <JoditEditor
      ref={editorRef}
      value={contents}
      config={config}
      onChange={handleEditorChange}
      onFocus={handleEditorFocus}
      onBlur={handleEditorFocus}
    />
  );
};

export default React.memo(CorrespondenceEditor);
