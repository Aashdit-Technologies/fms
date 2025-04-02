import React, { useRef, useState, useEffect } from "react";
import JoditEditor from "jodit-react";

const SunEditorComponent = ({
  content,
  onContentChange,
  placeholder,
  onBlur,
}) => {
  const editor = useRef(null);
  const [currentContent, setCurrentContent] = useState(content);
  const [cursorPosition, setCursorPosition] = useState(null);
  const isUpdatingRef = useRef(false);
  const cursorPositions = useRef(null);

  const insertAtCursor = (text) => {
    if (editor.current) {
      saveCursorPosition();

      editor.current.s.insertHTML(text);

      restoreCursorPosition();

      const updatedContent = editor.current.getEditorValue();
      setCurrentContent(updatedContent);
      onContentChange?.(updatedContent);
    }
  };

  // Capture cursor position before typing or pasting
  const saveCursorPosition = () => {
    if (editor.current) {
      cursorPosition.current = editor.current.s.range.cloneRange();
    }
  };

  // Restore cursor position after typing or pasting
  const restoreCursorPosition = () => {
    if (editor.current && cursorPosition.current) {
      const range = cursorPosition.current;
      const selection = editor.current.s;

      selection.selectRange(range);
    }
  };
  useEffect(() => {
    if (editor.current && content !== currentContent) {
      editor.current.value = content;
    }
  }, [content]);

  const sanitizeContent = (newContent) => {
    const cleanedContent = newContent.replace(/<p><br><\/p>/g, "").trim();
    return cleanedContent || "";
  };
  const handleContentInput = (newContent) => {
    const sanitizedContent = sanitizeContent(newContent);
    if (!isUpdatingRef.current && sanitizedContent !== currentContent) {
      setCurrentContent(sanitizedContent);
      onContentChange?.(sanitizedContent);
    }
  };

  const config = {
    readonly: false,
    placeholder: placeholder || "",
    height: "350px",
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_clear_html",
    enter: "br",
    events: {
      beforePaste: (e) => {
        e.preventDefault(); 
        saveCursorPosition();
        const pastedContent = e.clipboardData.getData("text/plain") || e.clipboardData.getData("text/plain");
        if (pastedContent) {
          // Handle Excel and Word content
          insertAtCursor(pastedContent);
        }
        restoreCursorPosition();
      },
      beforeChange: saveCursorPosition,
      afterChange: restoreCursorPosition,
      afterInit: (instance) => {
        editor.current = instance;
      },
      focus: () => {
        if (editor.current) {
          editor.current.selection.restore();
        }
      },
      blur: () => {
        if (editor.current) {
          setTimeout(() => {
            const updatedContent = sanitizeContent(
              editor.current.getEditorValue()
            );
            setCurrentContent(updatedContent);
            onContentChange?.(updatedContent);
          }, 10);
        }
        if (onBlur) onBlur();
      },
      afterPaste: (e) => {
        const pastedContent =
          e.clipboardData.getData("text/html") ||
          e.clipboardData.getData("text/plain");

        if (!pastedContent) return;

        editor.current.selection.insertHTML(pastedContent);

        e.preventDefault();
      },
    },
  };

  useEffect(() => {
    if (editor.current) {
      editor.current.selection.restore();
    }
  }, [currentContent]);

  return (
    <div className="editor-wrapper">
      <JoditEditor
        ref={editor}
        value={currentContent}
        config={config}
        tabIndex={1}
        onBlur={(newContent) => handleContentInput(newContent)}
        onInput={(e) => handleContentInput(e.target.innerHTML)}
      />
      <style jsx>{`
        .editor-wrapper {
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          width: 100%;
        }
        :global(.jodit-workplace) {
          min-height: 400px;
          width: 100% !important; 
        }

        :global(.jodit-container) {
          width: 100% !important; 
        }

        :global(.jodit-wysiwyg) {
          width: 100% !important; 
        }
        :global(.jodit-status-bar) {
          background: #f8f9fa;
          border-top: 1px solid #ddd;
          width: 100% !important;
        }
        .editor-wrapper p {
          width: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default SunEditorComponent;
