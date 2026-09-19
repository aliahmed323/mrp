import { create } from 'zustand';
import type { Pharmacy, PharmacyFormData } from '@/modules/pharmacies/models/pharmacy.model';
import {
  getAllPharmacies, createPharmacy, updatePharmacy,
  archivePharmacy, unarchivePharmacy, deletePharmacy, getPharmacyStats,
} from '@/services/storage/pharmacyRepository';

interface PharmacyState {
  pharmacies: Pharmacy[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  stats: { total: number; independent: number; affiliated: number; withLocation: number };
  showArchived: boolean;
  loadPharmacies: () => Promise<void>;
  addPharmacy: (data: PharmacyFormData) => Promise<Pharmacy>;
  editPharmacy: (id: string, data: Partial<PharmacyFormData>) => Promise<Pharmacy>;
  archivePharmacy: (id: string) => Promise<void>;
  unarchivePharmacy: (id: string) => Promise<void>;
  deletePharmacy: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setShowArchived: (show: boolean) => void;
  getFilteredPharmacies: () => Pharmacy[];
}

export const usePharmacyStore = create<PharmacyState>((set, get) => ({
  pharmacies: [], loading: false, error: null, searchQuery: '',
  stats: { total: 0, independent: 0, affiliated: 0, withLocation: 0 }, showArchived: false,

  loadPharmacies: async () => {
    set({ loading: true, error: null });
    try {
      const [all, stats] = await Promise.all([getAllPharmacies(), getPharmacyStats()]);
      set({ pharmacies: all, stats, loading: false });
    } catch { set({ error: 'فشل تحميل الصيدليات', loading: false }); }
  },
  addPharmacy: async (data) => {
    const p = await createPharmacy(data);
    const [all, stats] = await Promise.all([getAllPharmacies(), getPharmacyStats()]);
    set({ pharmacies: all, stats }); return p;
  },
  editPharmacy: async (id, data) => {
    const p = await updatePharmacy(id, data);
    const [all, stats] = await Promise.all([getAllPharmacies(), getPharmacyStats()]);
    set({ pharmacies: all, stats }); return p;
  },
  archivePharmacy: async (id) => {
    await archivePharmacy(id);
    const [all, stats] = await Promise.all([getAllPharmacies(), getPharmacyStats()]);
    set({ pharmacies: all, stats });
  },
  unarchivePharmacy: async (id) => {
    await unarchivePharmacy(id);
    const [all, stats] = await Promise.all([getAllPharmacies(), getPharmacyStats()]);
    set({ pharmacies: all, stats });
  },
  deletePharmacy: async (id) => {
    await deletePharmacy(id);
    const [all, stats] = await Promise.all([getAllPharmacies(), getPharmacyStats()]);
    set({ pharmacies: all, stats });
  },
  setSearchQuery: (q) => set({ searchQuery: q }),
  setShowArchived: (show) => set({ showArchived: show }),
  getFilteredPharmacies: () => {
    const { pharmacies, searchQuery, showArchived } = get();
    const q = searchQuery.trim().toLowerCase();
    return pharmacies.filter(p => {
      if (!showArchived && p.archived) return false;
      if (showArchived && !p.archived) return false;
      if (q) {
        return p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          (p.doctorName || '').toLowerCase().includes(q);
      }
      return true;
    });
  },
}));
