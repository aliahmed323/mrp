import Dexie, { type Table } from 'dexie';
import type { Product } from '@/modules/products/models/product.model';

// ============================================================
// Database Schema – Medical Representative Second Brain
// ============================================================

class MedRepDatabase extends Dexie {
  products!: Table<Product>;

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
