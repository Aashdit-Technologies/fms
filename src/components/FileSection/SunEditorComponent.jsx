import React, { useRef, useMemo, useState, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import useAuthStore from '../../store/Store';

const SunEditorComponent = ({ placeholder }) => {
  const editor = useRef(null);
  const { additionalDetails, setAdditionalDetails } = useAuthStore((state) => ({
    additionalDetails: state.additionalDetails,
    setAdditionalDetails: state.setAdditionalDetails,
  }));

  const [isTyping, setIsTyping] = useState(false);
  const [timer, setTimer] = useState(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || 'Start typing...',
    }),
    [placeholder]
  );

  const editorContent = additionalDetails?.note || '';

  // Debounced content update
  useEffect(() => {
    if (!timer) return;

    return () => clearTimeout(timer);
  }, [timer]);

  // Avoid infinite loop by comparing the new content with the previous content
  const handleContentChange = (newContent) => {
    if (newContent === additionalDetails?.note) return; // Prevent unnecessary updates

    // Clear any existing timer
    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      setAdditionalDetails({ ...additionalDetails, note: newContent });
    }, 500); // 500ms delay

    setTimer(newTimer); // Set the new timer
  };

  // Update store on blur event (only if the content has changed)
  const handleBlur = (newContent) => {
    if (newContent !== additionalDetails?.note) {
      setAdditionalDetails({ ...additionalDetails, note: newContent });
    }
  };

  return (
    <JoditEditor
      ref={editor}
      value={editorContent}
      config={config}
      tabIndex={1}
      onBlur={(newContent) => handleBlur(newContent)}
      onChange={(newContent) => handleContentChange(newContent)}
    />
  );
};

export default SunEditorComponent;
