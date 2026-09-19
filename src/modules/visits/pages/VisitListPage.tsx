import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, CalendarDays, Clock } from 'lucide-react';
import { useVisitStore } from '../hooks/useVisitStore';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { VISIT_TYPE_ICONS } from '../models/visit.model';


export function VisitListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorIdFilter = searchParams.get('doctorId');

  const { visits, loadVisits, loading } = useVisitStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadVisits(); }, [loadVisits]);

  if (loading) return <LoadingState message="جارٍ تحميل الزيارات..." />;

  // Filter logic
  let filtered = visits;
  if (doctorIdFilter) {
    filtered = filtered.filter(v => v.doctorId === doctorIdFilter || v.entityId === doctorIdFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(v => 
      v.entityName.toLowerCase().includes(q) || 
      v.feedback.toLowerCase().includes(q) ||
      v.outcomes.some(o => o.toLowerCase().includes(q)) ||
      v.productNames.some(p => p.toLowerCase().includes(q))
    );
  }

  // Group by date
  const grouped = filtered.reduce((acc, visit) => {
    if (!acc[visit.date]) acc[visit.date] = [];
    acc[visit.date].push(visit);
    return acc;
  }, {} as Record<string, typeof visits>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">سجل الزيارات</h2>
          <p className="text-xs text-slate-500">{filtered.length} زيارة {doctorIdFilter ? 'مفلترة' : 'مسجلة'}</p>
        </div>
        <Button size="sm" onClick={() => navigate('/quick-entry')}>
          <Plus size={16} /> تسجيل جديد
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 h-10">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="search"
          placeholder="ابحث في الزيارات (الوجهة، المنتج، الحالة)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          type="generic"
          title="لا توجد زيارات"
          description={searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'ابدأ بتسجيل أول زيارة لك من خلال زر "تسجيل سريع".'}
          action={!searchQuery ? { label: 'تسجيل سريع ⚡', onClick: () => navigate('/quick-entry') } : undefined}
        />
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2 sticky top-14 bg-[#F8FAFC] py-1 z-10">
                <CalendarDays size={16} /> {date}
              </h3>
              <div className="space-y-3 pl-2 sm:pl-0">
                {grouped[date].map(visit => (
                  <div 
                    key={visit.id}
                    onClick={() => navigate(`/visits/${visit.id}`)}
                    className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-lg">{VISIT_TYPE_ICONS[visit.type]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-slate-900 truncate pr-2">{visit.entityName}</h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 bg-slate-50 px-1.5 py-0.5 rounded">
                          <Clock size={10} /> {visit.time}
                        </span>
                      </div>
                      
                      {visit.outcomes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {visit.outcomes.map((out, i) => (
                            <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                              {out}
                            </span>
                          ))}
                        </div>
                      )}

                      {visit.productNames.length > 0 && (
                        <p className="text-xs text-slate-500 truncate mb-1">
                          📦 {visit.productNames.join(' • ')}
                        </p>
                      )}

                      {visit.feedback && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          {visit.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
