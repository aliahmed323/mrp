// ============================================================
// Pharmacy Model – Independent Entity
// A pharmacy can be independent or affiliated with a doctor.
// ============================================================

import type { GeoLocation } from '@/modules/doctors/models/doctor.model';

export type PharmacyOwnership = 'independent' | 'doctor-affiliated';

export const PHARMACY_OWNERSHIP_LABELS: Record<PharmacyOwnership, string> = {
  'independent': 'صيدلية مستقلة',
  'doctor-affiliated': 'صيدلية تابعة لطبيب',
};

export interface Pharmacy {
  id: string;
  name: string;
  ownership: PharmacyOwnership;
  doctorId?: string;     // FK → Doctor (only when doctor-affiliated)
  doctorName?: string;   // cached for display
  address: string;
  phone: string;
  notes: string;
  location?: GeoLocation;
  active: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PharmacyFormData = Omit<Pharmacy, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;
