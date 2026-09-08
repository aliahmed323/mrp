// ============================================================
// Product Model – Medical Representative Second Brain
// ============================================================

export type BonusType = 'percentage' | 'units' | 'points' | 'cash' | 'none';
export type DosageForm =
  | 'tablet' | 'capsule' | 'syrup' | 'suspension' | 'injection'
  | 'cream' | 'ointment' | 'drops' | 'inhaler' | 'patch' | 'suppository' | 'other';

export type ExpiryStatus = 'valid' | 'expiring_soon' | 'expired';

export interface Product {
  id: string;
  productName: string;
  genericName: string;
  brandName: string;
  company: string;
  image?: string; // base64 data URL or blob URL
  category: string;
  strength: string;
  dosageForm: DosageForm | string;
  packSize: string;
  numberOfUnits: number;
  stripPrice: number;
  netPrice: number;
  sellingPrice: number;
  bonus: string;
  bonusType: BonusType;
  bonusPoints: number;
  expiryDate: string; // ISO date string YYYY-MM-DD
  protected: boolean;
  burning: boolean;
  competitors: string[];
  notes: string;
  active: boolean;
  archived: boolean;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

// Form-friendly version (same shape, for react-hook-form)
export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;

// Minimal product for display lists
export type ProductSummary = Pick<
  Product,
  | 'id' | 'productName' | 'genericName' | 'company' | 'image'
  | 'strength' | 'packSize' | 'stripPrice' | 'netPrice'
  | 'bonus' | 'bonusPoints' | 'expiryDate' | 'protected' | 'burning'
  | 'active' | 'archived' | 'category'
>;

// ============================================================
// Helpers
// ============================================================

/** Returns the expiry status of a product based on today */
export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  if (!expiryDate) return 'valid';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 90) return 'expiring_soon'; // within 3 months
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
