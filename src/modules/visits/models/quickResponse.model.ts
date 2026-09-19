// ============================================================
// Quick Response Model – Preset & Custom saved responses
// Used in Quick Field Entry for fast visit logging.
// ============================================================

export type ResponseCategory = 'outcome' | 'feedback';

export interface QuickResponse {
  id: string;
  text: string;
  category: ResponseCategory;
  isPreset: boolean;       // true = built-in, false = user-created
  usageCount: number;      // for sorting by frequency
  active: boolean;
  createdAt: string;
}

export type QuickResponseFormData = Pick<QuickResponse, 'text' | 'category'>;

// ============================================================
// Preset Responses – shipped with the app
// ============================================================

export const PRESET_OUTCOMES: string[] = [
  'تم عرض المنتج',
  'تم شرح المنتج',
  'تم ترك Sample',
  'تم الاتفاق على تنزيل المنتج',
  'تم طلب كمية',
  'تم طلب Order Sheet',
  'المنتج متوفر',
  'المنتج غير متوفر',
  'الطبيب غير موجود',
  'مسؤول الطلبيات غير موجود',
  'متابعة لاحقًا',
  'رفض المنتج',
  'رفض استقبال المندوب',
  'المنتج متوفر من المنافس',
  'سيتم الطلب لاحقًا',
];

export const PRESET_FEEDBACK: string[] = [
  'أعجب بالمادة جدًا',
  'طلب متابعة الأسبوع القادم',
  'سيتم مراجعة الطلب',
  'الدكتور أعجب بالمنتج',
  'مسؤول الطلبيات غير موجود، سيتم المتابعة لاحقًا',
];
