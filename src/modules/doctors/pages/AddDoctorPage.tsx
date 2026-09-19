import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDoctorStore } from '../hooks/useDoctorStore';
import { DoctorForm } from '../components/DoctorForm';
import type { DoctorFormData } from '../models/doctor.model';

export function AddDoctorPage() {
  const navigate = useNavigate();
  const { addDoctor } = useDoctorStore();

  const handleSubmit = async (data: DoctorFormData) => {
    const doctor = await addDoctor(data);
    navigate(`/doctors/${doctor.id}`, { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">إضافة طبيب</h2>
      </div>

      <DoctorForm
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="حفظ"
      />
    </div>
  );
}
