import { db } from '@/services/storage/db';
import type { Compound, CompoundFormData } from '@/modules/compounds/models/compound.model';

// ============================================================
// Compound Repository
// ============================================================

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

export async function getAllCompounds(): Promise<Compound[]> {
  return db.compounds.orderBy('name').toArray();
}

export async function getActiveCompounds(): Promise<Compound[]> {
  return db.compounds.filter(c => !c.archived).toArray()
    .then(arr => arr.sort((a, b) => a.name.localeCompare(b.name)));
}

export async function getCompoundById(id: string): Promise<Compound | undefined> {
  return db.compounds.get(id);
}

export async function createCompound(data: CompoundFormData): Promise<Compound> {
  const compound: Compound = {
    ...data,
    id: generateId(),
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.compounds.add(compound);
  return compound;
}

export async function updateCompound(id: string, data: Partial<CompoundFormData>): Promise<Compound> {
  const existing = await db.compounds.get(id);
  if (!existing) throw new Error(`Compound ${id} not found`);
  const updated: Compound = { ...existing, ...data, updatedAt: now() };
  await db.compounds.put(updated);
  return updated;
}

export async function archiveCompound(id: string): Promise<void> {
  await db.compounds.update(id, { archived: true, active: false, updatedAt: now() });
}

export async function unarchiveCompound(id: string): Promise<void> {
  await db.compounds.update(id, { archived: false, active: true, updatedAt: now() });
}

export async function deleteCompound(id: string): Promise<void> {
  await db.compounds.delete(id);
}

/** Get all doctors belonging to a compound */
export async function getCompoundDoctors(compoundId: string) {
  return db.doctors.where('compoundIds').equals(compoundId).toArray();
}

/** Get all pharmacies belonging to a compound */
export async function getCompoundPharmacies(compoundId: string) {
  return db.pharmacies.where('compoundIds').equals(compoundId).toArray();
}
