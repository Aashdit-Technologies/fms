import React, { useRef, useMemo, useState, useEffect } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange,placeholder }) => {
  const editor = useRef(null);

  // Set the initial content using the `content` prop
  const [editorContent, setEditorContent] = useState(content || '');

  // Update the editor content if the `content` prop changes
  useEffect(() => {
    setEditorContent(content || ''); // Default to empty string if content is undefined or null
  }, [content]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: !editorContent ? placeholder : '',
    }),
    [editorContent,placeholder]
  );

  // Handle content change within the editor
  const handleContentChange = (newContent) => {
    if (newContent !== editorContent) {
      setEditorContent(newContent); // Update the local content state
      onContentChange?.(newContent); // Notify the parent component of the change
    }
  };

  // Handle blur event when the editor loses focus
  const handleBlur = (newContent) => {
    handleContentChange(newContent); // Update content when editor loses focus
  };

  return (
    <JoditEditor
      ref={editor}
      value={editorContent} // Set the editor content to the current state
      config={config}
      tabIndex={1}
      onBlur={(newContent) => handleBlur(newContent)} // Handle blur event
      onChange={(newContent) => handleContentChange(newContent)} // Handle content change
    />
  );
};

export default SunEditorComponent;
