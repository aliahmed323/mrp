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
    let text = `Ø®Ø·Ø© Ø§Ù„Ø¹Ù…Ù„\nØ§Ù„Ø§Ø³Ù…: Ø¹Ù„ÙŠ Ø£Ø­Ù…Ø¯\nØ§Ù„ØªØ§Ø±ÙŠØ®: ${date}\n\n`;
    
    if (list.length === 0) {
      text += 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‡Ø§Ù… Ù…Ø¬Ø¯ÙˆÙ„Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ….\n';
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
    setPlanText(prev => prev + '\n- Ù…Ù‡Ù…Ø© Ø¬Ø¯ÙŠØ¯Ø©: ');
  };

    const handleSharePlan = async () => {
    let textToShare = planText;
    if (activeTab === 'plan' && currentPlan && currentPlan.tasks.length > 0) {
      textToShare = 'خطة العمل اليومية\nتاريخ: ' + todayStr + '\n\n';
      currentPlan.tasks.forEach((t, i) => {
        textToShare += (i + 1) + '. ' + t.entityName;
        if (t.productNames && t.productNames.length > 0) textToShare += ' (' + t.productNames.join(', ') + ')';
        if (t.notes) textToShare += ' - ' + t.notes;
        textToShare += '\n';
      });
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'خطة العمل',
          text: textToShare,
        });
      } else {
        const url = 'https://wa.me/?text=' + encodeURIComponent(textToShare);
        window.open(url, '_blank');
      }
    } catch (e) {
      // ignore
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
      case 'high': return 'Ø¹Ø§Ø¬Ù„Ø©';
      case 'medium': return 'Ù…ØªÙˆØ³Ø·Ø©';
      case 'low': return 'Ø¹Ø§Ø¯ÙŠØ©';
      default: return 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
    }
  };

  if (loading) return <LoadingState message="Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø®Ø·Ø© Ø§Ù„Ø¹Ù…Ù„..." />;

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Navigation size={24} className="fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„ØªØ®Ø·ÙŠØ·</h2>
            <p className="text-sm text-slate-500">Ù†Ø¸Ù‘Ù… Ù…ØªØ§Ø¨Ø¹Ø§ØªÙƒ ÙˆØ²ÙŠØ§Ø±Ø§ØªÙƒ Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/planning/build?date=${todayStr}`)} size="sm" variant="secondary" className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3">
          <Calendar size={14} /> Ø¨Ù†Ø§Ø¡ Ø®Ø·Ø©
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
          Ø®Ø·Ø© Ø§Ù„ÙŠÙˆÙ…
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            'flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-bold',
            activeTab === 'upcoming' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          Ù‚Ø§Ø¯Ù…Ø©
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            'flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-bold',
            activeTab === 'pending' ? 'bg-white shadow-sm text-red-600' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          Ù…ØªØ£Ø®Ø±Ø©
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={cn(
            'flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-lg transition-colors font-bold',
            activeTab === 'archive' ? 'bg-slate-200 shadow-sm text-slate-700' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          Ø§Ù„Ø£Ø±Ø´ÙŠÙ
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/50 rounded-2xl border border-slate-100 p-2 sm:p-4">
        {activeTab === 'plan' ? (
          !currentPlan || currentPlan.tasks.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <CalendarDays size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‡Ø§Ù… ÙÙŠ Ø®Ø·Ø© Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ…</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Ø§Ø¨Ø¯Ø£ Ø¨Ø¥Ø¶Ø§ÙØ© Ù…Ù‡Ø§Ù… Ù„Ø²ÙŠØ§Ø±Ø© Ø£Ø·Ø¨Ø§Ø¡ Ø£Ùˆ ØµÙŠØ¯Ù„ÙŠØ§Øª</p>
              <Button onClick={() => navigate(`/planning/build?date=${todayStr}`)} className="bg-indigo-600 hover:bg-indigo-700 mx-auto">
                Ø¨Ù†Ø§Ø¡ Ø®Ø·Ø© Ø§Ù„ÙŠÙˆÙ…
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm mb-4">
                <div>
                  <h3 className="font-bold text-indigo-900">Ø®Ø·Ø© Ø§Ù„ÙŠÙˆÙ… ({currentPlan.tasks.length} Ù…Ù‡Ø§Ù…)</h3>
                  <p className="text-xs text-indigo-600">{format(new Date(), 'dd MMMM yyyy', { locale: ar })}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate(`/planning/build?date=${todayStr}`)} size="sm" variant="secondary" className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                    ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø®Ø·Ø©
                  </Button>
                  <Button onClick={handleSharePlan} size="sm" className="bg-green-600 hover:bg-green-700 text-white border-transparent">
                    <Share2 size={14} className="mr-1.5" /> Ù…Ø´Ø§Ø±ÙƒØ©
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
                        {task.type === 'doctor' ? 'Ø·Ø¨ÙŠØ¨' : task.type === 'pharmacy' ? 'ØµÙŠØ¯Ù„ÙŠØ©' : 'Ù…ØªØ§Ø¨Ø¹Ø©'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.action === 'product_pitch' ? 'Ø¹Ø±Ø¶ Ù…Ù†ØªØ¬' : task.action === 'product_follow_up' ? 'Ù…ØªØ§Ø¨Ø¹Ø© Ù…Ù†ØªØ¬' : task.action === 'all_products' ? 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª' : 'Ø²ÙŠØ§Ø±Ø© Ø¹Ø§Ù…Ø©'} 
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
            title="Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‡Ø§Ù…"
            description="Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ Ø£ÙŠ Ù…ØªØ§Ø¨Ø¹Ø§Øª ÙÙŠ Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©."
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
                    title="ØªØ­Ø¯ÙŠØ¯ ÙƒÙ…ÙƒØªÙ…Ù„Ø©"
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
                      {visit.type === 'doctor' ? 'Ø·Ø¨ÙŠØ¨' : visit.type === 'pharmacy' ? 'ØµÙŠØ¯Ù„ÙŠØ©' : 'Ø¹ÙŠØ§Ø¯Ø©'}
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
                      Ù…ØªØ§Ø¨Ø¹Ø© Ø¹Ø§Ù…Ø©
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-xs opacity-75 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> 
                      {visit.followUpDate 
                        ? format(new Date(visit.followUpDate), 'EEEE, d MMMM', { locale: ar })
                        : 'Ø¨Ø¯ÙˆÙ† ØªØ§Ø±ÙŠØ®'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> 
                      Ù…Ù† Ø²ÙŠØ§Ø±Ø©: {visit.date}
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
                    ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø²ÙŠØ§Ø±Ø©
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
                        Ø§Ø³ØªØ±Ø¬Ø§Ø¹
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 bg-white hover:bg-red-50 text-red-600 border-red-200"
                        onClick={async () => {
                          if (confirm('Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©ØŸ Ù„Ù† ÙŠØªÙ… Ø­Ø°Ù Ø§Ù„Ø²ÙŠØ§Ø±Ø© Ø§Ù„Ø£ØµÙ„ÙŠØ© Ø¨Ù„ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© ÙÙ‚Ø·.')) {
                            await updateVisit(visit.id, { followUpRequired: false, isFollowUpCompleted: false });
                            loadData();
                          }
                        }}
                      >
                        Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©
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
        title="ØªØ£ÙƒÙŠØ¯ Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„Ù…Ù‡Ù…Ø©"
        message="Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø¥Ù†Ø¬Ø§Ø² Ù‡Ø°Ù‡ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©ØŸ Ø³ÙŠØªÙ… Ù†Ù‚Ù„Ù‡Ø§ Ø¥Ù„Ù‰ Ø§Ù„Ø£Ø±Ø´ÙŠÙ."
        confirmLabel="Ù†Ø¹Ù…ØŒ Ù…ØªØ£ÙƒØ¯"
      />

      {/* Share Plan Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-800">Ø¥Ø¹Ø¯Ø§Ø¯ ÙˆÙ…Ø´Ø§Ø±ÙƒØ© Ø§Ù„Ø®Ø·Ø©</h2>
              <button onClick={() => setShareModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">ØªØ§Ø±ÙŠØ® Ø§Ù„Ø®Ø·Ø©</label>
                  <input 
                    type="date"
                    value={planDate}
                    onChange={handleDateChange}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="flex-1 flex items-end">
                  <Button size="sm" variant="secondary" onClick={handleAddManualTask} className="w-full">
                    + Ø¥Ø¶Ø§ÙØ© Ù…Ù‡Ù…Ø© Ø£Ø®Ø±Ù‰
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
                <Share2 size={18} /> Ø¥Ø±Ø³Ø§Ù„ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


