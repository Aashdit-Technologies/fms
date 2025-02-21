import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Ckeditor from './Ckeditor';
import api from "../../Api/Api";
import Correspondence from './Correspondence';
import FileDetails from './FileDetails';
import NoteSheet from './NoteSheet';
import { encryptPayload } from "../../utils/encrypt.js";

const MainFile = () => {
  const location = useLocation();
  const [sharedEditorContent, setSharedEditorContent] = useState('');
  const { file } = location.state || {};
  const fileId = file?.fileId;  
  const receiptId = file?.fileReceiptId;
  console.log('MainFile:', fileId, receiptId);
  
  const [fileData, setFileData] = useState({
    fileDetails: null,
    additionalDetails: null,
    correspondence: null,
    noteSheets: null
  });

  const fetchData = async () => {
    if (!fileId || !receiptId) return;
    try {
      const token = sessionStorage.getItem("token");
      const payload1 = encryptPayload({ tabPanelId: 1, fileId, fileReceiptId: receiptId });
      const payload2 = encryptPayload({ fileId });
      const payload3 = encryptPayload({ fileId, lastFileSentDate: "" });
      const [res1, res2, res3, res4] = await Promise.all([
        api.post("/file/basic-details", { dataObject: payload1 }, { headers: { Authorization: `Bearer ${token}` } }),
        api.post("/file/get-draft-notesheet", { dataObject: payload2 }, { headers: { Authorization: `Bearer ${token}` } }),
        api.post("/file/file-correspondences", { dataObject: payload3 }, { headers: { Authorization: `Bearer ${token}` } }),
        api.post("/file/file-notesheets", { dataObject: payload3 }, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFileData({
        fileDetails: res1.data,
        additionalDetails: res2.data,
        correspondence: res3.data,
        noteSheets: res4.data
      });
      if (res2.data.note) {
        setSharedEditorContent(res2.data.note);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fileId, receiptId]);

  const refetchData = async () => {
    await fetchData();
  };

  const handleEditorContentChange = (newContent) => {
    setSharedEditorContent(newContent);
  };

  return (
    <>
      <FileDetails 
        fileDetails={fileData.fileDetails} 
        refetchData={refetchData} 
      />
      <div className="d-flex justify-content-between gap-2">
        <div className="main_note w-50">
          <NoteSheet 
            noteSheets={fileData.noteSheets} 
            additionalDetails={fileData.additionalDetails}
            content={sharedEditorContent}
            onContentChange={handleEditorContentChange}
            refetchData={refetchData}
          />
        </div>
        <div className="main_correspondence w-50">
          <Correspondence 
            correspondence={fileData.correspondence}
            fileDetails={fileData.fileDetails}
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
            refetchData={refetchData}
          />
        </div>
      </div>
      <Ckeditor 
        additionalDetails={fileData.additionalDetails} 
        fileDetails={fileData.fileDetails}
        content={sharedEditorContent}
        onContentChange={handleEditorContentChange}
        refetchData={refetchData}
      />
    </>
  );
}

export default MainFile;
