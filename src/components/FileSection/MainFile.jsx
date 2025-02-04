


import Ckeditor from './CKEditor'
import Correspondence from './Correspondence'
import FileDetails from './FileDetails'
import NoteSheet from './NoteSheet'
// import ScheduledMeetingDetails from './ScheduledMeetingDetails'

const MainFile = () => {
  
  return (
    <>
        <FileDetails   />
        {/* <ScheduledMeetingDetails /> */}
          <div className="d-flex justify-content-between">
            <div className="main_note">
              <NoteSheet/>
            </div>
            <div className="main_correspondence">
              <Correspondence/>
            </div>
          </div>
        <Ckeditor />
        
    </>
  )
}

export default MainFile