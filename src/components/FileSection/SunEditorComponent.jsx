import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder, selectedNote, additionalDetails }) => {
  const editor = useRef(null);
  const [editorContent, setEditorContent] = useState(content || '');

  // Update editor content when props change, but maintain focus
  useEffect(() => {
    const newContent = content || additionalDetails?.data?.note || selectedNote?.note || '';
    console.log('Updating editor content:', newContent);
    
    if (newContent !== editorContent) {
      setEditorContent(newContent);
      
      // Force update the editor's value while preserving focus
      if (editor.current?.editor) {
        const wasFocused = editor.current.editor.selection?.isFocused();
        const cursorPosition = editor.current.editor.selection?.range?.startOffset;
        
        editor.current.editor.value = newContent;
        
        // Restore focus and cursor position
        if (wasFocused) {
          editor.current.editor.selection?.focus();
          if (cursorPosition !== undefined) {
            editor.current.editor.selection?.createRange().setStart(editor.current.editor.editor, cursorPosition);
          }
        }
      }
    }
  }, [content, additionalDetails, selectedNote, editorContent]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: !editorContent ? placeholder : '',
      height: '500px',
      toolbarButtonSize: 'medium',
      enableDragAndDropFileToEditor: false,
      uploader: { insertImageAsBase64URI: true },
      useSearch: false,
      buttons: [
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'font', 'fontsize', 'brush', 'paragraph', '|',
        'align', 'ul', 'ol', 'outdent', 'indent', '|',
        'table', 'link', '|',
        'undo', 'redo', '|',
        'hr', 'eraser', 'copyformat', '|',
        'symbol', 'print'
      ],
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
    
    // Notify parent of change
    onContentChange?.(newContent);
    
    // Force update the editor's value to ensure sync
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
        onChange={handleContentChange}
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
