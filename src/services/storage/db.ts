import Dexie, { type Table } from 'dexie';
import type { Product } from '@/modules/products/models/product.model';
import type { Doctor } from '@/modules/doctors/models/doctor.model';
import type { Pharmacy } from '@/modules/pharmacies/models/pharmacy.model';
import type { Clinic } from '@/modules/clinics/models/clinic.model';
import type { Visit } from '@/modules/visits/models/visit.model';
import type { QuickResponse } from '@/modules/visits/models/quickResponse.model';
import type { Order } from '@/modules/orders/models/order.model';
import type { Compound } from '@/modules/compounds/models/compound.model';
import type { Zone } from '@/modules/zones/models/zone.model';
import type { DailyPlan } from '@/modules/planning/models/plan.model';

// ============================================================
// Database Schema – Field Sales Second Brain
// ============================================================

class MedRepDatabase extends Dexie {
  products!: Table<Product>;
  doctors!: Table<Doctor>;
  pharmacies!: Table<Pharmacy>;
  clinics!: Table<Clinic>;
  visits!: Table<Visit>;
  quickResponses!: Table<QuickResponse>;
  orders!: Table<Order>;
  compounds!: Table<Compound>;
  zones!: Table<Zone>;
  plans!: Table<DailyPlan>;
  pointCenters!: Table<any>; // Will do next

  constructor() {
    super('MedRepDB');

    this.version(1).stores({
      products: [
        'id', 'productName', 'company', 'category',
        'active', 'archived', 'expiryDate', 'createdAt', 'updatedAt',
      ].join(', '),
    });

    this.version(2).stores({
      products: [
        'id', 'productName', 'company', 'category',
        'active', 'archived', 'expiryDate', 'createdAt', 'updatedAt',
      ].join(', '),
      doctors: [
        'id', 'name', 'type', 'specialty',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
    });

    // v3: Full restructure – separate entities with relationships
    this.version(3).stores({
      products: [
        'id', 'productName', 'company', 'category',
        'active', 'archived', 'expiryDate', 'createdAt', 'updatedAt',
      ].join(', '),
      doctors: [
        'id', 'name', 'specialty', 'area',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      pharmacies: [
        'id', 'name', 'ownership', 'doctorId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      clinics: [
        'id', 'name', 'doctorId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      visits: [
        'id', 'type', 'entityId', 'doctorId', 'date',
        'followUpRequired', 'followUpDate', 'createdAt',
      ].join(', '),
      quickResponses: [
        'id', 'text', 'category', 'isPreset', 'usageCount', 'active', 'createdAt',
      ].join(', '),
      orders: [
        'id', 'pharmacyId', 'doctorId', 'productId',
        'status', 'orderDate', 'followUpDate', 'createdAt',
      ].join(', '),
    }).upgrade(tx => {
      return tx.table('doctors').clear();
    });

    // v4: Add compounds table + new doctor/pharmacy fields migration
    this.version(4).stores({
      products: [
        'id', 'productName', 'company', 'category',
        'active', 'archived', 'expiryDate', 'createdAt', 'updatedAt',
      ].join(', '),
      doctors: [
        'id', 'name', 'area', 'compoundId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      pharmacies: [
        'id', 'name', 'ownership', 'doctorId', 'compoundId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      clinics: [
        'id', 'name', 'doctorId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      visits: [
        'id', 'type', 'entityId', 'doctorId', 'date',
        'followUpRequired', 'followUpDate', 'createdAt',
      ].join(', '),
      quickResponses: [
        'id', 'text', 'category', 'isPreset', 'usageCount', 'active', 'createdAt',
      ].join(', '),
      orders: [
        'id', 'pharmacyId', 'doctorId', 'productId',
        'status', 'orderDate', 'followUpDate', 'createdAt',
      ].join(', '),
      compounds: [
        'id', 'name', 'area',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
    }).upgrade(async tx => {
      // Migrate doctors: specialty (string) → specialties (string[]), add new defaults
      await tx.table('doctors').toCollection().modify((doctor: any) => {
        if (doctor.specialty && !doctor.specialties) {
          doctor.specialties = doctor.specialty ? [doctor.specialty] : [];
        } else if (!doctor.specialties) {
          doctor.specialties = [];
        }
        if (!doctor.loyaltyScore) doctor.loyaltyScore = 0;
        if (!doctor.attitude) doctor.attitude = 'good';
        if (!doctor.residentialCompound) doctor.residentialCompound = '';
        if (!doctor.pharmacyIds) doctor.pharmacyIds = [];
        if (!doctor.clinics) doctor.clinics = [];
      });

      // Migrate pharmacies: add new fields defaults
      await tx.table('pharmacies').toCollection().modify((pharmacy: any) => {
        if (!pharmacy.doctorIds) {
          pharmacy.doctorIds = pharmacy.doctorId ? [pharmacy.doctorId] : [];
        }
        if (!pharmacy.ownerName) pharmacy.ownerName = '';
        if (!pharmacy.ownerPhone) pharmacy.ownerPhone = '';
        if (!pharmacy.orderManagerName) pharmacy.orderManagerName = '';
        if (!pharmacy.orderManagerPhone) pharmacy.orderManagerPhone = '';
        if (!pharmacy.residentPharmacistName) pharmacy.residentPharmacistName = '';
        if (!pharmacy.residentPharmacistPhone) pharmacy.residentPharmacistPhone = '';
      });

      // Migrate products: add new fields defaults
      await tx.table('products').toCollection().modify((product: any) => {
        if (!product.activeIngredients) {
          product.activeIngredients = product.genericName
            ? [{ name: product.genericName, concentration: product.strength || '' }]
            : [];
        }
        if (!product.packagingType) product.packagingType = 'strips';
        if (!product.unitsPerPackage) product.unitsPerPackage = product.stripsPerBox || 1;
      });
    });

    // v5: Doctor classification phase 1 + Compound many-to-many
    this.version(5).stores({
      products: [
        'id', 'productName', 'company', 'category',
        'active', 'archived', 'expiryDate', 'createdAt', 'updatedAt',
      ].join(', '),
      doctors: [
        'id', 'name', 'area', '*compoundIds',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      pharmacies: [
        'id', 'name', 'ownership', '*doctorIds', '*compoundIds',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      clinics: [
        'id', 'name', 'doctorId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      visits: [
        'id', 'type', 'entityId', 'doctorId', 'date',
        'followUpRequired', 'followUpDate', 'createdAt',
      ].join(', '),
      quickResponses: [
        'id', 'text', 'category', 'isPreset', 'usageCount', 'active', 'createdAt',
      ].join(', '),
      orders: [
        'id', 'pharmacyId', 'doctorId', 'productId',
        'status', 'orderDate', 'followUpDate', 'createdAt',
      ].join(', '),
      compounds: [
        'id', 'name', 'area',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
    }).upgrade(async tx => {
      // Migrate doctors
      await tx.table('doctors').toCollection().modify((doctor: any) => {
        delete doctor.loyaltyScore;
        delete doctor.residentialCompound;
        if (!doctor.relationshipType) doctor.relationshipType = 'Scientific';
        if (!doctor.compoundIds) {
          doctor.compoundIds = doctor.compoundId ? [doctor.compoundId] : [];
        }
        delete doctor.compoundId;
      });

      // Migrate pharmacies
      await tx.table('pharmacies').toCollection().modify((pharmacy: any) => {
        if (!pharmacy.compoundIds) {
          pharmacy.compoundIds = pharmacy.compoundId ? [pharmacy.compoundId] : [];
        }
        delete pharmacy.compoundId;
      });
    });

    // v6: Zone System
    this.version(6).stores({
      products: [
        'id', 'productName', 'company', 'category',
        'active', 'archived', 'expiryDate', 'createdAt', 'updatedAt',
      ].join(', '),
      doctors: [
        'id', 'name', 'area', 'zoneId', '*compoundIds',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      pharmacies: [
        'id', 'name', 'ownership', 'zoneId', '*doctorIds', '*compoundIds',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      clinics: [
        'id', 'name', 'doctorId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      visits: [
        'id', 'type', 'entityId', 'doctorId', 'date',
        'followUpRequired', 'followUpDate', 'createdAt',
      ].join(', '),
      quickResponses: [
        'id', 'text', 'category', 'isPreset', 'usageCount', 'active', 'createdAt',
      ].join(', '),
      orders: [
        'id', 'pharmacyId', 'doctorId', 'productId',
        'status', 'orderDate', 'followUpDate', 'createdAt',
      ].join(', '),
      compounds: [
        'id', 'name', 'area', 'zoneId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      zones: [
        'id', 'name',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
    }).upgrade(async tx => {
      // Initialize zoneId for existing doctors, pharmacies, compounds
      await tx.table('doctors').toCollection().modify((doc: any) => {
        if (!doc.zoneId) doc.zoneId = '';
      });
      await tx.table('pharmacies').toCollection().modify((ph: any) => {
        if (!ph.zoneId) ph.zoneId = '';
      });
      await tx.table('compounds').toCollection().modify((c: any) => {
        if (!c.zoneId) c.zoneId = '';
      });
    });


    // v7: Plans, Point Centers, and Order extensions
    this.version(7).stores({
      products: [
        'id', 'productName', 'company', 'category',
        'active', 'archived', 'expiryDate', 'createdAt', 'updatedAt',
      ].join(', '),
      doctors: [
        'id', 'name', 'area', 'zoneId', '*compoundIds',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      pharmacies: [
        'id', 'name', 'ownership', 'zoneId', '*doctorIds', '*compoundIds',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      clinics: [
        'id', 'name', 'doctorId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      visits: [
        'id', 'type', 'entityId', 'doctorId', 'date',
        'followUpRequired', 'followUpDate', 'createdAt',
      ].join(', '),
      quickResponses: [
        'id', 'text', 'category', 'isPreset', 'usageCount', 'active', 'createdAt',
      ].join(', '),
      orders: [
        'id', 'pharmacyId', 'doctorId', 'productId', 'pointCenterId',
        'status', 'orderDate', 'followUpDate', 'createdAt',
      ].join(', '),
      compounds: [
        'id', 'name', 'area', 'zoneId',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      zones: [
        'id', 'name',
        'active', 'archived', 'createdAt', 'updatedAt',
      ].join(', '),
      plans: [
        'id', 'date', 'status', 'createdAt',
      ].join(', '),
      pointCenters: [
        'id', 'name', 'type', 'doctorId', 'pharmacyId', 'active', 'createdAt',
      ].join(', '),
    }).upgrade(async tx => {
      await tx.table('orders').toCollection().modify((order: any) => {
        if (!order.pointCenterId) order.pointCenterId = '';
        if (order.quantity === undefined) order.quantity = 0;
      });
    });
  }
}

export const db = new MedRepDatabase();

// ============================================================
// Seed sample data on first run
// ============================================================
export async function seedIfEmpty() {
  const prodCount = await db.products.count();
  if (prodCount === 0) {
    const { sampleProducts } = await import('@/data/sample-products');
    await db.products.bulkAdd(sampleProducts);
  }

  const qrCount = await db.quickResponses.count();
  if (qrCount === 0) {
    const { seedPresetResponses } = await import('@/data/seed-quick-responses');
    await seedPresetResponses();
  }
}
