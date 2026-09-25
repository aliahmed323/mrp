import { create } from 'zustand';
import type { PointCenter, PointCenterFormData } from '../models/pointCenter.model';
import * as pointCenterRepo from '@/services/storage/pointCenterRepository';

interface PointCenterState {
  pointCenters: PointCenter[];
  loading: boolean;
  searchQuery: string;
  loadPointCenters: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFiltered: () => PointCenter[];
  addPointCenter: (data: PointCenterFormData) => Promise<PointCenter>;
  updatePointCenter: (id: string, data: Partial<PointCenterFormData>) => Promise<PointCenter>;
  deletePointCenter: (id: string) => Promise<void>;
}

export const usePointCenterStore = create<PointCenterState>((set, get) => ({
  pointCenters: [],
  loading: false,
  searchQuery: '',

  loadPointCenters: async () => {
    set({ loading: true });
    try {
      const data = await pointCenterRepo.getAllPointCenters();
      set({ pointCenters: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  getFiltered: () => {
    const { pointCenters, searchQuery } = get();
    if (!searchQuery) return pointCenters;
    return pointCenters.filter(p => p.name.includes(searchQuery));
  },

  addPointCenter: async (data) => {
    const newPc = await pointCenterRepo.createPointCenter(data);
    await get().loadPointCenters();
    return newPc;
  },

  updatePointCenter: async (id, data) => {
    const updated = await pointCenterRepo.updatePointCenter(id, data);
    await get().loadPointCenters();
    return updated;
  },

  deletePointCenter: async (id) => {
    await pointCenterRepo.deletePointCenter(id);
    await get().loadPointCenters();
  }
}));
