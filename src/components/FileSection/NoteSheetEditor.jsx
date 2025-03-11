import React, { useRef } from "react";
import JoditEditor from "jodit-react"; // Import JoditEditor

const NoteSheetEditor = ({ content, onContentChange, additionalDetails }) => {
  const editorRef = useRef(null);
  

  // Handle blur event to notify when the editor loses focus
  const handleEditorBlur = () => {
    if (editorRef.current) {
      const updatedContent = editorRef.current.value;
      if (onContentChange) {
        onContentChange(updatedContent);
      }
    }
  };

  return (
    <div className="note-sheet-editor">
      <h5>Note Sheet Editor</h5>
      <JoditEditor
        ref={editorRef}
        value={content}
        config={{
          readonly: false,
          height: 300,
          askBeforePasteHTML: false,
          askBeforePasteFromWord: false,
          defaultActionOnPaste: "insert_clear_html",
        }}
        tabIndex={1} 
        onBlur={handleEditorBlur} 
      />
    </div>
  );
};

export default NoteSheetEditor;
