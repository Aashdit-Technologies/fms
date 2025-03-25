import { create } from "zustand";

const useMenuStore = create((set) => ({
  menuData: [],
  setMenuData: (newMenuData) => set({ menuData: newMenuData }),
}));

export default useMenuStore;