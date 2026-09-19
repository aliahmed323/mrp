import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDoctorStore } from '../hooks/useDoctorStore';
import { DoctorForm } from '../components/DoctorForm';
import type { DoctorFormData, Doctor } from '../models/doctor.model';
import { getDoctorById } from '@/services/storage/doctorRepository';
import { LoadingState } from '@/components/ui/States';

export function EditDoctorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editDoctor } = useDoctorStore();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDoctorById(id).then(d => { setDoctor(d ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!doctor) return <div className="text-center py-12 text-slate-500">الطبيب غير موجود</div>;

  const handleSubmit = async (data: DoctorFormData) => {
    await editDoctor(doctor.id, data);
    navigate(`/doctors/${doctor.id}`, { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">تعديل بيانات {doctor.name}</h2>
      </div>

      <DoctorForm
        initialData={doctor}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="حفظ التعديلات"
      />
    </div>
  );
}
