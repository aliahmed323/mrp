import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, CalendarDays, Save, ArrowLeft, Calendar } from 'lucide-react';
import { EntitySelector } from '../components/EntitySelector';
import { OutcomeChips } from '../components/OutcomeChips';
import { ProductSelector } from '../components/ProductSelector';
import { FeedbackInput } from '../components/FeedbackInput';
import { Button } from '@/components/ui/Button';
import type { VisitType } from '../models/visit.model';
import toast from 'react-hot-toast';
import { db } from '@/services/storage/db';
import { LoadingState } from '@/components/ui/States';

export function EditVisitPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [entity, setEntity] = useState<{ type: VisitType; id: string; name: string; doctorId?: string; doctorName?: string } | null>(null);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productNames, setProductNames] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpPriority, setFollowUpPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const loadVisit = async () => {
      if (!id) return;
      const visit = await db.visits.get(id);
      if (!visit) {
        toast.error('لم يتم العثور على الزيارة');
        navigate('/visits');
        return;
      }
      setEntity({
        type: visit.type,
        id: visit.entityId,
        name: visit.entityName,
        doctorId: visit.doctorId,
        doctorName: visit.doctorName
      });
      setOutcomes(visit.outcomes);
      setProductIds(visit.productIds);
      setProductNames(visit.productNames);
      setFeedback(visit.feedback || '');
      setFollowUpRequired(visit.followUpRequired);
      setFollowUpDate(visit.followUpDate || '');
      setFollowUpPriority(visit.followUpPriority || 'medium');
      setDate(visit.date);
      setTime(visit.time);
      setLoading(false);
    };
    loadVisit();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!entity) return toast.error('الرجاء اختيار الوجهة');
    if (outcomes.length === 0 && !feedback.trim()) return toast.error('الرجاء إدخال حالة أو ملاحظة للزيارة');

    setSaving(true);
    try {
      await db.visits.update(id!, {
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
      });

      toast.success('تم تحديث تفاصيل الزيارة بنجاح');
      navigate(-1);
    } catch (error) {
      toast.error('فشل تحديث الزيارة');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="جاري تحميل الزيارة..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">تعديل الزيارة</h2>
          <p className="text-sm text-slate-500">تحديث تفاصيل الزيارة المسجلة</p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <CalendarDays size={14} /> التاريخ
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Clock size={14} /> الوقت
          </label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 text-left dir-ltr"
          />
        </div>
      </div>

      {/* 1. Who? */}
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 px-1">وجهة الزيارة</h3>
        <EntitySelector value={entity} onChange={setEntity} />
      </section>

      {/* 2. Products */}
      <section className="space-y-2 pt-2 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 px-1">المنتجات (اختياري)</h3>
        <ProductSelector 
          value={productIds}
          onChange={setProductIds}
          onNamesChange={setProductNames}
        />
      </section>

      {/* 3. Outcomes */}
      <section className="space-y-2 pt-2 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 px-1">ماذا حدث؟</h3>
        <OutcomeChips value={outcomes} onChange={setOutcomes} />
      </section>

      {/* 4. Feedback & Follow-up */}
      <section className="space-y-4 pt-2 border-t border-slate-200">
        <FeedbackInput 
          value={feedback} 
          onChange={setFeedback} 
          saveAsQuickResponse={false}
          onSaveToggle={() => {}}
        />

        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/50">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={followUpRequired}
              onChange={e => setFollowUpRequired(e.target.checked)}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
            />
            <span className="font-semibold text-amber-900">تحتاج متابعة؟</span>
          </label>

          {followUpRequired && (
            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Calendar size={14} /> تاريخ المتابعة
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  min={date}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500"
                  required={followUpRequired}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">أولوية المتابعة</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'high', label: 'عالية', color: 'red' },
                    { value: 'medium', label: 'متوسطة', color: 'amber' },
                    { value: 'low', label: 'عادية', color: 'blue' }
                  ].map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFollowUpPriority(p.value as any)}
                      className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                        followUpPriority === p.value
                          ? `bg-${p.color}-100 border-${p.color}-300 text-${p.color}-700`
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-40 pb-safe">
        <div className="max-w-2xl mx-auto">
          <Button
            fullWidth
            size="lg"
            onClick={handleSave}
            disabled={saving || !entity || (outcomes.length === 0 && !feedback.trim())}
            className="bg-[#0F52BA] hover:bg-blue-700 h-14 text-lg shadow-lg shadow-blue-500/30"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            {!saving && <Save size={20} className="mr-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
