// ============================================================
// Pharmacy Model – Independent Entity
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
  // علاقة many-to-many مع الأطباء
  doctorIds: string[];       // FK → Doctor[]
  doctorId?: string;         // legacy – يُبقى للتوافق مع البيانات القديمة
  doctorName?: string;       // cached for display (legacy)
  address: string;
  phone: string;
  notes: string;
  location?: GeoLocation;
  active: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;

  // ── حقول جديدة: معلومات المسؤولين ───────────────────────────
  compoundId?: string;              // FK → Compound

  // صاحب الصيدلية
  ownerName: string;
  ownerPhone: string;

  // مسؤول الطلبات
  orderManagerName: string;
  orderManagerPhone: string;

  // الصيدلاني المقيم
  residentPharmacistName: string;
  residentPharmacistPhone: string;
}

export type PharmacyFormData = Omit<Pharmacy, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;
