import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder, selectedNote, additionalDetails }) => {
  const editor = useRef(null);
  const [editorContent, setEditorContent] = useState(content || '');
console.log('Editor content:', additionalDetails?.data?.note);

  
  // Initialize editor content
  useEffect(() => {
    const newContent = content || additionalDetails?.data?.note || selectedNote?.note || '';
    console.log('Updating editor content:', newContent);
    setEditorContent(newContent);
  }, [content, additionalDetails, selectedNote]);


  // Update editor value when it's ready
  useEffect(() => {
    if (editor.current?.editor) {
      editor.current.editor.value = editorContent;
    }
  }, [editorContent, editor.current]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: !editorContent ? placeholder : '',
      height: '300px',
      toolbarButtonSize: 'medium',
      enableDragAndDropFileToEditor: false,
      uploader: { insertImageAsBase64URI: true },
      useSearch: false,
      removeButtons: ['about'],
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      
    }),
    [editorContent, placeholder]
  );

  const handleContentChange = useCallback((newContent) => {
    console.log('Editor content changed:', newContent);
    setEditorContent(newContent);
    onContentChange?.(newContent);
  }, [onContentChange]);

  return (
    <div className="editor-wrapper">
      <JoditEditor
        ref={editor}
        value={editorContent}
        config={config}
        tabIndex={1}
        onChange={handleContentChange}
        onReady={(instance) => {
          // Set initial content when editor is ready
          instance.value = editorContent;
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
