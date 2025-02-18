import React, { useEffect, useRef, useState } from "react";
import JoditEditor from "jodit-react";

const CorrespondenceEditor = ({ initialContent, onContentChange }) => {
  const [content, setContent] = useState(initialContent || "");
  const editorRef = useRef(null);

  useEffect(() => {
    // Update content when initialContent changes (e.g., when editing a draft or selecting template)
    if (initialContent !== content) {
      setContent(initialContent || "");
      // Also notify parent of the change
      onContentChange?.(initialContent || "");

      // Force update editor content
      if (editorRef.current?.editor) {
        editorRef.current.editor.value = initialContent || "";
      }
    }
  }, [initialContent]);

  const handleEditorChange = (newContent) => {
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleEditorFocus = () => {
    if (editorRef.current?.editor) {
      // Ensure cursor is at the end of content
      const editor = editorRef.current.editor;
      editor.selection?.focus();
    }
  };

  const config = {
    readonly: false,
    placeholder: "Start typing...",
    height: 400,
    toolbarButtonSize: "small",
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'align', '|', 
      'ul', 'ol', '|',
      'table', 'link', '|',
      'undo', 'redo', '|',
      'hr', 'eraser', 'fullsize'
    ],
    removeButtons: ['about'],
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_clear_html',
    // Enable HTML editing
    editHTMLDocumentMode: true,
    allowResizeY: true,
    useAceEditor: false,
    // Preserve HTML formatting
    cleanHTML: {
      fillEmptyParagraph: false,
      removeEmptyElements: false,
      replaceNBSP: false,
      cleanOnPaste: false
    },
    // Allow all HTML tags and attributes
    allowTags: '*',
    allowAttributes: '*',
    allowStyles: '*',
    // Ensure proper HTML rendering
    processPastedHTML: false,
    beautifyHTML: false
  };

  return (
    <JoditEditor
      ref={editorRef}
      value={content}
      config={config}
      onChange={handleEditorChange}
      onFocus={handleEditorFocus}
    />
  );
};

export default React.memo(CorrespondenceEditor);
