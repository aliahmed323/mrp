import { db } from '@/services/storage/db';
import type { Pharmacy, PharmacyFormData } from '@/modules/pharmacies/models/pharmacy.model';

// ============================================================
// Pharmacy Repository
// ============================================================

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

export async function getAllPharmacies(): Promise<Pharmacy[]> {
  return db.pharmacies.orderBy('createdAt').reverse().toArray();
}

export async function getActivePharmacies(): Promise<Pharmacy[]> {
  return db.pharmacies.filter(p => !p.archived).toArray()
    .then(arr => arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function getPharmacyById(id: string): Promise<Pharmacy | undefined> {
  return db.pharmacies.get(id);
}

export async function createPharmacy(data: PharmacyFormData): Promise<Pharmacy> {
  const pharmacy: Pharmacy = {
    ...data,
    id: generateId(),
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.pharmacies.add(pharmacy);
  return pharmacy;
}

export async function updatePharmacy(id: string, data: Partial<PharmacyFormData>): Promise<Pharmacy> {
  const existing = await db.pharmacies.get(id);
  if (!existing) throw new Error(`Pharmacy ${id} not found`);
  const updated: Pharmacy = { ...existing, ...data, updatedAt: now() };
  await db.pharmacies.put(updated);
  return updated;
}

export async function archivePharmacy(id: string): Promise<void> {
  await db.pharmacies.update(id, { archived: true, active: false, updatedAt: now() });
}

export async function unarchivePharmacy(id: string): Promise<void> {
  await db.pharmacies.update(id, { archived: false, active: true, updatedAt: now() });
}

export async function deletePharmacy(id: string): Promise<void> {
  await db.pharmacies.delete(id);
}

export async function getPharmacyStats() {
  const all = await getActivePharmacies();
  return {
    total: all.length,
    independent: all.filter(p => p.ownership === 'independent').length,
    affiliated: all.filter(p => p.ownership === 'doctor-affiliated').length,
    withLocation: all.filter(p => !!p.location).length,
  };
}

/** Get pharmacies linked to a specific doctor (many-to-many) */
export async function getPharmacyDoctors(pharmacyId: string) {
  const pharmacy = await db.pharmacies.get(pharmacyId);
  if (!pharmacy) return [];
  const ids = pharmacy.doctorIds || (pharmacy.doctorId ? [pharmacy.doctorId] : []);
  if (ids.length === 0) return [];
  return db.doctors.where('id').anyOf(ids).toArray();
}
