import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { useClinicStore } from '../hooks/useClinicStore';
import { ClinicCard } from '../components/ClinicCard';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { cn } from '@/utils/cn';

export function ClinicListPage() {
  const navigate = useNavigate();
  const {
    loading, searchQuery, setSearchQuery, showArchived, setShowArchived,
    loadClinics, getFilteredClinics, stats,
  } = useClinicStore();

  useEffect(() => { loadClinics(); }, [loadClinics]);

  const filteredClinics = getFilteredClinics();

  if (loading) return <LoadingState message="جارٍ تحميل العيادات..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">العيادات</h2>
          <p className="text-xs text-slate-500">{stats.total} عيادة مسجلة</p>
        </div>
        <Button size="sm" onClick={() => navigate('/clinics/new')}>
          <Plus size={16} /> إضافة
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 h-10">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="search"
          placeholder="ابحث باسم العيادة، الطبيب، العنوان..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={cn(
            'text-xs px-3 py-1.5 rounded-full border transition-colors',
            showArchived ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
          )}
        >
          {showArchived ? 'الأرشيف' : 'النشطين'}
        </button>
      </div>

      {filteredClinics.length === 0 ? (
        <EmptyState
          type="generic"
          title="لا توجد عيادات"
          description={searchQuery ? 'لم نجد عيادات تطابق بحثك' : 'ابدأ بإضافة أول عيادة'}
          action={
            !searchQuery
              ? { label: '+ إضافة عيادة', onClick: () => navigate('/clinics/new') }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredClinics.map(c => (
            <ClinicCard key={c.id} clinic={c} />
          ))}
        </div>
      )}
    </div>
  );
}
