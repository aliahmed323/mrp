import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useCompoundStore } from '../hooks/useCompoundStore';
import { CompoundForm } from '../components/CompoundForm';
import type { CompoundFormData } from '../models/compound.model';
import toast from 'react-hot-toast';

export function AddCompoundPage() {
  const navigate = useNavigate();
  const { addCompound } = useCompoundStore();

  const handleSubmit = async (data: CompoundFormData) => {
    try {
      const c = await addCompound(data);
      toast.success('تم إضافة المجمع بنجاح');
      navigate(`/compounds/${c.id}`, { replace: true });
    } catch {
      toast.error('فشل إضافة المجمع');
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">إضافة مجمع جديد</h2>
            <p className="text-xs text-slate-500">مجمع سكني أو تجاري لتنظيم الأطباء والصيدليات</p>
          </div>
        </div>
      </div>
      <CompoundForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} submitLabel="إضافة المجمع" />
    </div>
  );
}
