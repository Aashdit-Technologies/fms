import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder }) => {
  const editor = useRef(null);
  const [editorContent, setEditorContent] = useState(content || '');

  // Update editorContent when content prop changes
  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [content]);

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

  const handleContentChanges = useCallback((newContent) => {
    setEditorContent(newContent);
    onContentChange?.(newContent);
  }, [onContentChange]);

  const handleBlur = useCallback(() => {
    console.log('Editor lost focus:', editorContent);
    onContentChange?.(editorContent);
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

export default React.memo(SunEditorComponent);