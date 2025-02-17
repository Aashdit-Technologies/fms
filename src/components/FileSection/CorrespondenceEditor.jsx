import React, { useEffect, useRef } from "react";
import JoditEditor from "jodit-react";

const CorrespondenceEditor = ({ initialContent, onContentChange }) => {
  const handleEditorChange = (newContent) => {
    onContentChange?.(newContent);
  };

  const handleEditorFocus = () => {
    // Editor has focus and should be ready for interaction
  };

  return (
    <JoditEditor
      value={initialContent || ""} // Controlled value
      config={{
        readonly: false,
        placeholder: "Start typing...",
      }}
      onChange={handleEditorChange}
      onFocus={handleEditorFocus} // Ensure editor is focused and ready for actions
    />
  );
};

export default React.memo(CorrespondenceEditor);  // Prevent unnecessary re-renders
