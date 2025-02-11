import React, { useRef } from "react";
import JoditEditor from "jodit-react";

const CorrespondenceEditor = ({ content, onContentChange }) => {
  const editor = useRef(null);

  const handleEditorChange = (newContent) => {
    onContentChange?.(newContent);
  };

  return (
    <JoditEditor
      ref={editor}
      value={content}
      config={{ readonly: false, placeholder: "Start typing..." }}
      onChange={handleEditorChange} 
      key={content} 
    />
  );
};

export default CorrespondenceEditor;

