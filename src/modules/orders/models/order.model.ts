// ============================================================
// Order Model – Pharmacy orders for products
// ============================================================

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'orange',
  confirmed: 'blue',
  delivered: 'green',
  cancelled: 'red',
};

export interface Order {
  id: string;
  pharmacyId: string;
  pharmacyName: string;     // cached
  doctorId?: string;
  doctorName?: string;      // cached
  productId: string;
  productName: string;      // cached
  quantity: number;
  bonus: string;
  netPrice: number;
  status: OrderStatus;
  orderDate: string;        // YYYY-MM-DD
  expectedDate?: string;    // YYYY-MM-DD
  followUpDate?: string;    // YYYY-MM-DD
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderFormData = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
