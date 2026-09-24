import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Navigation } from 'lucide-react';
import { getVisitsByDateRange } from '@/services/storage/visitRepository';
import type { Visit } from '@/modules/visits/models/visit.model';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { format, addDays } from 'date-fns';

type TabType = 'today' | 'tomorrow' | 'followup';

export function PlanningPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const weekLaterStr = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  useEffect(() => {
    // Fetch a wide range of visits to filter client side for now
    getVisitsByDateRange('2020-01-01', weekLaterStr).then(v => {
      setVisits(v);
      setLoading(false);
    });
  }, [weekLaterStr]);

  const getFilteredData = () => {
    switch (activeTab) {
      case 'today':
        return visits.filter(v => v.followUpDate === todayStr || v.date === todayStr); // Simplification: showing visits made today or followups due today
      case 'tomorrow':
        return visits.filter(v => v.followUpDate === tomorrowStr);
      case 'followup':
        return visits.filter(v => v.followUpRequired && !v.followUpDate); // Followups without specific date
      default:
        return [];
    }
  };

  const filteredVisits = getFilteredData();

  if (loading) return <LoadingState message="جارٍ تحميل الخطة..." />;

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
          <Navigation size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">بوابة التخطيط والمتابعة</h2>
          <p className="text-xs text-slate-500">خطة العمل، المهام والمتابعات</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 p-1 bg-slate-50 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('today')}
          className={cn(
            'flex-1 text-sm py-2 rounded-lg transition-colors font-medium',
            activeTab === 'today' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          اليوم
        </button>
        <button
          onClick={() => setActiveTab('tomorrow')}
          className={cn(
            'flex-1 text-sm py-2 rounded-lg transition-colors font-medium',
            activeTab === 'tomorrow' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          غداً
        </button>
        <button
          onClick={() => setActiveTab('followup')}
          className={cn(
            'flex-1 text-sm py-2 rounded-lg transition-colors font-medium',
            activeTab === 'followup' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          متابعات معلقة
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/50 rounded-2xl border border-slate-100 p-2 sm:p-4">
        {filteredVisits.length === 0 ? (
          <EmptyState
            title="لا توجد مهام"
            description="ليس لديك أي متابعات أو خطط مبرمجة لهذه الفترة."
          />
        ) : (
          <div className="space-y-3">
            {filteredVisits.map(visit => (
              <div key={visit.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {visit.type === 'doctor' ? 'طبيب' : visit.type === 'pharmacy' ? 'صيدلية' : 'عيادة'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">{visit.entityName}</h3>
                  </div>
                  
                  {visit.followUpNotes && (
                    <p className="text-sm text-slate-600 mt-2 bg-amber-50/50 p-2 rounded-lg border border-amber-100 flex items-start gap-2">
                      <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      {visit.followUpNotes}
                    </p>
                  )}
                  
                  {!visit.followUpNotes && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock size={12} /> بحاجة لمتابعة
                    </p>
                  )}
                </div>
                
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <Button size="sm" onClick={() => navigate(`/visits/${visit.id}`)}>
                    عرض الزيارة السابقة
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
