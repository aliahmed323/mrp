import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Plus, Search, MapPin } from 'lucide-react';
import { useCompoundStore } from '../hooks/useCompoundStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormControls';
import { EmptyState, LoadingState } from '@/components/ui/States';

export function CompoundListPage() {
  const navigate = useNavigate();
  const { loading, searchQuery, setSearchQuery, loadCompounds, getFilteredCompounds } = useCompoundStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => { loadCompounds(); }, [loadCompounds]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(t);
  }, [localSearch, setSearchQuery]);

  const compounds = getFilteredCompounds();

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">المجمعات</h2>
            <p className="text-xs text-slate-500">{compounds.length} مجمع</p>
          </div>
        </div>
        <Button onClick={() => navigate('/compounds/new')} size="sm">
          <Plus size={16} /> إضافة مجمع
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="ابحث بالاسم أو المنطقة..."
        value={localSearch}
        onChange={e => setLocalSearch(e.target.value)}
        leftIcon={<Search size={16} />}
      />

      {/* List */}
      {loading ? (
        <LoadingState message="جارٍ التحميل..." />
      ) : compounds.length === 0 ? (
        <EmptyState
          title="لا توجد مجمعات"
          description="أضف مجمعاً لتنظيم الأطباء والصيدليات جغرافياً"
          action={{ label: "إضافة مجمع", onClick: () => navigate('/compounds/new') }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {compounds.map(compound => (
            <Link
              key={compound.id}
              to={`/compounds/${compound.id}`}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-purple-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <Building2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{compound.name}</h3>
                  {compound.area && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500 truncate">{compound.area}</span>
                    </div>
                  )}
                  {compound.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{compound.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
