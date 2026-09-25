// ============================================================
// Visit Model – Quick Field Entry record
// Records doctor, pharmacy, or clinic visits with outcomes.
// ============================================================

import type { GeoLocation } from '@/modules/doctors/models/doctor.model';

export type VisitType = 'doctor' | 'pharmacy' | 'clinic';

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  doctor: 'زيارة طبيب',
  pharmacy: 'زيارة صيدلية',
  clinic: 'زيارة عيادة',
};

export const VISIT_TYPE_ICONS: Record<VisitType, string> = {
  doctor: '🩺',
  pharmacy: '💊',
  clinic: '🏥',
};

export interface Visit {
  id: string;
  type: VisitType;
  entityId: string;            // Doctor/Pharmacy/Clinic ID
  entityName: string;          // cached name for quick display
  doctorId?: string;           // linked doctor (for pharmacy/clinic visits)
  doctorName?: string;         // cached
  date: string;                // YYYY-MM-DD
  time: string;                // HH:mm
  outcomes: string[];          // selected preset + custom responses
  feedback: string;            // free text note
  productIds: string[];        // products discussed
  productNames: string[];      // cached product names
  followUpRequired: boolean;
  followUpDate?: string;
  followUpPriority?: 'high' | 'medium' | 'low'; // Red, Orange, Green
  isFollowUpCompleted?: boolean;
  followUpNotes?: string;
  location?: GeoLocation;
  createdAt: string;
  updatedAt: string;
}

export type VisitFormData = Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>;
