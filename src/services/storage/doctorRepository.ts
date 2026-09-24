import { db } from '@/services/storage/db';
import type { Doctor, DoctorFormData } from '@/modules/doctors/models/doctor.model';

// ============================================================
// Doctor Repository
// ============================================================

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

export async function getAllDoctors(): Promise<Doctor[]> {
  return db.doctors.orderBy('createdAt').reverse().toArray();
}

export async function getActiveDoctors(): Promise<Doctor[]> {
  return db.doctors.filter(d => !d.archived).toArray()
    .then(arr => arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  return db.doctors.get(id);
}

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

export async function updateDoctor(id: string, data: Partial<DoctorFormData>): Promise<Doctor> {
  const existing = await db.doctors.get(id);
  if (!existing) throw new Error(`Doctor ${id} not found`);
  const updated: Doctor = { ...existing, ...data, updatedAt: now() };
  await db.doctors.put(updated);
  return updated;
}

export async function archiveDoctor(id: string): Promise<void> {
  await db.doctors.update(id, { archived: true, active: false, updatedAt: now() });
}

export async function unarchiveDoctor(id: string): Promise<void> {
  await db.doctors.update(id, { archived: false, active: true, updatedAt: now() });
}

export async function deleteDoctor(id: string): Promise<void> {
  await db.doctors.delete(id);
}

export async function getDoctorStats() {
  const all = await getActiveDoctors();
  return { total: all.length, withLocation: all.filter(d => !!d.location).length };
}

/** Get pharmacies affiliated with a doctor (via doctorIds array) */
export async function getDoctorPharmacies(doctorId: string) {
  const all = await db.pharmacies.filter(p => !p.archived).toArray();
  return all.filter(p =>
    (p.doctorIds && p.doctorIds.includes(doctorId)) ||
    p.doctorId === doctorId // legacy fallback
  );
}

/** Get clinics belonging to a doctor */
export async function getDoctorClinics(doctorId: string) {
  return db.clinics.where('doctorId').equals(doctorId).toArray();
}

/** Get visits for a doctor */
export async function getDoctorVisits(doctorId: string) {
  return db.visits.where('doctorId').equals(doctorId)
    .or('entityId').equals(doctorId)
    .toArray()
    .then(arr => arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}
