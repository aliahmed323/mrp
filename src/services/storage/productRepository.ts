import { db } from '@/services/storage/db';
import type { Product, ProductFormData } from '@/modules/products/models/product.model';

// ============================================================
// Product Repository – single source of truth for DB access
// ============================================================

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

/** Get all products (active + archived) */
export async function getAllProducts(): Promise<Product[]> {
  return db.products.orderBy('createdAt').reverse().toArray();
}

/** Get only active (non-archived) products */
export async function getActiveProducts(): Promise<Product[]> {
  return db.products
    .filter(p => !p.archived)
    .toArray()
    .then(arr => arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/** Get a single product by ID */
export async function getProductById(id: string): Promise<Product | undefined> {
  return db.products.get(id);
}

/** Create a new product */
export async function createProduct(data: ProductFormData): Promise<Product> {
  const product: Product = {
    ...data,
    id: generateId(),
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.products.add(product);
  return product;
}

/** Bulk create products */
export async function bulkCreateProducts(dataList: ProductFormData[]): Promise<void> {
  const products: Product[] = dataList.map(data => ({
    ...data,
    id: generateId(),
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  }));
  await db.products.bulkAdd(products);
}

/** Update an existing product */
export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
  const existing = await db.products.get(id);
  if (!existing) throw new Error(`Product ${id} not found`);
  const updated: Product = { ...existing, ...data, updatedAt: now() };
  await db.products.put(updated);
  return updated;
}

/** Archive a product (soft delete) */
export async function archiveProduct(id: string): Promise<void> {
  await db.products.update(id, { archived: true, active: false, updatedAt: now() });
}

/** Unarchive a product */
export async function unarchiveProduct(id: string): Promise<void> {
  await db.products.update(id, { archived: false, active: true, updatedAt: now() });
}

/** Permanently delete a product */
export async function deleteProduct(id: string): Promise<void> {
  await db.products.delete(id);
}

/** Count products by status */
export async function getProductStats() {
  const all = await getActiveProducts();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soonThreshold = new Date(today);
  soonThreshold.setDate(soonThreshold.getDate() + 90);

  let active = 0;
  let expiringSoon = 0;
  let expired = 0;

  for (const p of all) {
    if (!p.expiryDate) { active++; continue; }
    const expiry = new Date(p.expiryDate);
    if (expiry < today) { expired++; }
    else if (expiry <= soonThreshold) { expiringSoon++; }
    else { active++; }
  }

  return { total: all.length, active, expiringSoon, expired };
}
