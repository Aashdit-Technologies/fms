import React, { useEffect, useRef, useState } from "react";
import JoditEditor from "jodit-react";

const CorrespondenceEditor = ({ defaultText, onTextUpdate,placeholder }) => {
  const [contents, setContents] = useState(defaultText || "");
  const editorRef = useRef(null);

  useEffect(() => {
    setContents(defaultText || "");
  }, [defaultText]);

  const handleEditorChange = (newContent) => {
    setContents(newContent);
    onTextUpdate?.(newContent);
  };

  const handleEditorFocus = () => {
    if (editorRef.current?.editor) {
      const editor = editorRef.current.editor;
      editor.selection?.focus();
    }
  };

  const config = {
    readonly: false,
    placeholder: "Start typing...",
    height: 400,
    
  };

  return (
    <JoditEditor
      ref={editorRef}
      value={contents}
      config={config}
      onChange={handleEditorChange}
      onFocus={handleEditorFocus}
      onBlur={handleEditorFocus}
    />
  );
};

export default React.memo(CorrespondenceEditor);