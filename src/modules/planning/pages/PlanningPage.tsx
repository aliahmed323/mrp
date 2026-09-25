import { useState, useEffect } from 'react';
import { Clock, Navigation, Circle, Calendar, CheckCircle, Share2, X } from 'lucide-react';
import { getPendingFollowUps, getArchivedFollowUps, updateVisit } from '@/services/storage/visitRepository';
import type { Visit } from '@/modules/visits/models/visit.model';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type TabType = 'today' | 'upcoming' | 'pending' | 'archive';

export function PlanningPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [pendingVisits, setPendingVisits] = useState<Visit[]>([]);
  const [archivedVisits, setArchivedVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirm Complete
  const [visitToComplete, setVisitToComplete] = useState<Visit | null>(null);

  // Share Plan
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [planText, setPlanText] = useState('');

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const loadData = async () => {
    setLoading(true);
    const [pending, archived] = await Promise.all([
      getPendingFollowUps(),
      getArchivedFollowUps()
    ]);
    setPendingVisits(pending);
    setArchivedVisits(archived);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleComplete = async () => {
    if (!visitToComplete) return;
    await updateVisit(visitToComplete.id, { isFollowUpCompleted: true });
    setVisitToComplete(null);
    loadData();
  };

  const generatePlanText = () => {
    const todayList = pendingVisits.filter(v => v.followUpDate === todayStr);
    let text = `خطة اليوم / خطة العمل\nالاسم: علي أحمد\nالتاريخ: ${todayStr}\n\n`;
    
    if (todayList.length === 0) {
      text += 'لا توجد مهام مجدولة لليوم.\n';
    } else {
      todayList.forEach((v, index) => {
        text += `${index + 1}. ${v.entityName}`;
        if (v.followUpNotes) text += ` - ${v.followUpNotes}`;
        text += '\n';
      });
    }
    setPlanText(text);
    setShareModalOpen(true);
  };

  const handleSharePlan = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'خطة العمل',
          text: planText,
        });
      } else {
        const url = `https://wa.me/?text=${encodeURIComponent(planText)}`;
        window.open(url, '_blank');
      }
    } catch (e) {
      // ignore aborts
    }
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'today':
        return pendingVisits.filter(v => v.followUpDate === todayStr);
      case 'upcoming':
        return pendingVisits.filter(v => v.followUpDate && v.followUpDate > todayStr);
      case 'pending':
        return pendingVisits.filter(v => !v.followUpDate || v.followUpDate < todayStr);
      case 'archive':
        return archivedVisits;
      default:
        return [];
    }
  };

  const filteredVisits = getFilteredData();

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-700';
      case 'medium': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'low': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'high': return 'عاجلة';
      case 'medium': return 'متوسطة';
      case 'low': return 'عادية';
      default: return 'غير محدد';
    }
  };

  if (loading) return <LoadingState message="جارٍ تحميل خطة العمل..." />;

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Navigation size={24} className="fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">قائمة المهام والتخطيط</h2>
            <p className="text-sm text-slate-500">نظّم متابعاتك وزياراتك القادمة</p>
          </div>
        </div>
        <Button onClick={generatePlanText} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          <Share2 size={16} /> مشاركة الخطة
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 p-1 bg-slate-50 gap-1 shrink-0 flex-wrap sm:flex-nowrap">
        <button
          onClick={() => setActiveTab('today')}
          className={cn(
            'flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-bold',
            activeTab === 'today' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          اليوم
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            'flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-bold',
            activeTab === 'upcoming' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          قادمة
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            'flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-bold',
            activeTab === 'pending' ? 'bg-white shadow-sm text-red-600' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          متأخرة
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={cn(
            'flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-bold',
            activeTab === 'archive' ? 'bg-slate-200 shadow-sm text-slate-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          الأرشيف
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/50 rounded-2xl border border-slate-100 p-2 sm:p-4">
        {filteredVisits.length === 0 ? (
          <EmptyState
            title="لا توجد مهام"
            description="ليس لديك أي متابعات في هذه القائمة."
          />
        ) : (
          <div className="space-y-3">
            {filteredVisits.map(visit => (
              <div 
                key={visit.id} 
                className={cn(
                  "p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-start gap-4 transition-all hover:shadow-md",
                  activeTab === 'archive' ? 'bg-slate-100 border-slate-200 text-slate-500 opacity-80' : getPriorityColor(visit.followUpPriority)
                )}
              >
                {/* Checkbox Action */}
                {activeTab !== 'archive' ? (
                  <button 
                    onClick={() => setVisitToComplete(visit)}
                    className="mt-1 shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
                    title="تحديد كمكتملة"
                  >
                    <Circle size={24} />
                  </button>
                ) : (
                  <div className="mt-1 shrink-0 text-emerald-600">
                    <CheckCircle size={24} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/60 text-current border border-current/20">
                      {visit.type === 'doctor' ? 'طبيب' : visit.type === 'pharmacy' ? 'صيدلية' : 'عيادة'}
                    </span>
                    <h3 className="text-base font-bold truncate">{visit.entityName}</h3>
                    {activeTab !== 'archive' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 text-current mr-auto">
                        {getPriorityLabel(visit.followUpPriority)}
                      </span>
                    )}
                  </div>
                  
                  {visit.followUpNotes ? (
                    <p className="text-sm mt-2 opacity-90 font-medium">
                      {visit.followUpNotes}
                    </p>
                  ) : (
                    <p className="text-sm mt-2 opacity-90 font-medium">
                      متابعة عامة
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-xs opacity-75 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> 
                      {visit.followUpDate 
                        ? format(new Date(visit.followUpDate), 'EEEE, d MMMM', { locale: ar })
                        : 'بدون تاريخ'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> 
                      من زيارة: {visit.date}
                    </span>
                  </div>
                </div>
                
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="bg-white/60 hover:bg-white text-current border-current/20"
                    onClick={() => navigate(`/visits/${visit.id}`)}
                  >
                    تفاصيل الزيارة
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!visitToComplete}
        onClose={() => setVisitToComplete(null)}
        onConfirm={handleToggleComplete}
        title="تأكيد إنجاز المهمة"
        message="هل أنت متأكد من إنجاز هذه المتابعة؟ سيتم نقلها إلى الأرشيف."
        confirmLabel="نعم، متأكد"
      />

      {/* Share Plan Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-800">مشاركة الخطة</h2>
              <button onClick={() => setShareModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <textarea
                className="w-full h-full min-h-[300px] p-4 text-sm leading-relaxed bg-white rounded-xl border border-slate-200 outline-none resize-none text-slate-800 focus:border-indigo-500"
                style={{ direction: 'rtl', textAlign: 'right' }}
                value={planText}
                onChange={e => setPlanText(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-2">
              <Button onClick={handleSharePlan} fullWidth className="bg-emerald-600 hover:bg-emerald-700">
                <Share2 size={18} /> إرسال عبر واتساب
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
