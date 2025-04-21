// store.js
import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  priority: { priorityName: "All", priorityCode: "All" }, 
  setPriority: (priority) => set({ priority }),
}));