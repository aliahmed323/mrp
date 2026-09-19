import { create } from 'zustand';
import type { Order, OrderFormData } from '@/modules/orders/models/order.model';
import {
  getAllOrders, createOrder, updateOrder, deleteOrder, getOrderStats,
} from '@/services/storage/orderRepository';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  stats: { total: number; pending: number; confirmed: number; delivered: number };
  loadOrders: () => Promise<void>;
  addOrder: (data: OrderFormData) => Promise<Order>;
  editOrder: (id: string, data: Partial<OrderFormData>) => Promise<Order>;
  removeOrder: (id: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [], loading: false, error: null,
  stats: { total: 0, pending: 0, confirmed: 0, delivered: 0 },

  loadOrders: async () => {
    set({ loading: true, error: null });
    try {
      const [all, stats] = await Promise.all([getAllOrders(), getOrderStats()]);
      set({ orders: all, stats, loading: false });
    } catch { set({ error: 'فشل تحميل الطلبات', loading: false }); }
  },
  addOrder: async (data) => {
    const order = await createOrder(data);
    const [all, stats] = await Promise.all([getAllOrders(), getOrderStats()]);
    set({ orders: all, stats }); return order;
  },
  editOrder: async (id, data) => {
    const order = await updateOrder(id, data);
    const [all, stats] = await Promise.all([getAllOrders(), getOrderStats()]);
    set({ orders: all, stats }); return order;
  },
  removeOrder: async (id) => {
    await deleteOrder(id);
    const [all, stats] = await Promise.all([getAllOrders(), getOrderStats()]);
    set({ orders: all, stats });
  },
}));
