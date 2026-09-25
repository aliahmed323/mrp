import { db } from '@/services/storage/db';
import type { PointCenter, PointCenterFormData } from '@/modules/pointCenters/models/pointCenter.model';

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

export async function getAllPointCenters(): Promise<PointCenter[]> {
  return db.pointCenters.orderBy('createdAt').reverse().toArray();
}

export async function getPointCenterById(id: string): Promise<PointCenter | undefined> {
  return db.pointCenters.get(id);
}

export async function createPointCenter(data: PointCenterFormData): Promise<PointCenter> {
  const pc: PointCenter = { ...data, id: generateId(), createdAt: now() };
  await db.pointCenters.add(pc);
  return pc;
}

export async function updatePointCenter(id: string, data: Partial<PointCenterFormData>): Promise<PointCenter> {
  const existing = await getPointCenterById(id);
  if (!existing) throw new Error('Point Center not found');
  const updated = { ...existing, ...data };
  await db.pointCenters.put(updated);
  return updated;
}

export async function deletePointCenter(id: string): Promise<void> {
  await db.pointCenters.delete(id);
}
