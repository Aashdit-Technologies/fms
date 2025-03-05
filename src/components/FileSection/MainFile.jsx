import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import Ckeditor from "./Ckeditor";
import api from "../../Api/Api";
import Correspondence from "./Correspondence";
import FileDetails from "./FileDetails";
import NoteSheet from "./NoteSheet";
import { encryptPayload } from "../../utils/encrypt.js";
import { PageLoader } from "../pageload/PageLoader.jsx";

const MainFile = () => {
  const location = useLocation();
  const [sharedEditorContent, setSharedEditorContent] = useState("");
  const { file, tabPanelId } = location.state || {};
  const fileId = file?.fileId;
  const receiptId = file?.fileReceiptId;
  const [isLoading, setIsLoading] = useState(true);

  const isUpdatingContentRef = useRef(false);

  const [fileData, setFileData] = useState({
    fileDetails: null,
    additionalDetails: null,
    correspondence: null,
    noteSheets: null,
  });

  const fetchData = async () => {
    setIsLoading(true);
    if (!fileId || !receiptId) return;
    try {
      const token = sessionStorage.getItem("token");
      const payload1 = encryptPayload({
        tabPanelId: tabPanelId,
        fileId,
        fileReceiptId: receiptId,
      });
      const payload2 = encryptPayload({ fileId });
      const payload3 = encryptPayload({ fileId, lastFileSentDate: "" });
      const [res1, res2, res3, res4, res5] = await Promise.all([
        api.post(
          "/file/basic-details",
          { dataObject: payload1 },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        api.post(
          "/file/get-draft-notesheet",
          { dataObject: payload2 },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        api.post(
          "/file/file-correspondences",
          { dataObject: payload3 },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        api.post(
          "/file/file-notesheets",
          { dataObject: payload3 },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        api.post(
          "/file/notesheet-preview",
          { dataObject: payload2 },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);
      setFileData({
        fileDetails: res1.data,
        additionalDetails: res2.data,
        correspondence: res3.data,
        noteSheets: res4.data,
        notingNo: res5.data,
      });
      if (res2.data.data.note) {
        isUpdatingContentRef.current = true;
        setSharedEditorContent(res2.data.data.note);
        setTimeout(() => {
          isUpdatingContentRef.current = false;
        }, 100);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fileId, receiptId]);

  const refetchData = async () => {
    await fetchData();
  };

  const handleEditorContentChange = useCallback((newContent) => {
    if (!isUpdatingContentRef.current) {
      isUpdatingContentRef.current = true;
      setSharedEditorContent(newContent);
      sessionStorage.setItem('noteSheetContent', newContent);
      requestAnimationFrame(() => {
        isUpdatingContentRef.current = false;
      });
    }
  }, []);
  
  // Update the initial content load effect
  useEffect(() => {
    const savedContent = sessionStorage.getItem('noteSheetContent');
    if (savedContent && !isUpdatingContentRef.current) {
      setSharedEditorContent(savedContent);
    }
    return () => {
      sessionStorage.removeItem('noteSheetContent');
    };
  }, []);

  // Clean up sessionStorage on component unmount
  useEffect(() => {
    // Load initial content from sessionStorage if exists
    const savedContent = sessionStorage.getItem('noteSheetContent');
    if (savedContent) {
      setSharedEditorContent(savedContent);
    }
  }, []);

  return (
    <>
      {isLoading && <PageLoader />}

      <FileDetails
        fileDetails={fileData.fileDetails}
        refetchData={refetchData}
      />
      <div className="d-flex justify-content-between gap-2">
        <div className="main_note w-50">
          <NoteSheet
            noteSheets={fileData.noteSheets}
            fileDetails={fileData.fileDetails}
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
              if (row.corrType === "DOCUMENT") {
                window.open(row.link, "_blank");
              } else {
                window.open(`/letter/${row.refNo}`, "_blank");
              }
            }}
            onHistory={(row) => {
              window.open(`/history/${row.refNo}`, "_blank");
            }}
            onDownload={(row) => {
              window.open(row.downloadLink, "_blank");
            }}
            refetchData={refetchData}
          />
        </div>
      </div>
      {tabPanelId && tabPanelId === 1 && (
        <Ckeditor
          additionalDetails={fileData.additionalDetails}
          fileDetails={fileData.fileDetails}
          content={sharedEditorContent}
          onContentChange={handleEditorContentChange}
          refetchData={refetchData}
          notingNo={fileData.notingNo}
        />
      )}
    </>
  );
};

export default MainFile;
