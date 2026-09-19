import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { useDoctorStore } from '../hooks/useDoctorStore';
import { DoctorCard } from '../components/DoctorCard';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { cn } from '@/utils/cn';

export function DoctorListPage() {
  const navigate = useNavigate();
  const {
    loading, searchQuery, setSearchQuery, showArchived, setShowArchived,
    loadDoctors, getFilteredDoctors, stats,
  } = useDoctorStore();

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  const filteredDoctors = getFilteredDoctors();

  if (loading) return <LoadingState message="جارٍ تحميل الأطباء..." />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">الأطباء</h2>
          <p className="text-xs text-slate-500">{stats.total} طبيب مسجل</p>
        </div>
        <Button size="sm" onClick={() => navigate('/doctors/new')}>
          <Plus size={16} /> إضافة طبيب
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 h-10">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="search"
          placeholder="ابحث بالاسم أو التخصص أو المنطقة..."
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

      {/* Filter Chips */}
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

      {/* List */}
      {filteredDoctors.length === 0 ? (
        <EmptyState
          type="generic"
          title="لا يوجد أطباء"
          description={searchQuery ? 'لم نجد أطباء تطابق بحثك' : 'لم تقم بإضافة أي أطباء بعد.'}
          action={
            !searchQuery
              ? { label: '+ إضافة طبيب', onClick: () => navigate('/doctors/new') }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredDoctors.map(d => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      )}
    </div>
  );
}
