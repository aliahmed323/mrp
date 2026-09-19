// ============================================================
// Doctor Model – Independent Entity
// A doctor has clinics and may have affiliated pharmacies.
// ============================================================

export const SPECIALTY_OPTIONS = [
  'طب عام',
  'باطنة',
  'قلب وأوعية دموية',
  'صدر',
  'جهاز هضمي',
  'سكر وغدد صماء',
  'أعصاب',
  'عظام',
  'جراحة عامة',
  'نساء وتوليد',
  'أطفال',
  'جلدية',
  'أنف وأذن وحنجرة',
  'عيون',
  'مسالك بولية',
  'أورام',
  'أسنان',
  'نفسية',
  'تخدير',
  'أشعة',
  'أخرى',
];

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  area: string;         // المنطقة / العنوان
  phone: string;
  notes: string;
  location?: GeoLocation;
  active: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DoctorFormData = Omit<Doctor, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;
