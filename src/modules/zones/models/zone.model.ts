// ============================================================
// Zone Model – Geographical Work Area
// ============================================================

export interface Zone {
  id: string;
  name: string;         // اسم المنطقة مثل: تكريت، كركوك، سامراء
  description: string;
  active: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ZoneFormData = Omit<Zone, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;
