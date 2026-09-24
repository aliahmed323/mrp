import { create } from 'zustand';
import type { Compound, CompoundFormData } from '@/modules/compounds/models/compound.model';
import {
  getAllCompounds, createCompound, updateCompound,
  archiveCompound, unarchiveCompound, deleteCompound,
} from '@/services/storage/compoundRepository';

interface CompoundState {
  compounds: Compound[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  showArchived: boolean;
  loadCompounds: () => Promise<void>;
  addCompound: (data: CompoundFormData) => Promise<Compound>;
  editCompound: (id: string, data: Partial<CompoundFormData>) => Promise<Compound>;
  archiveCompound: (id: string) => Promise<void>;
  unarchiveCompound: (id: string) => Promise<void>;
  deleteCompound: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setShowArchived: (show: boolean) => void;
  getFilteredCompounds: () => Compound[];
}

export const useCompoundStore = create<CompoundState>((set, get) => ({
  compounds: [], loading: false, error: null, searchQuery: '', showArchived: false,

  loadCompounds: async () => {
    set({ loading: true, error: null });
    try {
      const all = await getAllCompounds();
      set({ compounds: all, loading: false });
    } catch { set({ error: 'فشل تحميل المجمعات', loading: false }); }
  },

  addCompound: async (data) => {
    const c = await createCompound(data);
    const all = await getAllCompounds();
    set({ compounds: all });
    return c;
  },

  editCompound: async (id, data) => {
    const c = await updateCompound(id, data);
    const all = await getAllCompounds();
    set({ compounds: all });
    return c;
  },

  archiveCompound: async (id) => {
    await archiveCompound(id);
    const all = await getAllCompounds();
    set({ compounds: all });
  },

  unarchiveCompound: async (id) => {
    await unarchiveCompound(id);
    const all = await getAllCompounds();
    set({ compounds: all });
  },

  deleteCompound: async (id) => {
    await deleteCompound(id);
    const all = await getAllCompounds();
    set({ compounds: all });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setShowArchived: (show) => set({ showArchived: show }),

  getFilteredCompounds: () => {
    const { compounds, searchQuery, showArchived } = get();
    const q = searchQuery.trim().toLowerCase();
    return compounds.filter(c => {
      if (!showArchived && c.archived) return false;
      if (showArchived && !c.archived) return false;
      if (q) return c.name.toLowerCase().includes(q) || c.area.toLowerCase().includes(q);
      return true;
    });
  },
}));
