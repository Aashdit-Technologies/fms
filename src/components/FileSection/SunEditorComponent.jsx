import React, { useRef, useMemo, useState, useEffect } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder, additionalDetails }) => {
  const editor = useRef(null);

  const [editorContent, setEditorContent] = useState(content || '');

  useEffect(() => {
    if (additionalDetails?.data?.note) {
      setEditorContent(additionalDetails.data.note);
    }
  }, [additionalDetails]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: !editorContent ? placeholder : '',
    }),
    [editorContent, placeholder]
  );

  const handleContentChange = (newContent) => {
    if (newContent !== editorContent) {
      setEditorContent(newContent);
      onContentChange?.(newContent);
    }
  };

  const handleBlur = (newContent) => {
    handleContentChange(newContent);
  };

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