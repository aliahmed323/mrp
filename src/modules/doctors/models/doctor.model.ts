// ============================================================
// Doctor / Clinic / Pharmacy Model
// ============================================================

export type DoctorType = 'doctor' | 'clinic' | 'pharmacy';

export const DOCTOR_TYPE_LABELS: Record<DoctorType, string> = {
  doctor: 'طبيب',
  clinic: 'عيادة',
  pharmacy: 'صيدلية',
};

export const DOCTOR_TYPE_ICONS: Record<DoctorType, string> = {
  doctor: '🩺',
  clinic: '🏥',
  pharmacy: '💊',
};

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
  'صيدلية',
  'أخرى',
];

export interface DoctorLocation {
  latitude: number;
  longitude: number;
}

export interface Doctor {
  id: string;
  name: string;
  type: DoctorType;
  specialty: string;
  phone: string;
  address: string;
  notes: string;
  location?: DoctorLocation;
  active: boolean;
  archived: boolean;
  createdAt: string;  // ISO datetime
  updatedAt: string;  // ISO datetime
}

export type DoctorFormData = Omit<Doctor, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;

export type DoctorSummary = Pick<
  Doctor,
  'id' | 'name' | 'type' | 'specialty' | 'phone' | 'address' | 'location' | 'active' | 'archived'
>;
