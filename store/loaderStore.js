import { create } from 'zustand';

const useLoaderStore = create((set) => ({
  isLoading: false,
  setLoading: (status) => set({ isLoading: status }),
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));

export default useLoaderStore; 