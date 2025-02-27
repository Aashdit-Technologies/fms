import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import JoditEditor from "jodit-react";

// This is a specialized editor component for use in modals
// It's isolated from the other editors to prevent content syncing issues
const ModalEditor = ({ defaultText, onTextUpdate, placeholder }) => {
  const [contents, setContents] = useState(defaultText || "");
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const isInternalUpdate = useRef(false);

  // Update content when defaultText prop changes
  useEffect(() => {
    if (defaultText !== contents && !isInternalUpdate.current) {
      setContents(defaultText || "");
    }
  }, [defaultText, contents]);

  const handleEditorChange = useCallback((newContent) => {
    isInternalUpdate.current = true;
    setContents(newContent);
    
    // Notify parent of content change
    onTextUpdate?.(newContent);
    
    // Reset the internal update flag after a short delay
    setTimeout(() => {
      isInternalUpdate.current = false;
    }, 100);
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

export default React.memo(ModalEditor);
