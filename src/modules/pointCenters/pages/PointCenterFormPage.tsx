import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormControls';
import { usePointCenterStore } from '../hooks/usePointCenterStore';
import { useDoctorStore } from '@/modules/doctors/hooks/useDoctorStore';
import { usePharmacyStore } from '@/modules/pharmacies/hooks/usePharmacyStore';
import toast from 'react-hot-toast';
import type { PointCenterFormData } from '../models/pointCenter.model';

export function PointCenterFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { pointCenters, addPointCenter, updatePointCenter } = usePointCenterStore();
  const { doctors, loadDoctors } = useDoctorStore();
  const { pharmacies, loadPharmacies } = usePharmacyStore();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<PointCenterFormData>({
    name: '',
    type: 'doctor',
    doctorId: '',
    pharmacyId: '',
    active: true,
    notes: ''
  });

  useEffect(() => {
    loadDoctors();
    loadPharmacies();
  }, [loadDoctors, loadPharmacies]);

  useEffect(() => {
    if (isEditing && id) {
      const pc = pointCenters.find(p => p.id === id);
      if (pc) {
        setFormData({
          name: pc.name,
          type: pc.type,
          doctorId: pc.doctorId || '',
          pharmacyId: pc.pharmacyId || '',
          active: pc.active,
          notes: pc.notes
        });
      }
    }
  }, [id, isEditing, pointCenters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('يرجى إدخال اسم الـ Point Center');
    
    if (formData.type === 'doctor' && !formData.doctorId) return toast.error('يرجى تحديد الطبيب');
    if (formData.type === 'pharmacy' && !formData.pharmacyId) return toast.error('يرجى تحديد الصيدلية');

    try {
      if (isEditing && id) {
        await updatePointCenter(id, formData);
        toast.success('تم التحديث بنجاح');
      } else {
        await addPointCenter(formData);
        toast.success('تمت الإضافة بنجاح');
      }
      navigate('/point-centers');
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'تعديل Point Center' : 'إضافة Point Center'}</h2>
          <p className="text-sm text-slate-500">{isEditing ? 'تعديل البيانات الحالية' : 'إضافة مركز استهلاك جديد'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        <Input
          label="اسم الـ Point Center"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="مثال: Point Center د. أحمد"
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">المركز تابع لـ</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'doctor', pharmacyId: '' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                formData.type === 'doctor' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <User size={16} /> طبيب
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'pharmacy', doctorId: '' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                formData.type === 'pharmacy' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <Building size={16} /> صيدلية
            </button>
          </div>
        </div>

        {formData.type === 'doctor' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">اختر الطبيب</label>
            <select
              value={formData.doctorId}
              onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">-- اختر طبيباً --</option>
              {doctors.filter(d => !d.archived).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {formData.type === 'pharmacy' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">اختر الصيدلية</label>
            <select
              value={formData.pharmacyId}
              onChange={e => setFormData({ ...formData, pharmacyId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">-- اختر صيدلية --</option>
              {pharmacies.filter(p => !p.archived).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="font-semibold text-sm text-slate-900">حالة التنزيل</p>
            <p className="text-xs text-slate-500">هل التنزيل في هذا المركز مستمر أم متوقف؟</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">ملاحظات</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 min-h-[100px]"
            placeholder="ملاحظات حول الـ Point Center..."
          />
        </div>

        <Button type="submit" fullWidth className="bg-[#0F52BA] hover:bg-blue-700 h-12 text-lg">
          <Save size={20} />
          {isEditing ? 'حفظ التعديلات' : 'إضافة'}
        </Button>
      </form>
    </div>
  );
}
