import { db } from '@/services/storage/db';
import type { Doctor, DoctorFormData } from '@/modules/doctors/models/doctor.model';

// ============================================================
// Doctor Repository – single source of truth for DB access
// ============================================================

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

/** Get all doctors (active + archived) */
export async function getAllDoctors(): Promise<Doctor[]> {
  return db.doctors.orderBy('createdAt').reverse().toArray();
}

/** Get only active (non-archived) doctors */
export async function getActiveDoctors(): Promise<Doctor[]> {
  return db.doctors
    .filter(d => !d.archived)
    .toArray()
    .then(arr => arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/** Get a single doctor by ID */
export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  return db.doctors.get(id);
}

/** Create a new doctor */
export async function createDoctor(data: DoctorFormData): Promise<Doctor> {
  const doctor: Doctor = {
    ...data,
    id: generateId(),
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.doctors.add(doctor);
  return doctor;
}

/** Update an existing doctor */
export async function updateDoctor(id: string, data: Partial<DoctorFormData>): Promise<Doctor> {
  const existing = await db.doctors.get(id);
  if (!existing) throw new Error(`Doctor ${id} not found`);
  const updated: Doctor = { ...existing, ...data, updatedAt: now() };
  await db.doctors.put(updated);
  return updated;
}

/** Archive a doctor (soft delete) */
export async function archiveDoctor(id: string): Promise<void> {
  await db.doctors.update(id, { archived: true, active: false, updatedAt: now() });
}

/** Unarchive a doctor */
export async function unarchiveDoctor(id: string): Promise<void> {
  await db.doctors.update(id, { archived: false, active: true, updatedAt: now() });
}

/** Permanently delete a doctor */
export async function deleteDoctor(id: string): Promise<void> {
  await db.doctors.delete(id);
}

/** Count doctors by type */
export async function getDoctorStats() {
  const all = await getActiveDoctors();
  let doctors = 0;
  let clinics = 0;
  let pharmacies = 0;
  let withLocation = 0;

  for (const d of all) {
    if (d.type === 'doctor') doctors++;
    else if (d.type === 'clinic') clinics++;
    else if (d.type === 'pharmacy') pharmacies++;
    if (d.location) withLocation++;
  }

  return { total: all.length, doctors, clinics, pharmacies, withLocation };
}
