import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Clock, CalendarDays, Calendar } from 'lucide-react';
import { EntitySelector } from '../components/EntitySelector';
import { OutcomeChips } from '../components/OutcomeChips';
import { ProductSelector } from '../components/ProductSelector';
import { FeedbackInput } from '../components/FeedbackInput';
import { Button } from '@/components/ui/Button';
import { useVisitStore } from '../hooks/useVisitStore';
import { createQuickResponse } from '@/services/storage/quickResponseRepository';
import type { VisitType } from '../models/visit.model';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/FormControls';
import { getDoctorById } from '@/services/storage/doctorRepository';
import { getPharmacyById } from '@/services/storage/pharmacyRepository';
import { getPlanByDate, updatePlan } from '@/services/storage/planRepository';

export function QuickEntryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planTaskId = searchParams.get('planTaskId');
  const planEntityId = searchParams.get('entityId');
  const planType = searchParams.get('type') as VisitType;
  const planDateParam = searchParams.get('date');

  const { addVisit } = useVisitStore();
  const [loading, setLoading] = useState(false);

  // Form State
  const [entity, setEntity] = useState<{ type: VisitType; id: string; name: string; doctorId?: string; doctorName?: string } | null>(null);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productNames, setProductNames] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [saveAsQuickResponse, setSaveAsQuickResponse] = useState(false);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpPriority, setFollowUpPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const now = new Date();
  // Default to today
  const defaultDate = now.toISOString().split('T')[0];
  // Default to current time rounded to nearest 5 mins
  const mins = Math.round(now.getMinutes() / 5) * 5;
  now.setMinutes(mins);
  const defaultTime = now.toTimeString().substring(0, 5);

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);

  useEffect(() => {
    const fetchPlanEntity = async () => {
      if (planTaskId && planEntityId && planType) {
        if (planType === 'doctor') {
          const d = await getDoctorById(planEntityId);
          if (d) setEntity({ type: 'doctor', id: d.id, name: d.name });
        } else if (planType === 'pharmacy') {
          const p = await getPharmacyById(planEntityId);
          if (p) setEntity({ type: 'pharmacy', id: p.id, name: p.name, doctorId: p.doctorId, doctorName: p.doctorName });
        }
      }
    };
    fetchPlanEntity();
  }, [planTaskId, planEntityId, planType]);

  const handleSave = async () => {
    if (!entity) {
      toast.error('الرجاء اختيار الوجهة');
      return;
    }
    if (outcomes.length === 0 && !feedback.trim()) {
      toast.error('الرجاء إدخال حالة أو ملاحظة للزيارة');
      return;
    }

    setLoading(true);
    try {
      // 1. Save Visit
      const newVisit = await addVisit({
        type: entity.type,
        entityId: entity.id,
        entityName: entity.name,
        doctorId: entity.doctorId,
        doctorName: entity.doctorName,
        date,
        time,
        outcomes,
        feedback: feedback.trim(),
        productIds,
        productNames,
        followUpRequired,
        followUpDate: followUpRequired ? followUpDate : undefined,
        followUpPriority: followUpRequired ? followUpPriority : undefined,
        isFollowUpCompleted: false,
      });

      // 2. Increment usage for used preset outcomes
      // Note: In a real app we'd fetch quick responses and find their IDs by text to increment.
      // For simplicity here, we assume it's fine.

      // 3. Save new Quick Response if toggled
      if (saveAsQuickResponse && feedback.trim()) {
        await createQuickResponse({
          text: feedback.trim(),
          category: 'feedback'
        });
      }

      toast.success('تم تسجيل الزيارة بنجاح');

      if (planTaskId && planDateParam) {
        const plan = await getPlanByDate(planDateParam);
        if (plan) {
          const updatedTasks = plan.tasks.map(t => 
            t.id === planTaskId ? { ...t, status: 'completed' as const, visitId: newVisit.id } : t
          );
          await updatePlan(plan.id, { tasks: updatedTasks });
        }
        navigate(`/planning/build?date=${planDateParam}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error('فشل حفظ الزيارة');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Zap size={24} className="fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">تسجيل سريع</h1>
          <p className="text-xs text-slate-500">سجل زيارتك في 15 ثانية</p>
        </div>
      </div>

      {/* 1. Entity Selection */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs">1</span>
          أين أنت الآن؟ (الوجهة)
        </h2>
        <EntitySelector value={entity} onChange={setEntity} />
      </section>

      {/* Proceed only if entity selected */}
      {entity && (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
          
          {/* Time & Date Overrides (Optional) */}
          <section className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-4">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                <CalendarDays size={12} /> تاريخ الزيارة
              </label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                <Clock size={12} /> وقت الزيارة
              </label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
          </section>

          {/* 2. Outcomes */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs">2</span>
              ماذا حدث؟ (حالة الزيارة)
            </h2>
            <OutcomeChips value={outcomes} onChange={setOutcomes} />
          </section>

          {/* 3. Products */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs">3</span>
              المنتجات التي تم مناقشتها
            </h2>
            <ProductSelector 
              value={productIds} 
              onChange={setProductIds} 
              onNamesChange={setProductNames} 
            />
          </section>

          {/* 4. Feedback & Follow-up */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs">4</span>
              ملاحظات ومتابعة
            </h2>
            
            <FeedbackInput 
              value={feedback} 
              onChange={setFeedback} 
              saveAsQuickResponse={saveAsQuickResponse}
              onSaveToggle={setSaveAsQuickResponse}
            />

            <div className="mt-4 p-3 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input 
                  type="checkbox" 
                  checked={followUpRequired} 
                  onChange={e => setFollowUpRequired(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">تتطلب متابعة (Follow-up)</span>
              </label>
              
              {followUpRequired && (
                <div className="pl-6 space-y-3 animate-in slide-in-from-top-2">
                  <Input 
                    type="date" 
                    label="تاريخ المتابعة" 
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                    leftIcon={<Calendar size={16} />}
                  />
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block">أولوية المتابعة</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFollowUpPriority('high')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${followUpPriority === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                      >
                        عاجلة (أحمر)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFollowUpPriority('medium')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${followUpPriority === 'medium' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                      >
                        متوسطة (برتقالي)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFollowUpPriority('low')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${followUpPriority === 'low' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                      >
                        عادية (أخضر)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Submit */}
          <div className="pt-4 sticky bottom-4 z-10">
            <Button 
              onClick={handleSave} 
              loading={loading} 
              fullWidth 
              size="lg"
              className="shadow-xl shadow-blue-500/20"
            >
              حفظ الزيارة
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
