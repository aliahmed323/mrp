import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Archive, RotateCcw, Phone, MapPin, Users } from 'lucide-react';
import { getClinicById } from '@/services/storage/clinicRepository';
import { useClinicStore } from '../hooks/useClinicStore';
import type { Clinic } from '../models/clinic.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { ShareLocationButton } from '@/modules/doctors/components/ShareLocationButton';
import { formatCoordinatesDisplay } from '@/services/location/locationService';

export function ClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archiveClinic, unarchiveClinic, deleteClinic } = useClinicStore();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getClinicById(id).then(c => { setClinic(c ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!clinic) return <div className="text-center py-12 text-slate-500">غير موجود</div>;

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (clinic.archived) await unarchiveClinic(clinic.id);
      else await archiveClinic(clinic.id);
      navigate('/clinics', { replace: true });
    } finally { setActionLoading(false); setConfirmArchive(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteClinic(clinic.id);
      navigate('/clinics', { replace: true });
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
            <Button variant="secondary" size="sm" onClick={() => navigate(`/clinics/${clinic.id}/edit`)}>
              <Edit2 size={14} /> تعديل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmArchive(true)}>
              {clinic.archived ? <RotateCcw size={14} /> : <Archive size={14} />}
              {clinic.archived ? 'استعادة' : 'أرشفة'}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex gap-4 p-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 flex items-center justify-center text-4xl bg-indigo-50">
              🏥
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{clinic.name}</h1>
              <div className="flex flex-col gap-1.5 mt-2">
                {clinic.address && (
                  <span className="text-xs text-slate-500 w-full">{clinic.address}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Link */}
        <Link to={`/doctors/${clinic.doctorId}`} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 flex items-center justify-between hover:bg-indigo-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <Users size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">طبيب العيادة</p>
              <p className="text-sm font-bold text-indigo-700">{clinic.doctorName}</p>
            </div>
          </div>
          <ArrowLeft size={16} className="text-indigo-400" />
        </Link>

        {/* Contact Info */}
        {(clinic.phone) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">📞 معلومات التواصل</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Phone size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">الهاتف</p>
                <a href={`tel:${clinic.phone}`} className="text-sm font-medium text-[#0F52BA] hover:underline" dir="ltr">
                  {clinic.phone}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {clinic.location && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">📍 الموقع الجغرافي</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">الإحداثيات</p>
                <p className="text-sm font-mono text-slate-900" dir="ltr">
                  {formatCoordinatesDisplay(clinic.location)}
                </p>
              </div>
            </div>
            <ShareLocationButton
              location={clinic.location}
              label={clinic.name}
              address={clinic.address}
              size="lg"
              fullWidth
            />
          </div>
        )}

        {/* Notes */}
        {clinic.notes && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 ملاحظات</h3>
            <p className="text-sm text-slate-700">{clinic.notes}</p>
          </div>
        )}
      </div>

      <ConfirmDialog open={confirmArchive} onClose={() => setConfirmArchive(false)} onConfirm={handleArchive} title="أرشفة" message="أرشفة هذه العيادة؟" confirmLabel="أرشفة" variant="warning" loading={actionLoading} />
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="حذف نهائي" message="حذف العيادة نهائياً؟" confirmLabel="حذف نهائياً" variant="danger" loading={actionLoading} />
    </>
  );
}
