import Dexie, { type Table } from 'dexie';
import type { Product } from '@/modules/products/models/product.model';
import type { Doctor } from '@/modules/doctors/models/doctor.model';

// ============================================================
// Database Schema – Medical Representative Second Brain
// ============================================================

class MedRepDatabase extends Dexie {
  products!: Table<Product>;
  doctors!: Table<Doctor>;

  constructor() {
    super('MedRepDB');

    this.version(1).stores({
      // Indexed fields (non-indexed fields are still stored, just not searchable via index)
      products: [
        'id',             // primary key
        'productName',
        'company',
        'category',
        'active',
        'archived',
        'expiryDate',
        'createdAt',
        'updatedAt',
      ].join(', '),
    });

    this.version(2).stores({
      // Products – unchanged
      products: [
        'id',
        'productName',
        'company',
        'category',
        'active',
        'archived',
        'expiryDate',
        'createdAt',
        'updatedAt',
      ].join(', '),
      // Doctors / Clinics / Pharmacies
      doctors: [
        'id',
        'name',
        'type',
        'specialty',
        'active',
        'archived',
        'createdAt',
        'updatedAt',
      ].join(', '),
    });
  }
}

export const db = new MedRepDatabase();

// ============================================================
// Seed sample data on first run
// ============================================================
export async function seedIfEmpty() {
  const count = await db.products.count();
  if (count === 0) {
    const { sampleProducts } = await import('@/data/sample-products');
    await db.products.bulkAdd(sampleProducts);
  }
}
