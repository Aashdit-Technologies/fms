import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import JoditEditor from "jodit-react";
import { debounce } from "lodash";

// Internal name change: Rename the component to `CustomModalEditor`
const CustomModalEditor = ({ defaultText, onTextUpdate, placeholder }) => {
  const [contents, setContents] = useState(defaultText || "");
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const isInternalUpdate = useRef(false);
  const cursorPositionRef = useRef(null);

  // Debounced callback for onTextUpdate
  const debouncedOnTextUpdate = useMemo(
    () => debounce((newContent) => onTextUpdate?.(newContent), 300),
    [onTextUpdate]
  );

  // Handle external content updates
  useEffect(() => {
    if (defaultText !== contents && !isInternalUpdate.current) {
      const editor = editorInstanceRef.current;
      if (editor) {
        isInternalUpdate.current = true;

        // Save cursor position
        cursorPositionRef.current = editor.selection.save();

        // Update state
        setContents(defaultText || "");

        // Restore cursor position
        requestAnimationFrame(() => {
          if (cursorPositionRef.current) {
            editor.selection.restore(cursorPositionRef.current);
          }
          isInternalUpdate.current = false;
        });
      } else {
        setContents(defaultText || "");
      }
    }
  }, [defaultText, contents]);

  const handleEditorChange = useCallback(
    (newContent) => {
      if (!isInternalUpdate.current) {
        const editor = editorInstanceRef.current;
        if (editor) {
          isInternalUpdate.current = true;

          // Save cursor position
          cursorPositionRef.current = editor.selection.save();

          // Update state and call debounced onTextUpdate
          setContents(newContent);
          debouncedOnTextUpdate(newContent);

          // Restore cursor position
          requestAnimationFrame(() => {
            if (cursorPositionRef.current) {
              editor.selection.restore(cursorPositionRef.current);
            }
            isInternalUpdate.current = false;
          });
        }
      }
    },
    [debouncedOnTextUpdate]
  );

  const handleEditorFocus = useCallback(() => {
    if (editorRef.current?.editor) {
      editorInstanceRef.current = editorRef.current.editor;
      editorInstanceRef.current.selection?.focus();
    }
  }, []);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || "Start typing...",
      height: 400,
      events: {
        afterInit: (jodit) => {
          editorInstanceRef.current = jodit;
          jodit.e.on("blur", () => {
            // Prevent focus from jumping to toolbar
            setTimeout(() => {
              if (document.activeElement.tagName === "BODY") {
                jodit.selection.focus();
              }
            }, 0);
          });
        },
      },
    }),
    [placeholder]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedOnTextUpdate.cancel();
    };
  }, [debouncedOnTextUpdate]);

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

// Set a custom display name for the component
CustomModalEditor.displayName = "CustomModalEditor";

// Export the component with the new name
export default React.memo(CustomModalEditor);