import Dexie, { type Table } from 'dexie';
import type { Product } from '@/modules/products/models/product.model';
import type { Doctor } from '@/modules/doctors/models/doctor.model';
import type { Pharmacy } from '@/modules/pharmacies/models/pharmacy.model';
import type { Clinic } from '@/modules/clinics/models/clinic.model';
import type { Visit } from '@/modules/visits/models/visit.model';
import type { QuickResponse } from '@/modules/visits/models/quickResponse.model';
import type { Order } from '@/modules/orders/models/order.model';

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
      // Clear old doctors table data (was combined doctor+pharmacy+clinic)
      // Users will re-enter as separate entities
      return tx.table('doctors').clear();
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

  // Seed preset quick responses
  const qrCount = await db.quickResponses.count();
  if (qrCount === 0) {
    const { seedPresetResponses } = await import('@/data/seed-quick-responses');
    await seedPresetResponses();
  }
}
