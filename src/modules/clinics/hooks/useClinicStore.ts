import { create } from 'zustand';
import type { Clinic, ClinicFormData } from '@/modules/clinics/models/clinic.model';
import {
  getAllClinics, createClinic, updateClinic,
  archiveClinic, unarchiveClinic, deleteClinic, getClinicStats,
} from '@/services/storage/clinicRepository';

interface ClinicState {
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  stats: { total: number; withLocation: number };
  showArchived: boolean;
  loadClinics: () => Promise<void>;
  addClinic: (data: ClinicFormData) => Promise<Clinic>;
  editClinic: (id: string, data: Partial<ClinicFormData>) => Promise<Clinic>;
  archiveClinic: (id: string) => Promise<void>;
  unarchiveClinic: (id: string) => Promise<void>;
  deleteClinic: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setShowArchived: (show: boolean) => void;
  getFilteredClinics: () => Clinic[];
}

export const useClinicStore = create<ClinicState>((set, get) => ({
  clinics: [], loading: false, error: null, searchQuery: '',
  stats: { total: 0, withLocation: 0 }, showArchived: false,

  loadClinics: async () => {
    set({ loading: true, error: null });
    try {
      const [all, stats] = await Promise.all([getAllClinics(), getClinicStats()]);
      set({ clinics: all, stats, loading: false });
    } catch { set({ error: 'فشل تحميل العيادات', loading: false }); }
  },
  addClinic: async (data) => {
    const c = await createClinic(data);
    const [all, stats] = await Promise.all([getAllClinics(), getClinicStats()]);
    set({ clinics: all, stats }); return c;
  },
  editClinic: async (id, data) => {
    const c = await updateClinic(id, data);
    const [all, stats] = await Promise.all([getAllClinics(), getClinicStats()]);
    set({ clinics: all, stats }); return c;
  },
  archiveClinic: async (id) => {
    await archiveClinic(id);
    const [all, stats] = await Promise.all([getAllClinics(), getClinicStats()]);
    set({ clinics: all, stats });
  },
  unarchiveClinic: async (id) => {
    await unarchiveClinic(id);
    const [all, stats] = await Promise.all([getAllClinics(), getClinicStats()]);
    set({ clinics: all, stats });
  },
  deleteClinic: async (id) => {
    await deleteClinic(id);
    const [all, stats] = await Promise.all([getAllClinics(), getClinicStats()]);
    set({ clinics: all, stats });
  },
  setSearchQuery: (q) => set({ searchQuery: q }),
  setShowArchived: (show) => set({ showArchived: show }),
  getFilteredClinics: () => {
    const { clinics, searchQuery, showArchived } = get();
    const q = searchQuery.trim().toLowerCase();
    return clinics.filter(c => {
      if (!showArchived && c.archived) return false;
      if (showArchived && !c.archived) return false;
      if (q) {
        return c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          (c.doctorName || '').toLowerCase().includes(q);
      }
      return true;
    });
  },
}));
