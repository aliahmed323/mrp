import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, Clock, 
  Navigation, Share2, Calendar,
  CheckCircle, X, Circle
} from 'lucide-react';
import { getPendingFollowUps, getArchivedFollowUps, updateVisit } from '@/services/storage/visitRepository';
import type { Visit } from '@/modules/visits/models/visit.model';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { usePlanStore } from '../hooks/usePlanStore';

type TabType = 'plan' | 'upcoming' | 'pending' | 'archive';

export function PlanningPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  const [pendingVisits, setPendingVisits] = useState<Visit[]>([]);
  const [archivedVisits, setArchivedVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentPlan, loadPlanForDate } = usePlanStore();

  // Confirm Complete
  const [visitToComplete, setVisitToComplete] = useState<Visit | null>(null);

  // Share Plan
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [planText, setPlanText] = useState('');

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const loadData = async () => {
    setLoading(true);
    await loadPlanForDate(todayStr);
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

  const [planDate, setPlanDate] = useState(todayStr);

  const generatePlanTextForDate = (date: string) => {
    const list = pendingVisits.filter(v => v.followUpDate === date);
    let text = `خطة العمل\nالاسم: علي أحمد\nالتاريخ: ${date}\n\n`;
    
    if (list.length === 0) {
      text += 'لا توجد مهام مجدولة لهذا اليوم.\n';
    } else {
      list.forEach((v, index) => {
        text += `${index + 1}. ${v.entityName}`;
        if (v.followUpNotes) text += ` - ${v.followUpNotes}`;
        text += '\n';
      });
    }
    setPlanText(text);
  };



  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setPlanDate(newDate);
    generatePlanTextForDate(newDate);
  };

  const handleAddManualTask = () => {
    setPlanText(prev => prev + '\n- مهمة جديدة: ');
  };

  const handleSharePlan = async () => {
    let textToShare = planText;
    if (activeTab === 'plan' && currentPlan && currentPlan.tasks.length > 0) {
      textToShare = `خطة العمل اليومية\nتاريخ: ${todayStr}\n\n`;
      currentPlan.tasks.forEach((t, i) => {
        textToShare += `${i + 1}. ${t.entityName}`;
        if (t.productNames && t.productNames.length > 0) textToShare += ` (${t.productNames.join(', ')})`;
        if (t.notes) textToShare += ` - ${t.notes}`;
        textToShare += '\n';
      });
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'خطة العمل اليومية',
          text: textToShare,
        });
      } else {
        const url = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
        window.open(url, '_blank');
      }
    } catch (e) {
      // ignore aborts
    }
  };

  const getFilteredData = () => {
    switch (activeTab) {
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
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Navigation size={20} className="fill-current sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">قائمة المهام والتخطيط</h2>
            <p className="text-xs sm:text-sm text-slate-500 truncate">نظّم متابعاتك وزياراتك القادمة</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/planning/build?date=${todayStr}`)} size="sm" variant="secondary" className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 shrink-0 ml-auto">
          <Calendar size={14} className="mr-1" /> بناء خطة
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 p-1 bg-slate-50 gap-1 shrink-0 flex-wrap sm:flex-nowrap">
        <button
          onClick={() => setActiveTab('plan')}
          className={cn(
            'flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-bold',
            activeTab === 'plan' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          خطة اليوم
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
        {activeTab === 'plan' ? (
          !currentPlan || currentPlan.tasks.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <CalendarDays size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700">لا توجد مهام في خطة هذا اليوم</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">ابدأ بإضافة مهام لزيارة أطباء أو صيدليات</p>
              <Button onClick={() => navigate(`/planning/build?date=${todayStr}`)} className="bg-indigo-600 hover:bg-indigo-700 mx-auto">
                بناء خطة اليوم
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm mb-4">
                <div>
                  <h3 className="font-bold text-indigo-900">خطة اليوم ({currentPlan.tasks.length} مهام)</h3>
                  <p className="text-xs text-indigo-600">{format(new Date(), 'dd MMMM yyyy', { locale: ar })}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate(`/planning/build?date=${todayStr}`)} size="sm" variant="secondary" className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                    تعديل الخطة
                  </Button>
                  <Button onClick={handleSharePlan} size="sm" className="bg-green-600 hover:bg-green-700 text-white border-transparent">
                    <Share2 size={14} className="mr-1.5" /> مشاركة
                  </Button>
                </div>
              </div>

              {currentPlan.tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-3 p-3 bg-white rounded-xl border ${task.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'} shadow-sm transition-all`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}>
                    <CheckCircle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h4 className={`font-bold text-sm truncate ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.entityName}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                        {task.type === 'doctor' ? 'طبيب' : task.type === 'pharmacy' ? 'صيدلية' : 'متابعة'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.action === 'product_pitch' ? 'عرض منتج' : task.action === 'product_follow_up' ? 'متابعة منتج' : task.action === 'all_products' ? 'جميع المنتجات' : 'زيارة عامة'} 
                      {task.productNames.length > 0 && ` (${task.productNames.join(', ')})`}
                    </p>
                    {task.notes && <p className="text-[11px] text-slate-400 mt-1">{task.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredVisits.length === 0 ? (
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
                  
                  {activeTab === 'archive' && (
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200"
                        onClick={async () => {
                          await updateVisit(visit.id, { isFollowUpCompleted: false });
                          loadData();
                        }}
                      >
                        استرجاع
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 bg-white hover:bg-red-50 text-red-600 border-red-200"
                        onClick={async () => {
                          if (confirm('هل أنت متأكد من حذف هذه المتابعة؟ لن يتم حذف الزيارة الأصلية بل المتابعة فقط.')) {
                            await updateVisit(visit.id, { followUpRequired: false, isFollowUpCompleted: false });
                            loadData();
                          }
                        }}
                      >
                        إزالة المتابعة
                      </Button>
                    </div>
                  )}
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
              <h2 className="font-bold text-slate-800">إعداد ومشاركة الخطة</h2>
              <button onClick={() => setShareModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">تاريخ الخطة</label>
                  <input 
                    type="date"
                    value={planDate}
                    onChange={handleDateChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="flex-1 flex items-end">
                  <Button size="sm" variant="secondary" onClick={handleAddManualTask} className="w-full">
                    + إضافة مهمة أخرى
                  </Button>
                </div>
              </div>
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
