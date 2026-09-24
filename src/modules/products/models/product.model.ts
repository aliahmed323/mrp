// ============================================================
// Product Model – Medical Representative Second Brain
// ============================================================

export type BonusType = 'percentage' | 'units' | 'points' | 'cash' | 'none';

// أنواع العبوات / الأشكال – قابلة للتوسعة
export type PackagingType =
  | 'strips'
  | 'ampoules'
  | 'syrup'
  | 'syrup_ampoules'
  | 'vials'
  | 'sachets'
  | 'cream_tube'
  | 'drops'
  | 'inhaler'
  | 'suppositories'
  | 'other';

export const PACKAGING_TYPE_LABELS: Record<PackagingType | string, string> = {
  strips: 'أشرطة (Strips)',
  ampoules: 'أمبولات (Ampoules)',
  syrup: 'شراب (Syrup)',
  syrup_ampoules: 'أمبولات شراب',
  vials: 'فيالات (Vials)',
  sachets: 'أكياس (Sachets)',
  cream_tube: 'أنبوب كريم',
  drops: 'قطرات (Drops)',
  inhaler: 'بخاخ (Inhaler)',
  suppositories: 'تحاميل (Suppositories)',
  other: 'أخرى',
};

export type DosageForm =
  | 'tablet' | 'capsule' | 'syrup' | 'suspension' | 'injection'
  | 'cream' | 'ointment' | 'drops' | 'inhaler' | 'patch' | 'suppository' | 'other';

export type ExpiryStatus = 'valid' | 'expiring_soon' | 'expired';

// مادة فعالة مع تركيزها الخاص
export interface ActiveIngredient {
  name: string;          // اسم المادة الفعالة
  concentration: string; // التركيز (مثال: 500mg, 250mg/5ml)
}

export interface Product {
  id: string;
  productName: string;
  genericName: string;          // legacy – يُبقى للتوافق
  activeIngredients: ActiveIngredient[]; // متعدد المواد الفعالة
  brandName: string;
  company: string;
  image?: string;
  category: string;
  strength: string;             // legacy
  dosageForm: DosageForm | string;
  packagingType: PackagingType | string; // نوع العبوة الجديد
  unitsPerPackage: number;      // عدد الوحدات في الباكيت
  boxPrice: number;
  stripsPerBox: number;         // legacy
  stripPrice: number;
  netPrice: number;
  bonus: string;
  bonusType: BonusType;
  bonusPoints: number;
  expiryDate: string;
  protected: boolean;
  burning: boolean;
  competitors: string[];
  notes: string;
  active: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;

export type ProductSummary = Pick<
  Product,
  | 'id' | 'productName' | 'genericName' | 'company' | 'image'
  | 'strength' | 'boxPrice' | 'stripsPerBox' | 'stripPrice' | 'netPrice'
  | 'bonus' | 'bonusPoints' | 'expiryDate' | 'protected' | 'burning'
  | 'active' | 'archived' | 'category'
>;

// ============================================================
// Helpers
// ============================================================

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  if (!expiryDate) return 'valid';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 90) return 'expiring_soon';
  return 'valid';
}

export const EXPIRY_STATUS_LABELS: Record<ExpiryStatus, string> = {
  valid: 'صالح',
  expiring_soon: 'ينتهي قريباً',
  expired: 'منتهي الصلاحية',
};

export const DOSAGE_FORM_LABELS: Record<string, string> = {
  tablet: 'أقراص',
  capsule: 'كبسولات',
  syrup: 'شراب',
  suspension: 'معلق',
  injection: 'حقنة',
  cream: 'كريم',
  ointment: 'مرهم',
  drops: 'قطرات',
  inhaler: 'بخاخ',
  patch: 'لصقة',
  suppository: 'تحاميل',
  other: 'أخرى',
};

export const BONUS_TYPE_LABELS: Record<BonusType, string> = {
  percentage: 'نسبة مئوية %',
  units: 'وحدات',
  points: 'نقاط',
  cash: 'نقدي',
  none: 'لا يوجد',
};
