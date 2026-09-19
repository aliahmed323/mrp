import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Archive, RotateCcw,
  Phone, MapPin, Users, ShoppingBag
} from 'lucide-react';
import { getPharmacyById } from '@/services/storage/pharmacyRepository';
import { usePharmacyStore } from '../hooks/usePharmacyStore';
import type { Pharmacy } from '../models/pharmacy.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { ShareLocationButton } from '@/modules/doctors/components/ShareLocationButton';
import { formatCoordinatesDisplay } from '@/services/location/locationService';

export function PharmacyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archivePharmacy, unarchivePharmacy, deletePharmacy } = usePharmacyStore();

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPharmacyById(id).then(p => { setPharmacy(p ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!pharmacy) return <div className="text-center py-12 text-slate-500">غير موجود</div>;

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (pharmacy.archived) await unarchivePharmacy(pharmacy.id);
      else await archivePharmacy(pharmacy.id);
      navigate('/pharmacies', { replace: true });
    } finally { setActionLoading(false); setConfirmArchive(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deletePharmacy(pharmacy.id);
      navigate('/pharmacies', { replace: true });
    } finally { setActionLoading(false); setConfirmDelete(false); }
  };

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto pb-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/pharmacies/${pharmacy.id}/edit`)}>
              <Edit2 size={14} /> تعديل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmArchive(true)}>
              {pharmacy.archived ? <RotateCcw size={14} /> : <Archive size={14} />}
              {pharmacy.archived ? 'استعادة' : 'أرشفة'}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex gap-4 p-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 flex items-center justify-center text-4xl bg-emerald-50">
              💊
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{pharmacy.name}</h1>
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-xs bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 font-medium w-fit">
                  {pharmacy.ownership === 'independent' ? 'صيدلية مستقلة' : 'صيدلية تابعة'}
                </span>
                {pharmacy.address && (
                  <span className="text-xs text-slate-500 w-full">{pharmacy.address}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Link */}
        {pharmacy.ownership === 'doctor-affiliated' && pharmacy.doctorId && (
          <Link to={`/doctors/${pharmacy.doctorId}`} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Users size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">الطبيب المرتبط</p>
                <p className="text-sm font-bold text-blue-700">{pharmacy.doctorName}</p>
              </div>
            </div>
            <ArrowLeft size={16} className="text-blue-400" />
          </Link>
        )}

        {/* Contact Info */}
        {(pharmacy.phone) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">📞 معلومات التواصل</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Phone size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">الهاتف</p>
                <a href={`tel:${pharmacy.phone}`} className="text-sm font-medium text-[#0F52BA] hover:underline" dir="ltr">
                  {pharmacy.phone}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {pharmacy.location && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">📍 الموقع الجغرافي</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">الإحداثيات</p>
                <p className="text-sm font-mono text-slate-900" dir="ltr">
                  {formatCoordinatesDisplay(pharmacy.location)}
                </p>
              </div>
            </div>
            <ShareLocationButton
              location={pharmacy.location}
              label={pharmacy.name}
              address={pharmacy.address}
              size="lg"
              fullWidth
            />
          </div>
        )}

        {/* Notes */}
        {pharmacy.notes && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 ملاحظات</h3>
            <p className="text-sm text-slate-700">{pharmacy.notes}</p>
          </div>
        )}

        {/* Recent Orders (Placeholder until Phase 3) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <ShoppingBag size={18} className="text-orange-500" />
            <span className="font-semibold text-sm">طلبات الصيدلية</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/orders')}>
            عرض الطلبات
          </Button>
        </div>

      </div>

      <ConfirmDialog open={confirmArchive} onClose={() => setConfirmArchive(false)} onConfirm={handleArchive} title="أرشفة" message="أرشفة هذه الصيدلية؟" confirmLabel="أرشفة" variant="warning" loading={actionLoading} />
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="حذف نهائي" message="حذف الصيدلية نهائياً؟" confirmLabel="حذف نهائياً" variant="danger" loading={actionLoading} />
    </>
  );
}
