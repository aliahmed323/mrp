import { db } from '@/services/storage/db';
import type { Order, OrderFormData } from '@/modules/orders/models/order.model';

// ============================================================
// Order Repository
// ============================================================

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

export async function getAllOrders(): Promise<Order[]> {
  return db.orders.orderBy('createdAt').reverse().toArray();
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  return db.orders.get(id);
}

export async function createOrder(data: OrderFormData): Promise<Order> {
  const order: Order = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
  await db.orders.add(order);
  return order;
}

export async function updateOrder(id: string, data: Partial<OrderFormData>): Promise<Order> {
  const existing = await db.orders.get(id);
  if (!existing) throw new Error(`Order ${id} not found`);
  const updated: Order = { ...existing, ...data, updatedAt: now() };
  await db.orders.put(updated);
  return updated;
}

export async function deleteOrder(id: string): Promise<void> {
  await db.orders.delete(id);
}

export async function getPendingOrders(): Promise<Order[]> {
  return db.orders.where('status').equals('pending').toArray()
    .then(arr => arr.sort((a, b) => a.orderDate.localeCompare(b.orderDate)));
}

export async function getOrderStats() {
  const all = await getAllOrders();
  return {
    total: all.length,
    pending: all.filter(o => o.status === 'pending').length,
    confirmed: all.filter(o => o.status === 'confirmed').length,
    delivered: all.filter(o => o.status === 'delivered').length,
  };
}
