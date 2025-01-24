import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      authenticated: false,
      
      setToken: (token) => set({ 
        token, 
        authenticated: true 
      }),
      
      clearAuth: () => set({ 
        token: null, 
        authenticated: false 
      }),
      
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;