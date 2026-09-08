import { Search, X, SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useProductStore, type ProductFilters, type SortField } from '../hooks/useProductStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ============================================================
// Search Bar
// ============================================================

export function ProductSearch() {
  const { searchQuery, setSearchQuery } = useProductStore();
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        placeholder="ابحث بالاسم، المادة الفعالة، الشركة..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F52BA] focus:ring-1 focus:ring-[#0F52BA] outline-none"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// ============================================================
// Filter Chips
// ============================================================

const filterOptions: { key: keyof ProductFilters; value: unknown; label: string }[] = [
  { key: 'protected', value: true, label: '🛡 محمي' },
  { key: 'protected', value: false, label: 'غير محمي' },
  { key: 'burning', value: true, label: '🔥 حرق' },
  { key: 'expiryStatus', value: 'expired', label: '❌ منتهي' },
  { key: 'expiryStatus', value: 'expiring_soon', label: '⚠ ينتهي قريباً' },
  { key: 'expiryStatus', value: 'valid', label: '✓ صالح' },
];

export function ProductFilters() {
  const { filters, setFilters, clearFilters } = useProductStore();
  const [showMore, setShowMore] = useState(false);

  const activeCount = Object.keys(filters).length;

  const isActive = (key: keyof ProductFilters, value: unknown) =>
    filters[key] === value;

  const toggleFilter = (key: keyof ProductFilters, value: unknown) => {
    if (isActive(key, value)) {
      const next = { ...filters };
      delete next[key];
      setFilters(next);
    } else {
      setFilters({ [key]: value } as Partial<ProductFilters>);
    }
  };

  const visible = showMore ? filterOptions : filterOptions.slice(0, 4);

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {visible.map(opt => (
        <button
          key={`${opt.key}-${String(opt.value)}`}
          onClick={() => toggleFilter(opt.key, opt.value)}
          className={cn(
            'h-7 px-2.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap',
            isActive(opt.key, opt.value)
              ? 'bg-[#0F52BA] text-white border-[#0F52BA]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          )}
        >
          {opt.label}
        </button>
      ))}

      {!showMore && filterOptions.length > 4 && (
        <button
          onClick={() => setShowMore(true)}
          className="h-7 px-2.5 rounded-full text-xs text-slate-500 border border-dashed border-slate-300 hover:border-slate-400 flex items-center gap-1"
        >
          المزيد <ChevronDown size={12} />
        </button>
      )}

      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="h-7 px-2.5 rounded-full text-xs text-red-500 border border-red-200 hover:bg-red-50 flex items-center gap-1"
        >
          <X size={11} /> مسح الفلاتر ({activeCount})
        </button>
      )}
    </div>
  );
}

// ============================================================
// Sort Controls
// ============================================================

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'createdAt', label: 'الأحدث' },
  { value: 'productName', label: 'الاسم' },
  { value: 'stripPrice', label: 'السعر' },
  { value: 'bonusPoints', label: 'البونص' },
  { value: 'expiryDate', label: 'الصلاحية' },
];

export function ProductSort() {
  const { sortField, sortOrder, setSortField, toggleSortOrder } = useProductStore();

  return (
    <div className="flex items-center gap-2">
      <select
        value={sortField}
        onChange={e => setSortField(e.target.value as SortField)}
        className="h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white outline-none focus:border-[#0F52BA]"
      >
        {sortOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button
        onClick={toggleSortOrder}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 transition-colors"
        title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
      >
        <ArrowUpDown size={14} className={cn('transition-transform', sortOrder === 'desc' && 'scale-y-[-1]')} />
      </button>
    </div>
  );
}
