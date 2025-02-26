import React, { useEffect, useRef, useState } from "react";
import JoditEditor from "jodit-react";

const CorrespondenceEditor = ({ defaultText, onTextUpdate }) => {
  const [contents, setContents] = useState(defaultText || "");
  const editorRef = useRef(null);

  // Update contents whenever defaultText changes from the parent
  useEffect(() => {
    if (defaultText !== contents) {
      setContents(defaultText || "");
      onTextUpdate?.(defaultText || ""); // Notify parent of the change
    }
  }, [defaultText, contents, onTextUpdate]);

  // Handle content change within the editor
  const handleEditorChange = (newContent) => {
    setContents(newContent); // Update local state with the new content
    onTextUpdate?.(newContent); // Notify the parent of the new content
  };

  // Focus behavior (optional)
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
    toolbarButtonSize: "small",
    removeButtons: ['about'],
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_clear_html',
    editHTMLDocumentMode: true,
    allowResizeY: true,
    useAceEditor: false,
    cleanHTML: {
      fillEmptyParagraph: false,
      removeEmptyElements: false,
      replaceNBSP: false,
      cleanOnPaste: false
    },
    allowTags: '*',
    allowAttributes: '*',
    allowStyles: '*',
    processPastedHTML: false,
    beautifyHTML: false
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
