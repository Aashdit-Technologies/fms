import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder, additionalDetails }) => {
  const editor = useRef(null);

  const [editorContent, setEditorContent] = useState(content || '');
  const [debouncedContent, setDebouncedContent] = useState(content || '');

  useEffect(() => {
    if (additionalDetails?.data?.note) {
      setEditorContent(additionalDetails.data.note);
      setDebouncedContent(additionalDetails.data.note);
    }
  }, [additionalDetails]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: !editorContent ? placeholder : '',
    }),
    [editorContent, placeholder]
  );

  const handleContentChange = useCallback((newContent) => {
    if (newContent !== debouncedContent) {
      setDebouncedContent(newContent);
      onContentChange?.(newContent);
    }
  }, [debouncedContent, onContentChange]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setEditorContent(debouncedContent);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedContent]);

  const handleBlur = useCallback((newContent) => {
    handleContentChange(newContent);
  }, [handleContentChange]);

  return (
    <JoditEditor
      ref={editor}
      value={editorContent}
      config={config}
      tabIndex={1}
      onBlur={handleBlur}
      onChange={handleContentChange}
    />
  );
};

export default SunEditorComponent;