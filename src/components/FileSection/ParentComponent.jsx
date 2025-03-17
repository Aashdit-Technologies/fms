import React, { useState, useCallback } from 'react';
import NoteSheet from './NoteSheet';
import Ckeditor from './Ckeditor';

const ParentComponent = ({ noteSheets, additionalDetails, fileDetails }) => {
  const [sharedContent, setSharedContent] = useState('');

  const handleContentChange = useCallback((newContent) => {
    setSharedContent(newContent);
  }, []);

  return (
    <div className="d-flex flex-column">
      <div className="mb-4">
        <NoteSheet 
          noteSheets={noteSheets}
          content={sharedContent}
          onContentChange={handleContentChange}
        />
      </div>
      <div>
        <Ckeditor 
          additionalDetails={additionalDetails}
          fileDetails={fileDetails}
          content={sharedContent}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
};

export default ParentComponent;