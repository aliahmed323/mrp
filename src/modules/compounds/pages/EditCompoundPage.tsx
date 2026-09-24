import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getCompoundById } from '@/services/storage/compoundRepository';
import { useCompoundStore } from '../hooks/useCompoundStore';
import { CompoundForm } from '../components/CompoundForm';
import type { Compound, CompoundFormData } from '../models/compound.model';
import { LoadingState } from '@/components/ui/States';
import toast from 'react-hot-toast';

export function EditCompoundPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editCompound } = useCompoundStore();
  const [compound, setCompound] = useState<Compound | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getCompoundById(id).then(c => { setCompound(c ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!compound) return <div className="text-center py-12 text-slate-500">المجمع غير موجود</div>;

  const handleSubmit = async (data: CompoundFormData) => {
    try {
      await editCompound(compound.id, data);
      toast.success('تم تحديث المجمع');
      navigate(`/compounds/${compound.id}`, { replace: true });
    } catch {
      toast.error('فشل تحديث المجمع');
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-bold text-slate-900">تعديل المجمع</h2>
      </div>
      <CompoundForm initialData={compound} onSubmit={handleSubmit} onCancel={() => navigate(-1)} submitLabel="حفظ التعديلات" />
    </div>
  );
}
