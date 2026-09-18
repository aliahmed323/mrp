import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Archive, Trash2, RotateCcw,
  Phone, MapPin, Building2,
} from 'lucide-react';
import { getDoctorById } from '@/services/storage/doctorRepository';
import { useDoctorStore } from '../hooks/useDoctorStore';
import type { Doctor } from '../models/doctor.model';
import { DOCTOR_TYPE_LABELS, DOCTOR_TYPE_ICONS } from '../models/doctor.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { ShareLocationButton } from '../components/ShareLocationButton';
import { formatCoordinatesDisplay } from '@/services/location/locationService';
import { cn } from '@/utils/cn';

export function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archiveDoctor, unarchiveDoctor, deleteDoctor } = useDoctorStore();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoctorById(id).then(d => { setDoctor(d ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ تحميل..." />;
  if (!doctor) return <div className="text-center py-12 text-slate-500">غير موجود</div>;

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (doctor.archived) await unarchiveDoctor(doctor.id);
      else await archiveDoctor(doctor.id);
      navigate('/doctors', { replace: true });
    } finally { setActionLoading(false); setConfirmArchive(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteDoctor(doctor.id);
      navigate('/doctors', { replace: true });
    } finally { setActionLoading(false); setConfirmDelete(false); }
  };

  const typeColor = doctor.type === 'doctor' ? 'blue' : doctor.type === 'clinic' ? 'emerald' : 'purple';

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Top Nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/doctors/${doctor.id}/edit`)}>
              <Edit2 size={14} /> تعديل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmArchive(true)}>
              {doctor.archived ? <RotateCcw size={14} /> : <Archive size={14} />}
              {doctor.archived ? 'استعادة' : 'أرشفة'}
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex gap-4 p-4">
            {/* Type Icon */}
            <div className={cn(
              'w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 flex items-center justify-center text-3xl',
              `bg-${typeColor}-50`
            )}>
              {DOCTOR_TYPE_ICONS[doctor.type]}
            </div>
            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{doctor.name}</h1>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className={cn(
                  'text-xs rounded-md px-2 py-0.5 font-medium',
                  `bg-${typeColor}-50 text-${typeColor}-700`
                )}>
                  {DOCTOR_TYPE_LABELS[doctor.type]}
                </span>
                {doctor.specialty && (
                  <span className="text-xs bg-slate-100 text-slate-700 rounded-md px-2 py-0.5">
                    {doctor.specialty}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {(doctor.phone || doctor.address) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">📞 معلومات التواصل</h3>
            {doctor.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">الهاتف</p>
                  <a href={`tel:${doctor.phone}`} className="text-sm font-medium text-[#0F52BA] hover:underline" dir="ltr">
                    {doctor.phone}
                  </a>
                </div>
              </div>
            )}
            {doctor.address && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">العنوان</p>
                  <p className="text-sm font-medium text-slate-900">{doctor.address}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location & Share */}
        {doctor.location && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">📍 الموقع الجغرافي</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">الإحداثيات</p>
                <p className="text-sm font-mono text-slate-900" dir="ltr">
                  {formatCoordinatesDisplay(doctor.location)}
                </p>
              </div>
            </div>

            {/* ★ Share Location Button – THE MAIN FEATURE ★ */}
            <ShareLocationButton
              location={doctor.location}
              label={doctor.name}
              address={doctor.address}
              size="lg"
              fullWidth
            />
          </div>
        )}

        {/* Notes */}
        {doctor.notes && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 ملاحظات</h3>
            <p className="text-sm text-slate-700">{doctor.notes}</p>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-red-600">منطقة الخطر</h3>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} fullWidth>
            <Trash2 size={14} /> حذف نهائياً
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        title={doctor.archived ? 'إلغاء الأرشفة' : 'أرشفة'}
        message={doctor.archived ? `استعادة "${doctor.name}" من الأرشيف؟` : `أرشفة "${doctor.name}"؟`}
        confirmLabel={doctor.archived ? 'استعادة' : 'أرشفة'}
        variant="warning"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف نهائي"
        message={`هل أنت متأكد من حذف "${doctor.name}"؟ لا يمكن التراجع.`}
        confirmLabel="حذف نهائياً"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
