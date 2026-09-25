import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getZoneById } from '@/services/storage/zoneRepository';
import { useZoneStore } from '../hooks/useZoneStore';
import type { Zone } from '../models/zone.model';
import { ZoneForm } from '../components/ZoneForm';
import { LoadingState } from '@/components/ui/States';

export function EditZonePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editZone } = useZoneStore();
  const [zone, setZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getZoneById(id).then(z => { setZone(z ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState />;
  if (!zone) return <div className="text-center py-12">المنطقة غير موجودة</div>;

  const handleSubmit = async (data: any) => {
    await editZone(zone.id, data);
    navigate(`/zones/${zone.id}`);
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
        <h1 className="text-lg font-bold text-slate-900">تعديل المنطقة</h1>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <ZoneForm
          initialData={zone}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="حفظ التعديلات"
        />
      </div>
    </div>
  );
}
