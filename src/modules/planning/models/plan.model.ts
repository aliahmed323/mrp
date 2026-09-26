export interface PlanTask {
  id: string;
  type: 'doctor' | 'pharmacy' | 'clinic' | 'follow_up';
  entityId: string;
  entityName: string;
  action: 'product_follow_up' | 'product_pitch' | 'all_products' | 'general';
  productNames: string[];
  notes: string;
  quickNote?: string;
  reminder?: number; // minutes before
  status: 'pending' | 'completed';
  visitId?: string; // the generated visit ID
  followUpId?: string; // if it was generated from a follow-up
}

export interface DailyPlan {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'draft' | 'active' | 'completed';
  tasks: PlanTask[];
  createdAt: string;
}
