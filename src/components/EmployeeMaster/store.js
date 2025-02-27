import { create } from 'zustand';

const useFormStore = create((set) => ({
  activeTab: "BASIC_DETAILS",
  formData: {
    basicDetails: {},
    employmentDetails: {},
    familyDetails: {},
    address: {},
    education: {},
    previousEmployment: {},
    bank: {},
    otherSkills: {},
  },
  employeeCode: "", 
  employeeId:null, 

  setActiveTab: (tab) => set({ activeTab: tab }),

  updateFormData: (section, data) =>
    set((state) => ({
      formData: { ...state.formData, [section]: data },
    })),

  setEmployeeCode: (code) => set({ employeeCode: code }),

  setEmployeeId: (id) => set({ employeeId: id }), 
}));

export default useFormStore;

