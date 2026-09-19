import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useClinicStore } from '../hooks/useClinicStore';
import { ClinicForm } from '../components/ClinicForm';
import type { ClinicFormData, Clinic } from '../models/clinic.model';
import { getClinicById } from '@/services/storage/clinicRepository';
import { LoadingState } from '@/components/ui/States';

export function EditClinicPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editClinic } = useClinicStore();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getClinicById(id).then(c => { setClinic(c ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!clinic) return <div className="text-center py-12 text-slate-500">غير موجود</div>;

  const handleSubmit = async (data: ClinicFormData) => {
    await editClinic(clinic.id, data);
    navigate(`/clinics/${clinic.id}`, { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">تعديل {clinic.name}</h2>
      </div>

      <ClinicForm
        initialData={clinic}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="حفظ التعديلات"
      />
    </div>
  );
}
