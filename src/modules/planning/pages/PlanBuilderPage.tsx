import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, GripVertical, Trash2, CalendarDays } from 'lucide-react';
import { usePlanStore } from '../hooks/usePlanStore';
import type { PlanTask } from '../models/plan.model';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { format } from 'date-fns';
import { AddTaskModal } from '../components/AddTaskModal';

export function PlanBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  
  const { currentPlan, loading, loadPlanForDate, updatePlanTasks, markPlanCompleted } = usePlanStore();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadPlanForDate(dateParam);
  }, [dateParam, loadPlanForDate]);

  if (loading || !currentPlan) return <LoadingState message="جاري تجهيز الخطة..." />;

  const displayDate = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(dateParam));

  const handleFinishPlan = async () => {
    await markPlanCompleted();
    navigate('/reports');
  };

  const removeTask = (taskId: string) => {
    const newTasks = currentPlan.tasks.filter(t => t.id !== taskId);
    updatePlanTasks(newTasks);
  };

  const handleAddTask = (taskData: Omit<PlanTask, 'id'>) => {
    const newTask: PlanTask = {
      ...taskData,
      id: crypto.randomUUID()
    };
    updatePlanTasks([...currentPlan.tasks, newTask]);
  };

  const handleTaskClick = (task: PlanTask) => {
    if (task.status === 'completed' && task.visitId) {
      navigate(`/visits/${task.visitId}`);
    } else {
      navigate(`/quick-entry?planTaskId=${task.id}&entityId=${task.entityId}&type=${task.type}&date=${dateParam}`);
    }
  };

  const handleUncheckTask = (task: PlanTask) => {
    if (task.status !== 'completed') return;
    if (window.confirm('هل أنت متأكد من إزالة الزيارة وإعادتها كغير مكتملة؟ (ملاحظة: سيتم فك ارتباط الزيارة الفعلية بالمهمة)')) {
      const newTasks = currentPlan.tasks.map(t => 
        t.id === task.id ? { ...t, status: 'pending' as const, visitId: undefined } : t
      );
      updatePlanTasks(newTasks);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">بناء خطة اليوم</h2>
            <p className="text-xs text-blue-600 font-semibold">{displayDate}</p>
          </div>
        </div>
        <Button onClick={handleFinishPlan} className="bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle size={16} /> تمت الخطة
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
        {currentPlan.tasks.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <CalendarDays size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700">لا توجد مهام في خطة هذا اليوم</h3>
            <p className="text-sm text-slate-500 mt-1">ابدأ بإضافة مهام لزيارة أطباء أو صيدليات</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentPlan.tasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3 p-3 bg-white rounded-xl border ${task.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer'} shadow-sm transition-all`}
                onClick={() => handleTaskClick(task)}
              >
                <button onClick={e => e.stopPropagation()} className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600">
                  <GripVertical size={18} />
                </button>
                
                <button 
                  onClick={e => { 
                    e.stopPropagation(); 
                    if (task.status === 'completed') handleUncheckTask(task); 
                    else handleTaskClick(task); 
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-red-500 hover:border-red-500' : 'border-slate-300 text-transparent hover:border-slate-400'}`}
                >
                  <CheckCircle size={14} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h4 className={`font-bold text-sm truncate ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.entityName}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">{task.type === 'doctor' ? 'طبيب' : task.type === 'pharmacy' ? 'صيدلية' : 'متابعة'}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{task.action === 'product_pitch' ? 'عرض منتج' : task.action === 'product_follow_up' ? 'متابعة منتج' : task.action === 'all_products' ? 'جميع المنتجات' : 'زيارة عامة'} {task.productNames.length > 0 && `(${task.productNames.join(', ')})`}</p>
                  {task.notes && <p className="text-[11px] text-slate-400 mt-1">{task.notes}</p>}
                </div>

                <button onClick={e => { e.stopPropagation(); removeTask(task.id); }} className="text-red-400 hover:text-red-600 p-2 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 pt-3 border-t border-slate-200">
        <Button onClick={() => setIsAdding(true)} variant="secondary" fullWidth className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border-dashed">
          <Plus size={18} /> إضافة مهمة / زيارة جديدة
        </Button>
      </div>
      
      <AddTaskModal 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        onAdd={handleAddTask} 
      />
    </div>
  );
}
