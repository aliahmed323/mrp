import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePharmacyStore } from '../hooks/usePharmacyStore';
import { PharmacyForm } from '../components/PharmacyForm';
import type { PharmacyFormData, Pharmacy } from '../models/pharmacy.model';
import { getPharmacyById } from '@/services/storage/pharmacyRepository';
import { LoadingState } from '@/components/ui/States';

export function EditPharmacyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editPharmacy } = usePharmacyStore();

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPharmacyById(id).then(p => { setPharmacy(p ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!pharmacy) return <div className="text-center py-12 text-slate-500">غير موجود</div>;

  const handleSubmit = async (data: PharmacyFormData) => {
    await editPharmacy(pharmacy.id, data);
    navigate(`/pharmacies/${pharmacy.id}`, { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">تعديل {pharmacy.name}</h2>
      </div>

      <PharmacyForm
        initialData={pharmacy}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="حفظ التعديلات"
      />
    </div>
  );
}
