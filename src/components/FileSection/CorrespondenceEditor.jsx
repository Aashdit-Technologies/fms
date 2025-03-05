import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import JoditEditor from "jodit-react";

const CorrespondenceEditor = ({ defaultText, onTextUpdate, placeholder }) => {
  const [contents, setContents] = useState(defaultText || "");
  const editorRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const editorInstanceRef = useRef(null);
  const cursorPositionRef = useRef(null);

  // Update content when defaultText changes
  useEffect(() => {
    if (defaultText !== contents && !isUpdatingRef.current) {
      setContents(defaultText || "");
    }
  }, [defaultText]);

  // Handle editor content changes
  const handleEditorChange = useCallback(
    (newContent) => {
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true;

        // Save cursor position before updating content
        if (editorInstanceRef.current) {
          cursorPositionRef.current = editorInstanceRef.current.selection.save();
        }

        setContents(newContent);
        onTextUpdate?.(newContent);

        // Restore cursor position after updating content
        if (editorInstanceRef.current && cursorPositionRef.current) {
          requestAnimationFrame(() => {
            editorInstanceRef.current.selection.restore(cursorPositionRef.current);
            editorInstanceRef.current.selection.focus();
            isUpdatingRef.current = false;
          });
        } else {
          isUpdatingRef.current = false;
        }
      }
    },
    [onTextUpdate]
  );

  // Handle editor focus
  const handleEditorFocus = useCallback(() => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current.selection.focus();
    }
  }, []);

  // Editor configuration
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: '',
      height: 400,
      saveCursorPosition: true, 
      events: {
        afterInit: (jodit) => {
          editorInstanceRef.current = jodit;
          jodit.e.on("blur", () => {
            setTimeout(() => {
              if (document.activeElement.tagName === "BODY") {
                jodit.selection.focus();
              }
            }, 0);
          });
        },
        afterBlur: () => {
          if (document.activeElement.tagName === "BODY") {
            editorInstanceRef.current?.selection.focus();
          }
        },
      },
    }),
    []
  );

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
