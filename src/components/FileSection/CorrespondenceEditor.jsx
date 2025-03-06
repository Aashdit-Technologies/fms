import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import JoditEditor from "jodit-react";
import { debounce } from "lodash";

const CorrespondenceEditor = ({ defaultText, onTextUpdate }) => {
  const [contents, setContents] = useState(defaultText || "");
  const editorRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const editorInstanceRef = useRef(null);
  const cursorPositionRef = useRef(null);

  // Debounced callback for onTextUpdate
  const debouncedOnTextUpdate = useMemo(
    () => debounce((newContent) => onTextUpdate?.(newContent), 300),
    [onTextUpdate]
  );

  const config = useMemo(
    () => ({
      readonly: false,
      height: 400,
      enableAutoFocus: true,
      saveCaretPosition: true,
      observer: {
        timeout: 0,
      },
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      processPasteHTML: false,
      beautifyHTML: false,
      defaultActionOnPaste: "insert_clear_html",
      toolbarSticky: false,
      events: {
        beforeSetContent: () => {
          const editor = editorInstanceRef.current;
          if (editor) {
            cursorPositionRef.current = editor.selection.save();
          }
        },
        afterSetContent: () => {
          const editor = editorInstanceRef.current;
          if (editor && cursorPositionRef.current) {
            requestAnimationFrame(() => {
              editor.selection.restore(cursorPositionRef.current);
            });
          }
        },
        change: () => {
          const editor = editorInstanceRef.current;
          if (editor) {
            cursorPositionRef.current = editor.selection.save();
          }
        },
        afterInit: (editor) => {
          editorInstanceRef.current = editor;
          editor.selection.focus();
        },
      },
    }),
    []
  );

  const handleEditorChange = useCallback(
    (newContent) => {
      if (!isUpdatingRef.current) {
        const editor = editorInstanceRef.current;
        if (editor) {
          isUpdatingRef.current = true;

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
            isUpdatingRef.current = false;
          });
        }
      }
    },
    [debouncedOnTextUpdate]
  );

  // Handle external content updates
  useEffect(() => {
    if (defaultText !== contents && !isUpdatingRef.current) {
      const editor = editorInstanceRef.current;
      if (editor) {
        isUpdatingRef.current = true;

        // Save cursor position
        cursorPositionRef.current = editor.selection.save();

        // Update state
        setContents(defaultText || "");

        // Restore cursor position
        requestAnimationFrame(() => {
          if (cursorPositionRef.current) {
            editor.selection.restore(cursorPositionRef.current);
          }
          isUpdatingRef.current = false;
        });
      } else {
        setContents(defaultText || "");
      }
    }
  }, [defaultText, contents]);

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
      onBlur={() => {
        const editor = editorInstanceRef.current;
        if (editor) {
          cursorPositionRef.current = editor.selection.save();
        }
      }}
    />
  );
};

export default React.memo(CorrespondenceEditor);