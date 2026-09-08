import { create } from 'zustand';
import type { Product } from '@/modules/products/models/product.model';
import {
  getActiveProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  unarchiveProduct,
  deleteProduct,
  getProductStats,
} from '@/services/storage/productRepository';
import type { ProductFormData } from '@/modules/products/models/product.model';

// ============================================================
// Filter & Sort Types
// ============================================================

export type SortField = 'productName' | 'stripPrice' | 'bonusPoints' | 'expiryDate' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilters {
  protected?: boolean;
  burning?: boolean;
  expiryStatus?: 'valid' | 'expiring_soon' | 'expired';
  company?: string;
  category?: string;
  archived?: boolean;
}

export interface ProductStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
}

// ============================================================
// Store Shape
// ============================================================

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: ProductFilters;
  sortField: SortField;
  sortOrder: SortOrder;
  stats: ProductStats;
  showArchived: boolean;

  // Actions
  loadProducts: () => Promise<void>;
  addProduct: (data: ProductFormData) => Promise<Product>;
  editProduct: (id: string, data: Partial<ProductFormData>) => Promise<Product>;
  archiveProduct: (id: string) => Promise<void>;
  unarchiveProduct: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setFilters: (f: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  setShowArchived: (show: boolean) => void;

  // Derived
  getFilteredProducts: () => Product[];
}

// ============================================================
// Helpers
// ============================================================

function getExpiryStatusLocal(expiryDate: string): 'valid' | 'expiring_soon' | 'expired' {
  if (!expiryDate) return 'valid';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diff = Math.floor((expiry.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return 'expired';
  if (diff <= 90) return 'expiring_soon';
  return 'valid';
}

// ============================================================
// Store
// ============================================================

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
  sortField: 'createdAt',
  sortOrder: 'desc',
  stats: { total: 0, active: 0, expiringSoon: 0, expired: 0 },
  showArchived: false,

  loadProducts: async () => {
    set({ loading: true, error: null });
    try {
      const [all, stats] = await Promise.all([
        getAllProducts(),
        getProductStats(),
      ]);
      set({ products: all, stats, loading: false });
    } catch (e) {
      set({ error: 'فشل تحميل المنتجات', loading: false });
    }
  },

  addProduct: async (data) => {
    const product = await createProduct(data);
    const [all, stats] = await Promise.all([getAllProducts(), getProductStats()]);
    set({ products: all, stats });
    return product;
  },

  editProduct: async (id, data) => {
    const product = await updateProduct(id, data);
    const [all, stats] = await Promise.all([getAllProducts(), getProductStats()]);
    set({ products: all, stats });
    return product;
  },

  archiveProduct: async (id) => {
    await archiveProduct(id);
    const [all, stats] = await Promise.all([getAllProducts(), getProductStats()]);
    set({ products: all, stats });
  },

  unarchiveProduct: async (id) => {
    await unarchiveProduct(id);
    const [all, stats] = await Promise.all([getAllProducts(), getProductStats()]);
    set({ products: all, stats });
  },

  deleteProduct: async (id) => {
    await deleteProduct(id);
    const [all, stats] = await Promise.all([getAllProducts(), getProductStats()]);
    set({ products: all, stats });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),
  clearFilters: () => set({ filters: {} }),
  setSortField: (field) => set({ sortField: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  toggleSortOrder: () => set(s => ({ sortOrder: s.sortOrder === 'asc' ? 'desc' : 'asc' })),
  setShowArchived: (show) => set({ showArchived: show }),

  getFilteredProducts: () => {
    const { products, searchQuery, filters, sortField, sortOrder, showArchived } = get();
    const q = searchQuery.trim().toLowerCase();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    let result = products.filter(p => {
      // Archived filter
      if (!showArchived && p.archived) return false;
      if (showArchived && !p.archived) return false;

      // Search
      if (q) {
        const match =
          p.productName.toLowerCase().includes(q) ||
          p.genericName.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Filters
      if (filters.protected !== undefined && p.protected !== filters.protected) return false;
      if (filters.burning !== undefined && p.burning !== filters.burning) return false;
      if (filters.company && p.company !== filters.company) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.expiryStatus) {
        if (getExpiryStatusLocal(p.expiryDate) !== filters.expiryStatus) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'productName': cmp = a.productName.localeCompare(b.productName); break;
        case 'stripPrice': cmp = a.stripPrice - b.stripPrice; break;
        case 'bonusPoints': cmp = a.bonusPoints - b.bonusPoints; break;
        case 'expiryDate': cmp = (a.expiryDate || '').localeCompare(b.expiryDate || ''); break;
        case 'createdAt': cmp = a.createdAt.localeCompare(b.createdAt); break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  },
}));
