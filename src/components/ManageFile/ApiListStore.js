import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";

const useApiListStore = create(
  persist(
    (set) => ({
      activities: [],
      custodians: [],
      departments: [],
      fileModules: [],
      fileRelatedToList: [],
      racks: [],
      rooms: [],
      office: [],
      isLoading: false,
      error: null,

      fetchAllData: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = useAuthStore.getState().token;

          if (!token) {
            console.error("No token found. Please log in.");
            set({ isLoading: false, error: "No token found. Please log in." });
            return;
          }

          const [
            activityResponse,
            custodianResponse,
            departmentResponse,
            fileModuleResponse,
            fileRelatedToResponse,
            rackResponse,
            roomResponse,
            officeResponse,
          ] = await Promise.all([
            api.get("/activity-list", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/custodian-list", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/department-list", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/file/file-module-list", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/file/file-related-to-list", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/rack-list", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/room-list", { headers: { Authorization: `Bearer ${token}` } }),
            api.get("/office-list", { headers: { Authorization: `Bearer ${token}` } }),
            
          ]);
          

          set({
            activities: activityResponse.data.activityList,
            custodians: custodianResponse.data.custodianList,
            departments: departmentResponse.data.departmentList,
            fileModules: fileModuleResponse.data.fileModuleList,
            fileRelatedToList: fileRelatedToResponse.data.fileRelatedToList,
            racks: rackResponse.data.rackList,
            rooms: roomResponse.data.roomList,
            office: officeResponse.data.officeDetails,
            isLoading: false,
          });
          
          
        } catch (error) {
          console.error("Error fetching data:", error.message);
          set({
            isLoading: false,
            error: "Failed to fetch data. Please try again later.",
          });
        }
      },
      
    }),
    {
      name: "api-list-storage",
      partialize: (state) => ({
        activities: state.activities,
        custodians: state.custodians,
        departments: state.departments,
        fileModules: state.fileModules,
        fileRelatedToList: state.fileRelatedToList,
        racks: state.racks,
        rooms: state.rooms,
        office: state.office,
      }),
    }
    
  )
  
);

export default useApiListStore;