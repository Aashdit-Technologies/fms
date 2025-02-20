import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";

const useApiListStore = create(
  persist(
    (set, get) => ({
      activities: [],
      custodians: [],
      departments: [],
      fileModules: [],
      fileRelatedToList: [],
      racks: [],
      office: [],
      isLoading: false,
      error: null,

      fetchAllData: async () => {
        set({ isLoading: true, error: null });
        const token = useAuthStore.getState().token;

        if (!token) {
          console.error("No token found. Please log in.");
          set({ isLoading: false, error: "No token found. Please log in." });
          return;
        }

        const endpoints = [
          { key: "activities", url: "/activity-list" },
          { key: "custodians", url: "/custodian-list" },
          { key: "departments", url: "/department-list" },
          { key: "fileModules", url: "/file/file-module-list" },
          { key: "fileRelatedToList", url: "/file/file-related-to-list" },
          { key: "racks", url: "/rack-list" },
          { key: "office", url: "/office-list" },
        ];

        try {
          await Promise.all(
            endpoints.map(async ({ key, url }) => {
              const response = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });
              set((state) => ({
                ...state,
                [key]: response.data.data === null ? [] : response.data.data,
              }));
            })
          );
        } catch (error) {
          console.error("Error fetching data:", error.message);
          set({
            isLoading: false,
            error: "Failed to fetch data. Please try again later.",
          });
        } finally {
          set({ isLoading: false });
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
        office: state.office,
      }),
    }
  )
);

export default useApiListStore;