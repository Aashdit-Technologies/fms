import React, { useRef, useState, useEffect } from "react";
import JoditEditor from "jodit-react";
import { heIL } from "@mui/material/locale";

const ModalEditor = ({ defaultText, onTextUpdate }) => {
  const editor = useRef(null);
  const [content, setContent] = useState(defaultText || "");
  let cursorPosition = { start: 0, end: 0 };
  let debounceTimeout = null;

  // Initialize content in the editor once
  useEffect(() => {
    if (editor.current && defaultText !== editor.current.getEditorValue()) {
      editor.current.setEditorValue(defaultText);
    }
  }, [defaultText]);

  const config = {
    readonly: false,
    placeholder: "",
    height:"300px",
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_clear_html',
    events: {
      afterInit: (jodit) => {
        editor.current = jodit;
      },
      focus: () => {
        if (editor.current) {
          editor.current.selection.restore();
        }
      },
      beforeChange: () => {
        if (editor.current) {
          cursorPosition = editor.current.selection.get();
        }
      },
      afterChange: () => {
        if (editor.current) {
          editor.current.selection.set(cursorPosition);
        }
      },
      blur: () => {
        // Use debouncing to save the content only after the user stops typing
        if (editor.current) {
          debounceTimeout = setTimeout(() => {
            const updatedContent = editor.current.getEditorValue();
            setContent(updatedContent);  // Save content
            onTextUpdate?.(updatedContent); // Notify parent with updated content
          }, 100); // Wait 500ms after the user stops typing
        }
      },
    },
  };

  return (
    <JoditEditor
      ref={editor}
      config={config}
      value={content}  // Don't use React state for real-time content updates
      tabIndex={1}
    />
  );
};

export default React.memo(ModalEditor);
