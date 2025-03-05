import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import JoditEditor from "jodit-react";
import debounce from "lodash/debounce";

const SunEditorComponent = ({ content, onContentChange, placeholder }) => {
  const editor = useRef(null);
  const [editorContent, setEditorContent] = useState(content || "");
  const isUpdatingRef = useRef(false);
  const lastSyncedContent = useRef(content || "");
  const cursorPositionRef = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      height: "300px",
      toolbarButtonSize: "medium",
      enableDragAndDropFileToEditor: false,
      uploader: { insertImageAsBase64URI: true },
      enableAutoFocus: true,
      focus: true,
      saveCaretPosition: true,
      observer: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      processPasteHTML: false,
      beautifyHTML: false,
      defaultActionOnPaste: "insert_clear_html",
      toolbarSticky: false,
      placeholder: "",
      events: {
        beforeSetContent: (content) => {
          if (cursorPositionRef.current) {
            const currentEditor = editor.current?.jodit;
            if (currentEditor) {
              requestAnimationFrame(() => {
                currentEditor.selection.restore(cursorPositionRef.current);
              });
            }
          }
          return content;
        },
      },
    }),
    []
  );

  // Handle content updates from props
  useEffect(() => {
    if (content !== lastSyncedContent.current && !isUpdatingRef.current) {
      const currentEditor = editor.current?.jodit;
      if (currentEditor) {
        cursorPositionRef.current = currentEditor.selection.save();
      }

      setEditorContent(content);
      lastSyncedContent.current = content;

      if (currentEditor && cursorPositionRef.current) {
        requestAnimationFrame(() => {
          currentEditor.selection.restore(cursorPositionRef.current);
          currentEditor.selection.focus();
        });
      }
    }
  }, [content]);

  // Debounced content change handler
  const debouncedContentChange = useCallback(
    debounce((newContent) => {
      if (!isUpdatingRef.current) {
        const currentEditor = editor.current?.jodit;

        if (currentEditor) {
          cursorPositionRef.current = currentEditor.selection.save();
          isUpdatingRef.current = true;

          setEditorContent(newContent);
          onContentChange?.(newContent);
          sessionStorage.setItem("noteSheetContent", newContent);
          lastSyncedContent.current = newContent;

          requestAnimationFrame(() => {
            if (cursorPositionRef.current && currentEditor) {
              currentEditor.selection.restore(cursorPositionRef.current);
              currentEditor.selection.focus();
            }
            isUpdatingRef.current = false;
          });
        } else {
          setEditorContent(newContent);
          onContentChange?.(newContent); // Notify parent component
          sessionStorage.setItem("noteSheetContent", newContent || ""); // Handle empty content
          lastSyncedContent.current = newContent;
          isUpdatingRef.current = false;
        }
      }
    }, 300), // Adjust the debounce time as needed
    [onContentChange]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedContentChange.cancel();
    };
  }, [debouncedContentChange]);

  return (
    <div className="editor-wrapper">
      <JoditEditor
        ref={editor}
        value={editorContent}
        config={config}
        tabIndex={1}
        onChange={debouncedContentChange}
        onFocus={() => {
          const currentEditor = editor.current?.jodit;
          if (currentEditor) {
            currentEditor.selection.focus();
          }
        }}
      />
    </div>
  );
};

export default React.memo(SunEditorComponent);