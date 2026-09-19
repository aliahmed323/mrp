import { create } from 'zustand';
import type { Visit, VisitFormData } from '@/modules/visits/models/visit.model';
import {
  getAllVisits, createVisit, deleteVisit,
  getTodayVisits, getPendingFollowUps, getVisitsByDateRange, getVisitStats,
} from '@/services/storage/visitRepository';

interface VisitState {
  visits: Visit[];
  todayVisits: Visit[];
  pendingFollowUps: Visit[];
  loading: boolean;
  error: string | null;
  stats: { total: number; today: number; pendingFollowUps: number };
  loadVisits: () => Promise<void>;
  addVisit: (data: VisitFormData) => Promise<Visit>;
  removeVisit: (id: string) => Promise<void>;
  getVisitsByRange: (from: string, to: string) => Promise<Visit[]>;
}

export const useVisitStore = create<VisitState>((set) => ({
  visits: [], todayVisits: [], pendingFollowUps: [],
  loading: false, error: null,
  stats: { total: 0, today: 0, pendingFollowUps: 0 },

  loadVisits: async () => {
    set({ loading: true, error: null });
    try {
      const [all, today, followUps, stats] = await Promise.all([
        getAllVisits(), getTodayVisits(), getPendingFollowUps(), getVisitStats(),
      ]);
      set({ visits: all, todayVisits: today, pendingFollowUps: followUps, stats, loading: false });
    } catch { set({ error: 'فشل تحميل الزيارات', loading: false }); }
  },
  addVisit: async (data) => {
    const visit = await createVisit(data);
    const [all, today, followUps, stats] = await Promise.all([
      getAllVisits(), getTodayVisits(), getPendingFollowUps(), getVisitStats(),
    ]);
    set({ visits: all, todayVisits: today, pendingFollowUps: followUps, stats });
    return visit;
  },
  removeVisit: async (id) => {
    await deleteVisit(id);
    const [all, today, followUps, stats] = await Promise.all([
      getAllVisits(), getTodayVisits(), getPendingFollowUps(), getVisitStats(),
    ]);
    set({ visits: all, todayVisits: today, pendingFollowUps: followUps, stats });
  },
  getVisitsByRange: async (from, to) => {
    return getVisitsByDateRange(from, to);
  },
}));
