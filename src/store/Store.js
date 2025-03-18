import {create} from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      authenticated: false,
      setToken: (token) => set({ token, authenticated: true }),
      clearAuth: () => set({ token: null, authenticated: false }),
      showCaptchaField: false,
      setShowCaptchaField: (value) => set({ showCaptchaField: value }),
    }),
    {
      name: 'auth-storage', 
    }
  ) 
);

export default useAuthStore;
