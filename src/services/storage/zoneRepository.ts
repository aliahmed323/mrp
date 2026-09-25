import { db } from '@/services/storage/db';
import type { Zone, ZoneFormData } from '@/modules/zones/models/zone.model';

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

export async function getAllZones(): Promise<Zone[]> {
  return db.zones.orderBy('name').toArray();
}

export async function getActiveZones(): Promise<Zone[]> {
  return db.zones.filter(z => !z.archived).toArray()
    .then(arr => arr.sort((a, b) => a.name.localeCompare(b.name)));
}

export async function getZoneById(id: string): Promise<Zone | undefined> {
  return db.zones.get(id);
}

export async function createZone(data: ZoneFormData): Promise<Zone> {
  const zone: Zone = {
    ...data,
    id: generateId(),
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.zones.add(zone);
  return zone;
}

export async function updateZone(id: string, data: Partial<ZoneFormData>): Promise<Zone> {
  const existing = await db.zones.get(id);
  if (!existing) throw new Error(`Zone ${id} not found`);
  const updated: Zone = { ...existing, ...data, updatedAt: now() };
  await db.zones.put(updated);
  return updated;
}

export async function archiveZone(id: string): Promise<void> {
  await db.zones.update(id, { archived: true, active: false, updatedAt: now() });
}

export async function unarchiveZone(id: string): Promise<void> {
  await db.zones.update(id, { archived: false, active: true, updatedAt: now() });
}

export async function deleteZone(id: string): Promise<void> {
  await db.zones.delete(id);
}

/** Get all compounds in a zone */
export async function getZoneCompounds(zoneId: string) {
  return db.compounds.where('zoneId').equals(zoneId).toArray();
}

/** Get all doctors in a zone */
export async function getZoneDoctors(zoneId: string) {
  return db.doctors.where('zoneId').equals(zoneId).toArray();
}

/** Get all pharmacies in a zone */
export async function getZonePharmacies(zoneId: string) {
  return db.pharmacies.where('zoneId').equals(zoneId).toArray();
}
