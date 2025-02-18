import { useLocation } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import Ckeditor from './Ckeditor'
import Correspondence from './Correspondence'
import FileDetails from './FileDetails'
import NoteSheet from './NoteSheet'



const MainFile = () => {
  const location = useLocation();
  const [sharedEditorContent, setSharedEditorContent] = useState('');
  
  const locationState = useMemo(() => {
    const state = location.state || {};
    return {
      fileDetails: state.fileDetails,
      additionalDetails: state.additionalDetails,
      correspondence: state.correspondence,
      noteSheets: state.noteSheets
    };
  }, [location.state]);

  // Initialize content from additionalDetails if available
  useEffect(() => {
    if (locationState.additionalDetails?.data?.note) {
      setSharedEditorContent(locationState.additionalDetails.data.note);
    }
  }, [locationState.additionalDetails]);

  const handleEditorContentChange = (newContent) => {
    console.log('Editor content changed:', newContent);
    setSharedEditorContent(newContent);
  };
  
  return (
    <>
        <FileDetails fileDetails={locationState.fileDetails} />
          <div className="d-flex justify-content-between gap-2">
            <div className="main_note w-50">
              <NoteSheet 
                noteSheets={locationState.noteSheets} 
                additionalDetails={locationState.additionalDetails}
                content={sharedEditorContent}
                onContentChange={handleEditorContentChange}
              />
            </div>
            <div className="main_correspondence w-50">
              <Correspondence 
                correspondence={locationState.correspondence}
                fileDetails={locationState.fileDetails}
                onView={(row) => {
                  if (row.corrType === 'DOCUMENT') {
                    window.open(row.link, '_blank');
                  } else {
                    window.open(`/letter/${row.refNo}`, '_blank');
                  }
                }}
                onHistory={(row) => {
                  window.open(`/history/${row.refNo}`, '_blank');
                }}
                onDownload={(row) => {
                  window.open(row.downloadLink, '_blank');
                }}
              />
            </div>
          </div>
        <Ckeditor 
          additionalDetails={locationState.additionalDetails} 
          fileDetails={locationState.fileDetails}
          content={sharedEditorContent}
          onContentChange={handleEditorContentChange}
        />
        
    </>
  )
}

export default MainFile
