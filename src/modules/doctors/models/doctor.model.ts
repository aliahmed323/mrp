// ============================================================
// Doctor Model – Independent Entity
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

// تقييم تعامل الطبيب مع المندوب – قابل للتوسعة
export type DoctorAttitude = 'excellent' | 'good' | 'average' | 'poor';

export const DOCTOR_ATTITUDE_LABELS: Record<DoctorAttitude, string> = {
  excellent: 'راقي',
  good: 'جيد',
  average: 'متوسط',
  poor: 'رديء',
};

export const DOCTOR_ATTITUDE_COLORS: Record<DoctorAttitude, string> = {
  excellent: 'emerald',
  good: 'blue',
  average: 'amber',
  poor: 'red',
};

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// عيادة مضمّنة داخل كيان الطبيب
export interface DoctorClinic {
  id: string;
  name: string;       // اسم العيادة أو وصفها
  address: string;    // العنوان
  phone?: string;
  isPrimary: boolean; // العيادة الأساسية
}

export interface Doctor {
  id: string;
  name: string;
  specialties: string[];          // متعدد الاختصاصات
  area: string;                   // المنطقة / العنوان
  phone: string;
  notes: string;
  location?: GeoLocation;
  active: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;

  // ── حقول جديدة ──────────────────────────────────────────────
  attitude: DoctorAttitude;       // تقييم التعامل
  relationshipType: 'Dealer' | 'Dirty Dealer' | 'Scientific'; // تصنيف العلاقة
  zoneId: string;                 // المنطقة الجغرافية
  compoundIds: string[];          // FKs → Compound (للتنظيم الجغرافي)
  pharmacyIds: string[];          // صيدليات مرتبطة (many-to-many)
  clinics: DoctorClinic[];        // عيادات الطبيب (embedded)
}

export type DoctorFormData = Omit<Doctor, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;
