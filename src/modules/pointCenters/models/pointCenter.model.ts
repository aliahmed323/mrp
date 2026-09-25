export interface PointCenter {
  id: string;
  name: string;
  type: 'doctor' | 'pharmacy';
  doctorId?: string;
  pharmacyId?: string;
  active: boolean; // مستمر
  notes: string;
  createdAt: string;
}

export type PointCenterFormData = Omit<PointCenter, 'id' | 'createdAt'>;
