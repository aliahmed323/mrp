// ============================================================
// Compound Model – Geographic/Organizational Unit
// مجمع سكني/تجاري يضم أطباء وصيدليات
// ============================================================

export interface Compound {
  id: string;
  name: string;        // اسم المجمع
  area: string;        // المنطقة
  description: string; // وصف إضافي
  notes: string;
  active: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CompoundFormData = Omit<Compound, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;
