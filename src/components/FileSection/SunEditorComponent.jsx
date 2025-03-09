import React, { useRef, useMemo, useCallback } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder, selectedNote, additionalDetails, onBlur }) => {
  const editor = useRef(null);
  const isUpdatingRef = useRef(false);
  console.log('Editor content:', content);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: !content ? placeholder : '',
      height: '300px',
      toolbarButtonSize: 'medium',
      enableDragAndDropFileToEditor: false,
      uploader: { insertImageAsBase64URI: true },
      useSearch: false,
      removeButtons: ['about'],
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      // Prevent focus loss and improve performance
      events: {
        beforeSetValueToEditor: () => {
          if (isUpdatingRef.current) return false;
          return true;
        },
        afterInit: (instance) => {
          // Improve focus handling
          instance.events.on('blur', () => {
            if (onBlur) onBlur();
          });
        },
        focus: () => {
          // Prevent unnecessary updates when editor gets focus
          isUpdatingRef.current = true;
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }
      },
      // Reduce unnecessary rerenders
      defaultActionOnPaste: 'insert_as_html',
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false
    }),
    [content, placeholder, onBlur]
  );

  const handleContentChange = useCallback((newContent) => {
    console.log('Editor content changed:', newContent);
    if (!isUpdatingRef.current && newContent !== content) {
      isUpdatingRef.current = true;
      onContentChange?.(newContent);
      // Use a longer timeout to ensure the update completes
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 200);
    }
  }, [onContentChange, content]);

  return (
    <div className="editor-wrapper">
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        tabIndex={1}
        onChange={handleContentChange}
        onBlur={onBlur}
        onReady={(instance) => {
          // Set initial content when editor is ready
          instance.value = content;
        }}
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
