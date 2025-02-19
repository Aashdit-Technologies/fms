import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder, selectedNote, additionalDetails }) => {
  const editor = useRef(null);
  const [editorContent, setEditorContent] = useState(content || '');

  
    useEffect(() => {
      const newContent = content || additionalDetails?.data?.note || selectedNote?.note || '';
      console.log('Updating editor content:', newContent);

      // Only update content if it's different from the current state
      if (newContent !== editorContent) {
        setEditorContent(newContent);
        
        // Force update the editor's value without triggering a re-render
        if (editor.current?.editor) {
          editor.current.editor.value = newContent;
        }
      }
    }, [content, additionalDetails, selectedNote, editorContent]);

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
    
    if (editor.current?.editor && editor.current.editor.value !== newContent) {
      editor.current.editor.value = newContent;
    }
  }, [onContentChange]);

  return (
    <div className="editor-wrapper">
      <JoditEditor
        ref={editor}
        value={editorContent}
        config={config}
        tabIndex={1}
        onBlur={handleContentChange}
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
