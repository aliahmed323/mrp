import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Archive, Trash2, RotateCcw,
  Phone, MapPin, Building2, Pill, Activity, CalendarDays
} from 'lucide-react';
import { getDoctorById, getDoctorClinics, getDoctorPharmacies, getDoctorVisits } from '@/services/storage/doctorRepository';
import { useDoctorStore } from '../hooks/useDoctorStore';
import type { Doctor } from '../models/doctor.model';
import { DOCTOR_ATTITUDE_LABELS, DOCTOR_ATTITUDE_COLORS } from '../models/doctor.model';
import type { Clinic } from '@/modules/clinics/models/clinic.model';
import type { Pharmacy } from '@/modules/pharmacies/models/pharmacy.model';
import type { Visit } from '@/modules/visits/models/visit.model';
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
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getDoctorById(id),
      getDoctorClinics(id),
      getDoctorPharmacies(id),
      getDoctorVisits(id)
    ]).then(([d, c, p, v]) => {
      setDoctor(d ?? null);
      setClinics(c);
      setPharmacies(p);
      setVisits(v);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ تحميل الطبيب..." />;
  if (!doctor) return <div className="text-center py-12 text-slate-500">الطبيب غير موجود</div>;

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

  const attitudeColor = DOCTOR_ATTITUDE_COLORS[doctor.attitude] || 'slate';
  const attitudeLabel = DOCTOR_ATTITUDE_LABELS[doctor.attitude] || '';

  const attitudeBg: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  // Combined clinics: embedded in doctor + legacy separate clinics
  const embeddedClinics = doctor.clinics || [];

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto pb-8">
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
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 flex items-center justify-center text-4xl bg-blue-50">
              🩺
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{doctor.name}</h1>
              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(doctor.specialties || []).map(s => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-700 rounded-md px-2 py-0.5 font-medium border border-blue-100">
                    {s}
                  </span>
                ))}
                {doctor.area && (
                  <span className="text-xs text-slate-500 mt-0.5 w-full">{doctor.area}</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-px bg-slate-100 border-t border-slate-100">
            {/* Attitude */}
            <div className="bg-white px-3 py-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">التعامل</p>
              <span className={cn('text-xs px-2 py-0.5 rounded-full border font-semibold', attitudeBg[attitudeColor])}>
                {attitudeLabel}
              </span>
            </div>
            {/* Relationship Type */}
            <div className="bg-white px-3 py-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">تصنيف العلاقة</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-bold text-slate-900">{doctor.relationshipType}</span>
              </div>
            </div>
            {/* Visits */}
            <div className="bg-white px-3 py-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">الزيارات</p>
              <span className="text-sm font-bold text-slate-900">{visits.length}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {doctor.phone && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">📞 معلومات التواصل</h3>
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
          </div>
        )}

        {/* Location */}
        {doctor.location && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">📍 الموقع الجغرافي</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">الإحداثيات</p>
                <p className="text-sm font-mono text-slate-900" dir="ltr">{formatCoordinatesDisplay(doctor.location)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <ShareLocationButton location={doctor.location} label={doctor.name} address={doctor.area} />
              <Button 
                variant="secondary" 
                size="sm" 
                className="shrink-0 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 px-4"
                onClick={() => window.open(`https://waze.com/ul?ll=${doctor.location!.latitude},${doctor.location!.longitude}&navigate=yes`, '_blank')}
                title="فتح في Waze"
              >
                🚗 مسار Waze
              </Button>
            </div>
          </div>
        )}

        {/* Notes */}
        {doctor.notes && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 ملاحظات</h3>
            <p className="text-sm text-slate-700">{doctor.notes}</p>
          </div>
        )}

        {/* Clinics (embedded) */}
        {(embeddedClinics.length > 0 || clinics.length > 0) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-500" /> عيادات الطبيب
              </h3>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/doctors/${doctor.id}/edit`)}>
                تعديل
              </Button>
            </div>
            <div className="space-y-2">
              {embeddedClinics.map(c => (
                <div key={c.id} className={cn(
                  'p-3 rounded-xl border',
                  c.isPrimary ? 'border-blue-200 bg-blue-50' : 'border-slate-100'
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                    {c.isPrimary && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">أساسية</span>
                    )}
                  </div>
                  {c.address && <p className="text-xs text-slate-500 mt-0.5">{c.address}</p>}
                  {c.phone && <p className="text-xs text-slate-500">{c.phone}</p>}
                </div>
              ))}
              {/* Legacy separate clinics */}
              {clinics.map(c => (
                <Link to={`/clinics/${c.id}`} key={c.id} className="block p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                  <div className="font-semibold text-sm text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.address}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No clinics yet */}
        {embeddedClinics.length === 0 && clinics.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-500" /> عيادات الطبيب
              </h3>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/doctors/${doctor.id}/edit`)}>
                + إضافة
              </Button>
            </div>
            <p className="text-xs text-slate-500 text-center py-2">لا توجد عيادات مسجلة</p>
          </div>
        )}

        {/* Linked Pharmacies */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Pill size={16} className="text-emerald-500" /> صيدليات تابعة
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/pharmacies/new', { state: { doctorId: doctor.id } })}>
              + إضافة
            </Button>
          </div>
          {pharmacies.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-2">لا توجد صيدليات تابعة</p>
          ) : (
            <div className="space-y-2">
              {pharmacies.map(p => (
                <Link to={`/pharmacies/${p.id}`} key={p.id} className="block p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                  <div className="font-semibold text-sm text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{p.address}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> أحدث الزيارات
            </h3>
            <Link to={`/visits?doctorId=${doctor.id}`} className="text-xs text-[#0F52BA] font-medium hover:underline">
              عرض الكل
            </Link>
          </div>
          {visits.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-2">لم تسجل أي زيارات بعد</p>
          ) : (
            <div className="space-y-3">
              {visits.slice(0, 3).map(v => (
                <Link to={`/visits/${v.id}`} key={v.id} className="flex gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <CalendarDays size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{v.date}</div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {v.outcomes.join(' • ') || 'زيارة روتينية'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-red-600">منطقة الخطر</h3>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} fullWidth>
            <Trash2 size={14} /> حذف الطبيب نهائياً
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
        message={`هل أنت متأكد من حذف "${doctor.name}"؟`}
        confirmLabel="حذف نهائياً"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
