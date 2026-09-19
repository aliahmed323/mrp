import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePharmacyStore } from '../hooks/usePharmacyStore';
import { PharmacyForm } from '../components/PharmacyForm';
import type { PharmacyFormData } from '../models/pharmacy.model';

export function AddPharmacyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addPharmacy } = usePharmacyStore();

  // Handle pre-filling doctorId if navigating from DoctorDetailPage
  const initialData = location.state?.doctorId ? {
    ownership: 'doctor-affiliated' as const,
    doctorId: location.state.doctorId,
  } : undefined;

  const handleSubmit = async (data: PharmacyFormData) => {
    const pharmacy = await addPharmacy(data);
    navigate(`/pharmacies/${pharmacy.id}`, { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">إضافة صيدلية</h2>
      </div>

      <PharmacyForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="حفظ"
      />
    </div>
  );
}
