import { create } from 'zustand';
import type { Doctor, DoctorFormData } from '@/modules/doctors/models/doctor.model';
import {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  archiveDoctor,
  unarchiveDoctor,
  deleteDoctor,
  getDoctorStats,
} from '@/services/storage/doctorRepository';

// ============================================================
// Filter & Sort Types
// ============================================================

export type DoctorSortField = 'name' | 'type' | 'specialty' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface DoctorFilters {
  type?: 'doctor' | 'clinic' | 'pharmacy';
  hasLocation?: boolean;
  archived?: boolean;
}

export interface DoctorStats {
  total: number;
  doctors: number;
  clinics: number;
  pharmacies: number;
  withLocation: number;
}

// ============================================================
// Store Shape
// ============================================================

interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: DoctorFilters;
  sortField: DoctorSortField;
  sortOrder: SortOrder;
  stats: DoctorStats;
  showArchived: boolean;

  // Actions
  loadDoctors: () => Promise<void>;
  addDoctor: (data: DoctorFormData) => Promise<Doctor>;
  editDoctor: (id: string, data: Partial<DoctorFormData>) => Promise<Doctor>;
  archiveDoctor: (id: string) => Promise<void>;
  unarchiveDoctor: (id: string) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setFilters: (f: Partial<DoctorFilters>) => void;
  clearFilters: () => void;
  setSortField: (field: DoctorSortField) => void;
  toggleSortOrder: () => void;
  setShowArchived: (show: boolean) => void;

  // Derived
  getFilteredDoctors: () => Doctor[];
}

// ============================================================
// Store
// ============================================================

export const useDoctorStore = create<DoctorState>((set, get) => ({
  doctors: [],
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
  sortField: 'createdAt',
  sortOrder: 'desc',
  stats: { total: 0, doctors: 0, clinics: 0, pharmacies: 0, withLocation: 0 },
  showArchived: false,

  loadDoctors: async () => {
    set({ loading: true, error: null });
    try {
      const [all, stats] = await Promise.all([
        getAllDoctors(),
        getDoctorStats(),
      ]);
      set({ doctors: all, stats, loading: false });
    } catch {
      set({ error: 'فشل تحميل الأطباء', loading: false });
    }
  },

  addDoctor: async (data) => {
    const doctor = await createDoctor(data);
    const [all, stats] = await Promise.all([getAllDoctors(), getDoctorStats()]);
    set({ doctors: all, stats });
    return doctor;
  },

  editDoctor: async (id, data) => {
    const doctor = await updateDoctor(id, data);
    const [all, stats] = await Promise.all([getAllDoctors(), getDoctorStats()]);
    set({ doctors: all, stats });
    return doctor;
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
  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),
  clearFilters: () => set({ filters: {} }),
  setSortField: (field) => set({ sortField: field }),
  toggleSortOrder: () => set(s => ({ sortOrder: s.sortOrder === 'asc' ? 'desc' : 'asc' })),
  setShowArchived: (show) => set({ showArchived: show }),

  getFilteredDoctors: () => {
    const { doctors, searchQuery, filters, sortField, sortOrder, showArchived } = get();
    const q = searchQuery.trim().toLowerCase();

    let result = doctors.filter(d => {
      // Archived filter
      if (!showArchived && d.archived) return false;
      if (showArchived && !d.archived) return false;

      // Search
      if (q) {
        const match =
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q) ||
          d.phone.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Filters
      if (filters.type && d.type !== filters.type) return false;
      if (filters.hasLocation !== undefined) {
        const has = !!d.location;
        if (filters.hasLocation !== has) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'type': cmp = a.type.localeCompare(b.type); break;
        case 'specialty': cmp = a.specialty.localeCompare(b.specialty); break;
        case 'createdAt': cmp = a.createdAt.localeCompare(b.createdAt); break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  },
}));
