import { db } from './db';
import type { DailyPlan, PlanTask } from '@/modules/planning/models/plan.model';
import { getPendingFollowUps } from './visitRepository';

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

export async function getPlanByDate(date: string): Promise<DailyPlan | undefined> {
  const plans = await db.plans.where('date').equals(date).toArray();
  return plans[0];
}

export async function createPlan(date: string): Promise<DailyPlan> {
  const existing = await getPlanByDate(date);
  if (existing) return existing;

  // Auto-pull pending follow-ups for this date
  const followUps = await getPendingFollowUps();
  const dateFollowUps = followUps.filter(f => f.followUpDate === date);

  const initialTasks: PlanTask[] = dateFollowUps.map(f => ({
    id: generateId(),
    type: 'follow_up',
    entityId: f.entityId,
    entityName: f.entityName,
    action: 'general',
    productNames: [],
    notes: f.followUpNotes || 'متابعة مستحقة',
    status: 'pending',
    followUpId: f.id,
  }));

  const plan: DailyPlan = {
    id: generateId(),
    date,
    status: 'draft',
    tasks: initialTasks,
    createdAt: now()
  };

  await db.plans.add(plan);
  return plan;
}

export async function updatePlan(id: string, data: Partial<DailyPlan>): Promise<DailyPlan> {
  const existing = await db.plans.get(id);
  if (!existing) throw new Error('Plan not found');
  const updated = { ...existing, ...data };
  await db.plans.put(updated);
  return updated;
}

export async function deletePlan(id: string): Promise<void> {
  await db.plans.delete(id);
}
