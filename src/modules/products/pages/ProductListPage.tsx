import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Archive } from 'lucide-react';
import { useProductStore } from '../hooks/useProductStore';
import { ProductCard } from '../components/ProductCard';
import { ProductSearch, ProductFilters, ProductSort } from '../components/ProductControls';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/States';

export function ProductListPage() {
  const navigate = useNavigate();
  const {
    loading, error, searchQuery, filters, showArchived,
    setShowArchived, loadProducts, getFilteredProducts,
  } = useProductStore();

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const products = getFilteredProducts();
  const hasActiveFilters = searchQuery || Object.keys(filters).length > 0;

  const emptyType = searchQuery ? 'no-search' : hasActiveFilters ? 'no-filter' : 'no-products';

  if (loading) return <LoadingState message="جارٍ تحميل المنتجات..." />;
  if (error) return (
    <div className="text-center py-12 text-red-500">
      <p>{error}</p>
      <Button className="mt-3" onClick={loadProducts}>إعادة المحاولة</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">المنتجات</h2>
          <p className="text-xs text-slate-500">{products.length} منتج</p>
        </div>
        <Button onClick={() => navigate('/products/new')} size="sm">
          <Plus size={16} /> إضافة منتج
        </Button>
      </div>

      {/* Search */}
      <ProductSearch />

      {/* Filters + Sort Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <ProductFilters />
        <ProductSort />
      </div>

      {/* Archive Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`text-xs flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors ${
            showArchived
              ? 'bg-slate-100 text-slate-700 border-slate-300'
              : 'text-slate-500 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Archive size={12} />
          {showArchived ? 'عرض النشطة' : 'عرض المؤرشفة'}
        </button>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <EmptyState
          type={emptyType}
          action={emptyType === 'no-products' ? { label: 'إضافة أول منتج', onClick: () => navigate('/products/new') } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
