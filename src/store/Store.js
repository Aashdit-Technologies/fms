import {create} from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      
      token: null,
      authenticated: false,
      setToken: (token) => set({ token, authenticated: true }),
      clearAuth: () => set({ token: null, authenticated: false }),
      
      fileDetails: null,
      fileId: null,
      fileReceiptId: null,
      additionalDetails: null,
      setFileDetails: (data) => set({ fileDetails: data }),
      setFileId: (id) => set({ fileId: id }),
      setFileReceiptId: (id) => set({ fileReceiptId: id }),
      setAdditionalDetails: (data) => set({ additionalDetails: data }),
      clearFileData: () => set({ 
        fileDetails: null, 
        fileId: null, 
        fileReceiptId: null, 
        additionalDetails: null 
      }),
    }),
    {
      name: 'auth-storage', 
    }
  )
);

export default useAuthStore;
