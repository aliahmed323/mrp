import { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { db } from '@/services/storage/db';
import type { Product } from '@/modules/products/models/product.model';
import { cn } from '@/utils/cn';

interface ProductSelectorProps {
  value: string[]; // array of product IDs
  onChange: (value: string[]) => void;
  onNamesChange?: (names: string[]) => void; // to cache names
}

export function ProductSelector({ value, onChange, onNamesChange }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    // Load active products
    db.products.filter(p => p.active && !p.archived).toArray().then(setProducts);
  }, []);

  const toggleProduct = (product: Product) => {
    let newIds: string[];
    let newNames: string[];
    
    if (value.includes(product.id)) {
      newIds = value.filter(id => id !== product.id);
    } else {
      newIds = [...value, product.id];
    }
    
    onChange(newIds);
    
    if (onNamesChange) {
      newNames = products.filter(p => newIds.includes(p.id)).map(p => p.productName);
      onNamesChange(newNames);
    }
  };

  const filteredProducts = search.trim()
    ? products.filter(p => p.productName.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 border-b border-slate-100 h-10">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
        />
      </div>

      <div className="max-h-40 overflow-y-auto p-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">لا توجد منتجات</div>
        ) : (
          <div className="grid grid-cols-2 gap-1 p-1">
            {filteredProducts.map(p => {
              const isSelected = value.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg text-right transition-colors text-sm border',
                    isSelected
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                      : 'bg-transparent border-transparent text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border',
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                  )}>
                    {isSelected && <Check size={10} />}
                  </div>
                  <span className="truncate">{p.productName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
