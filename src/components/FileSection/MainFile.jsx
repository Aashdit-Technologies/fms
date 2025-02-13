import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import Ckeditor from './Ckeditor'
import Correspondence from './Correspondence'
import FileDetails from './FileDetails'
import NoteSheet from './NoteSheet'
// import ScheduledMeetingDetails from './ScheduledMeetingDetails'



const MainFile = () => {
  const location = useLocation();
  
  const locationState = useMemo(() => {
    const state = location.state || {};
    return {
      fileDetails: state.fileDetails,
      additionalDetails: state.additionalDetails,
      correspondence: state.correspondence,
      noteSheets: state.noteSheets
    };
  }, [location.state]);
  
  return (
    <>
        <FileDetails fileDetails={locationState.fileDetails} />
        {/* <ScheduledMeetingDetails /> */}
          <div className="d-flex justify-content-between gap-2">
            <div className="main_note w-50">
              <NoteSheet noteSheets={locationState.noteSheets} />
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
        <Ckeditor additionalDetails={locationState.additionalDetails} fileDetails={locationState.fileDetails}/>
        
    </>
  )
}

export default MainFile
