import { create } from 'zustand';
import type { Zone, ZoneFormData } from '@/modules/zones/models/zone.model';
import {
  getAllZones, createZone, updateZone,
  archiveZone, unarchiveZone, deleteZone,
} from '@/services/storage/zoneRepository';

interface ZoneState {
  zones: Zone[];
  loading: boolean;
  error: string | null;
  loadZones: () => Promise<void>;
  addZone: (data: ZoneFormData) => Promise<Zone>;
  editZone: (id: string, data: Partial<ZoneFormData>) => Promise<Zone>;
  archiveZone: (id: string) => Promise<void>;
  unarchiveZone: (id: string) => Promise<void>;
  deleteZone: (id: string) => Promise<void>;
}

export const useZoneStore = create<ZoneState>((set) => ({
  zones: [], loading: false, error: null,

  loadZones: async () => {
    set({ loading: true, error: null });
    try {
      const all = await getAllZones();
      set({ zones: all, loading: false });
    } catch { set({ error: 'فشل تحميل المناطق', loading: false }); }
  },

  addZone: async (data) => {
    const zone = await createZone(data);
    const all = await getAllZones();
    set({ zones: all }); return zone;
  },

  editZone: async (id, data) => {
    const zone = await updateZone(id, data);
    const all = await getAllZones();
    set({ zones: all }); return zone;
  },

  archiveZone: async (id) => {
    await archiveZone(id);
    const all = await getAllZones();
    set({ zones: all });
  },

  unarchiveZone: async (id) => {
    await unarchiveZone(id);
    const all = await getAllZones();
    set({ zones: all });
  },

  deleteZone: async (id) => {
    await deleteZone(id);
    const all = await getAllZones();
    set({ zones: all });
  },
}));
