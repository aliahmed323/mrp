import { create } from 'zustand';
import type { DailyPlan, PlanTask } from '../models/plan.model';
import { getPlanByDate, createPlan, updatePlan } from '@/services/storage/planRepository';

interface PlanState {
  currentPlan: DailyPlan | null;
  loading: boolean;
  loadPlanForDate: (date: string) => Promise<void>;
  updatePlanTasks: (tasks: PlanTask[]) => Promise<void>;
  markPlanCompleted: () => Promise<void>;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  currentPlan: null,
  loading: false,

  loadPlanForDate: async (date) => {
    set({ loading: true });
    try {
      let plan = await getPlanByDate(date);
      if (!plan) {
        plan = await createPlan(date);
      }
      set({ currentPlan: plan, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updatePlanTasks: async (tasks) => {
    const { currentPlan } = get();
    if (!currentPlan) return;
    const updated = await updatePlan(currentPlan.id, { tasks, status: 'active' });
    set({ currentPlan: updated });
  },

  markPlanCompleted: async () => {
    const { currentPlan } = get();
    if (!currentPlan) return;
    const updated = await updatePlan(currentPlan.id, { status: 'completed' });
    set({ currentPlan: updated });
  }
}));
