import { db } from '@/services/storage/db';
import type { Clinic, ClinicFormData } from '@/modules/clinics/models/clinic.model';

// ============================================================
// Clinic Repository
// ============================================================

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

export async function getAllClinics(): Promise<Clinic[]> {
  return db.clinics.orderBy('createdAt').reverse().toArray();
}

export async function getActiveClinics(): Promise<Clinic[]> {
  return db.clinics.filter(c => !c.archived).toArray()
    .then(arr => arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function getClinicById(id: string): Promise<Clinic | undefined> {
  return db.clinics.get(id);
}

export async function createClinic(data: ClinicFormData): Promise<Clinic> {
  const clinic: Clinic = {
    ...data, id: generateId(), archived: false, createdAt: now(), updatedAt: now(),
  };
  await db.clinics.add(clinic);
  return clinic;
}

export async function updateClinic(id: string, data: Partial<ClinicFormData>): Promise<Clinic> {
  const existing = await db.clinics.get(id);
  if (!existing) throw new Error(`Clinic ${id} not found`);
  const updated: Clinic = { ...existing, ...data, updatedAt: now() };
  await db.clinics.put(updated);
  return updated;
}

export async function archiveClinic(id: string): Promise<void> {
  await db.clinics.update(id, { archived: true, active: false, updatedAt: now() });
}

export async function unarchiveClinic(id: string): Promise<void> {
  await db.clinics.update(id, { archived: false, active: true, updatedAt: now() });
}

export async function deleteClinic(id: string): Promise<void> {
  await db.clinics.delete(id);
}

export async function getClinicStats() {
  const all = await getActiveClinics();
  return { total: all.length, withLocation: all.filter(c => !!c.location).length };
}
