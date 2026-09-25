import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useZoneStore } from '../hooks/useZoneStore';
import { ZoneForm } from '../components/ZoneForm';
import type { ZoneFormData } from '../models/zone.model';

export function AddZonePage() {
  const navigate = useNavigate();
  const { addZone } = useZoneStore();

  const handleSubmit = async (data: ZoneFormData) => {
    await addZone(data);
    navigate('/zones');
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-slate-900">إضافة منطقة جديدة</h1>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <ZoneForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="إضافة المنطقة"
        />
      </div>
    </div>
  );
}
