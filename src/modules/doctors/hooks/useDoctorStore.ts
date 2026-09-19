import { create } from 'zustand';
import type { Doctor, DoctorFormData } from '@/modules/doctors/models/doctor.model';
import {
  getAllDoctors, createDoctor, updateDoctor,
  archiveDoctor, unarchiveDoctor, deleteDoctor, getDoctorStats,
} from '@/services/storage/doctorRepository';

interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  stats: { total: number; withLocation: number };
  showArchived: boolean;
  loadDoctors: () => Promise<void>;
  addDoctor: (data: DoctorFormData) => Promise<Doctor>;
  editDoctor: (id: string, data: Partial<DoctorFormData>) => Promise<Doctor>;
  archiveDoctor: (id: string) => Promise<void>;
  unarchiveDoctor: (id: string) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setShowArchived: (show: boolean) => void;
  getFilteredDoctors: () => Doctor[];
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  doctors: [], loading: false, error: null, searchQuery: '',
  stats: { total: 0, withLocation: 0 }, showArchived: false,

  loadDoctors: async () => {
    set({ loading: true, error: null });
    try {
      const [all, stats] = await Promise.all([getAllDoctors(), getDoctorStats()]);
      set({ doctors: all, stats, loading: false });
    } catch { set({ error: 'فشل تحميل الأطباء', loading: false }); }
  },
  addDoctor: async (data) => {
    const doc = await createDoctor(data);
    const [all, stats] = await Promise.all([getAllDoctors(), getDoctorStats()]);
    set({ doctors: all, stats }); return doc;
  },
  editDoctor: async (id, data) => {
    const doc = await updateDoctor(id, data);
    const [all, stats] = await Promise.all([getAllDoctors(), getDoctorStats()]);
    set({ doctors: all, stats }); return doc;
  },
  archiveDoctor: async (id) => {
    await archiveDoctor(id);
    const [all, stats] = await Promise.all([getAllDoctors(), getDoctorStats()]);
    set({ doctors: all, stats });
  },
  unarchiveDoctor: async (id) => {
    await unarchiveDoctor(id);
    const [all, stats] = await Promise.all([getAllDoctors(), getDoctorStats()]);
    set({ doctors: all, stats });
  },
  deleteDoctor: async (id) => {
    await deleteDoctor(id);
    const [all, stats] = await Promise.all([getAllDoctors(), getDoctorStats()]);
    set({ doctors: all, stats });
  },
  setSearchQuery: (q) => set({ searchQuery: q }),
  setShowArchived: (show) => set({ showArchived: show }),
  getFilteredDoctors: () => {
    const { doctors, searchQuery, showArchived } = get();
    const q = searchQuery.trim().toLowerCase();
    return doctors.filter(d => {
      if (!showArchived && d.archived) return false;
      if (showArchived && !d.archived) return false;
      if (q) {
        return d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.area.toLowerCase().includes(q);
      }
      return true;
    });
  },
}));
