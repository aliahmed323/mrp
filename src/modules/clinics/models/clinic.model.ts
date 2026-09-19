// ============================================================
// Clinic Model – Doctor's Visit Location
// A clinic always belongs to a doctor.
// ============================================================

import type { GeoLocation } from '@/modules/doctors/models/doctor.model';

export interface Clinic {
  id: string;
  name: string;
  doctorId: string;       // FK → Doctor (required)
  doctorName?: string;    // cached for display
  address: string;
  phone: string;
  notes: string;
  location?: GeoLocation;
  active: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ClinicFormData = Omit<Clinic, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;
