import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder }) => {
  const editor = useRef(null);
  const [editorContent, setEditorContent] = useState(content || '');
  const isUpdatingRef = useRef(false);

  // Update editorContent when content prop changes
  useEffect(() => {
    if (content !== editorContent && !isUpdatingRef.current) {
      setEditorContent(content);
    }
  }, [content]);

  const config = useMemo(
    () => ({
      
      readonly: false,
      placeholder: '',
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
    [placeholder]
  );

  const handleContentChanges = useCallback((newContent) => {
    setEditorContent(newContent);
    // Notify parent immediately to keep editors in sync
    onContentChange?.(newContent);
  }, [onContentChange]);

  const handleBlur = useCallback(() => {
    // Only notify parent if we're not already updating
    if (!isUpdatingRef.current) {
      onContentChange?.(editorContent);
    }
  }, [editorContent, onContentChange]);

  return (
    <div className="editor-wrapper">
      <JoditEditor
        ref={editor}
        value={editorContent}
        config={config}
        tabIndex={1}
        onChange={handleContentChanges}
        onBlur={handleBlur}
      />
    </div>
  );
};
export default SunEditorComponent;
