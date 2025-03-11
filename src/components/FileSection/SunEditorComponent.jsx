import React, { useRef, useState, useEffect } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder, onBlur }) => {
  const editor = useRef(null);
  const [currentContent, setCurrentContent] = useState(content);
  const [cursorPosition, setCursorPosition] = useState(null);
  const isUpdatingRef = useRef(false); 

  useEffect(() => {
    // Set initial content when component mounts or content changes
    if (editor.current && content !== currentContent) {
      editor.current.value = content;
    }
  }, [content]);

  const handleContentInput = (newContent) => {
    if (!isUpdatingRef.current && newContent !== currentContent) {
      setCurrentContent(newContent);
      onContentChange?.(newContent);
    }
  };

  const config = {
    readonly: false,
    placeholder: placeholder || '',
    height: '300px',
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_clear_html',
    events: {
      beforeChange: () => {
        if (editor.current) {
          const range = editor.current.selection.get();
          setCursorPosition(range); // Save current cursor position
        }
      },
      afterChange: () => {
        if (editor.current && cursorPosition) {
          editor.current.selection.set(cursorPosition);
        }
      },
      afterInit: (instance) => {
        editor.current = instance;
      },
      focus: () => {
        if (editor.current) {
          editor.current.selection.restore(); // Restore the cursor on focus
        }
      },
      // Immediate save on blur with small timeout to ensure sync
      blur: () => {
        if (editor.current) {
          setTimeout(() => {
            const updatedContent = editor.current.getEditorValue();
            setCurrentContent(updatedContent); // Update the state with the new content
            onContentChange?.(updatedContent); // Notify parent with updated content
          }, 10); // Small delay to ensure internal state is updated
        }
        if (onBlur) onBlur(); // Call the onBlur prop if available
      },
    },
  };

  useEffect(() => {
    if (editor.current) {
      editor.current.selection.restore(); // Restore the cursor when component re-renders
    }
  }, [currentContent]);

  return (
    <div className="editor-wrapper">
      <JoditEditor
        ref={editor}
        value={currentContent}  // Use the local state `currentContent`
        config={config}
        tabIndex={1}
        onInput={(e) => handleContentInput(e.target.innerHTML)} 
      />
      <style jsx>{`
        .editor-wrapper {
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        :global(.jodit-workplace) {
          min-height: 400px;
        }
        :global(.jodit-status-bar) {
          background: #f8f9fa;
          border-top: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
};

export default SunEditorComponent;
