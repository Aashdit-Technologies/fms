import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import JoditEditor from 'jodit-react';

const SunEditorComponent = ({ content, onContentChange, placeholder, selectedNote, additionalDetails }) => {
  const editor = useRef(null);
  const [editorContent, setEditorContent] = useState(content || '');

  // Update editor content when content prop changes
  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  // Update editor content when additionalDetails changes
  useEffect(() => {
    if (additionalDetails?.data?.note) {
      setEditorContent(additionalDetails.data.note);
    }
  }, [additionalDetails]);

  // Update editor content when selectedNote changes
  useEffect(() => {
    if (selectedNote?.note) {
      setEditorContent(selectedNote.note);
    }
  }, [selectedNote]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: !editorContent ? placeholder : '',
      height: '500px',
      toolbarButtonSize: 'medium',
      buttons: [
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'font', 'fontsize', 'brush', 'paragraph', '|',
        'align', 'ul', 'ol', 'outdent', 'indent', '|',
        'table', 'link', '|',
        'undo', 'redo', '|',
        'hr', 'eraser', 'copyformat', '|',
        'symbol', 'print'
      ],
      removeButtons: ['about'],
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
    }),
    [editorContent, placeholder]
  );

  const handleContentChange = useCallback((newContent) => {
    setEditorContent(newContent);
    onContentChange?.(newContent);
  }, [onContentChange]);

  return (
    <div className="editor-wrapper">
      <JoditEditor
        ref={editor}
        value={editorContent}
        config={config}
        tabIndex={1}
        onChange={handleContentChange}
      />
      <style jsx>{`
        .editor-wrapper {
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        :global(.jodit-workplace) {
          min-height: 400px;
        }
        :global(.jodit-status-bar) {
          background: #f8f9fa;
          border-top: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
};

export default SunEditorComponent;