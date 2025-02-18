import { create } from "zustand";

const useLetterStore = create((set) => ({
  successMessage: null, 
  setSuccessMessage: (message) => set({ successMessage: message }),
  clearSuccessMessage: () => set({ successMessage: null }), 
}));
  
export default useLetterStore;
