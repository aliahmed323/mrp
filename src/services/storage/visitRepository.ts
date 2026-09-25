import { db } from '@/services/storage/db';
import type { Visit, VisitFormData } from '@/modules/visits/models/visit.model';

// ============================================================
// Visit Repository
// ============================================================

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

export async function getAllVisits(): Promise<Visit[]> {
  return db.visits.orderBy('createdAt').reverse().toArray();
}

export async function getVisitById(id: string): Promise<Visit | undefined> {
  return db.visits.get(id);
}

export async function createVisit(data: VisitFormData): Promise<Visit> {
  const visit: Visit = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
  await db.visits.add(visit);
  return visit;
}

export async function updateVisit(id: string, data: Partial<VisitFormData>): Promise<Visit> {
  const existing = await db.visits.get(id);
  if (!existing) throw new Error(`Visit ${id} not found`);
  const updated: Visit = { ...existing, ...data, updatedAt: now() };
  await db.visits.put(updated);
  return updated;
}

export async function deleteVisit(id: string): Promise<void> {
  await db.visits.delete(id);
}

/** Get visits by date (YYYY-MM-DD) */
export async function getVisitsByDate(date: string): Promise<Visit[]> {
  return db.visits.where('date').equals(date).toArray()
    .then(arr => arr.sort((a, b) => a.time.localeCompare(b.time)));
}

/** Get visits by date range */
export async function getVisitsByDateRange(from: string, to: string): Promise<Visit[]> {
  return db.visits.where('date').between(from, to, true, true).toArray()
    .then(arr => arr.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      return d !== 0 ? d : a.time.localeCompare(b.time);
    }));
}

/** Get today's visits */
export async function getTodayVisits(): Promise<Visit[]> {
  const today = new Date().toISOString().split('T')[0];
  return getVisitsByDate(today);
}

/** Get pending follow-ups */
export async function getPendingFollowUps(): Promise<Visit[]> {
  return db.visits.filter(v => v.followUpRequired && !v.isFollowUpCompleted)
    .toArray()
    .then(arr => arr.sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || '')));
}

/** Get archived follow-ups */
export async function getArchivedFollowUps(): Promise<Visit[]> {
  return db.visits.filter(v => v.followUpRequired && !!v.isFollowUpCompleted)
    .toArray()
    .then(arr => arr.sort((a, b) => (b.followUpDate || '').localeCompare(a.followUpDate || '')));
}

/** Get visit stats */
export async function getVisitStats() {
  const today = new Date().toISOString().split('T')[0];
  const all = await getAllVisits();
  const todayVisits = all.filter(v => v.date === today);
  const pendingFollowUps = all.filter(v => v.followUpRequired);
  return { total: all.length, today: todayVisits.length, pendingFollowUps: pendingFollowUps.length };
}
