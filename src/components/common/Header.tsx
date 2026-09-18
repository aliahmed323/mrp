import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Stethoscope } from 'lucide-react';
import { useProductStore } from '@/modules/products/hooks/useProductStore';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useProductStore();
  const navigate = useNavigate();

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) navigate('/products');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 px-4 h-14 max-w-5xl mx-auto">

        {/* Logo + Brand */}
        {!searchOpen && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0F52BA] flex items-center justify-center shrink-0">
              <Stethoscope size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 leading-tight truncate">MedRep</h1>
              <p className="text-[10px] text-slate-500 leading-tight hidden sm:block">Second Brain</p>
            </div>
          </div>
        )}

        {/* Search Bar (expanded) */}
        {searchOpen && (
          <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-xl px-3 h-10">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              autoFocus
              type="search"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => { setSearchOpen(s => !s); if (searchOpen) clearSearch(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="بحث"
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
          <button
            onClick={() => navigate('/products/new')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0F52BA] text-white hover:bg-[#1d4ed8] transition-colors"
            aria-label="إضافة منتج"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
