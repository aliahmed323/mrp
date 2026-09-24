import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Archive, Trash2, RotateCcw, Building2, Users, Pill, MapPin } from 'lucide-react';
import { getCompoundById, getCompoundDoctors, getCompoundPharmacies } from '@/services/storage/compoundRepository';
import { useCompoundStore } from '../hooks/useCompoundStore';
import type { Compound } from '../models/compound.model';
import type { Doctor } from '@/modules/doctors/models/doctor.model';
import type { Pharmacy } from '@/modules/pharmacies/models/pharmacy.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';

export function CompoundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archiveCompound, unarchiveCompound, deleteCompound } = useCompoundStore();

  const [compound, setCompound] = useState<Compound | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCompoundById(id),
      getCompoundDoctors(id),
      getCompoundPharmacies(id),
    ]).then(([c, d, p]) => {
      setCompound(c ?? null);
      setDoctors(d);
      setPharmacies(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ تحميل المجمع..." />;
  if (!compound) return <div className="text-center py-12 text-slate-500">المجمع غير موجود</div>;

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (compound.archived) await unarchiveCompound(compound.id);
      else await archiveCompound(compound.id);
      navigate('/compounds', { replace: true });
    } finally { setActionLoading(false); setConfirmArchive(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteCompound(compound.id);
      navigate('/compounds', { replace: true });
    } finally { setActionLoading(false); setConfirmDelete(false); }
  };

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto pb-8">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/compounds/${compound.id}/edit`)}>
              <Edit2 size={14} /> تعديل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmArchive(true)}>
              {compound.archived ? <RotateCcw size={14} /> : <Archive size={14} />}
              {compound.archived ? 'استعادة' : 'أرشفة'}
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Building2 size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{compound.name}</h1>
              {compound.area && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">{compound.area}</span>
                </div>
              )}
              {compound.description && (
                <p className="text-sm text-slate-600 mt-2">{compound.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-50">
            <div className="text-center bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-700">{doctors.length}</p>
              <p className="text-xs text-blue-600 mt-0.5">طبيب</p>
            </div>
            <div className="text-center bg-emerald-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-700">{pharmacies.length}</p>
              <p className="text-xs text-emerald-600 mt-0.5">صيدلية</p>
            </div>
          </div>
        </div>

        {/* Doctors */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users size={16} className="text-blue-500" /> الأطباء في المجمع
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/doctors/new')}>
              + إضافة
            </Button>
          </div>
          {doctors.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-3">لا يوجد أطباء مسجلون في هذا المجمع</p>
          ) : (
            <div className="space-y-2">
              {doctors.map(d => (
                <Link key={d.id} to={`/doctors/${d.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    🩺
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                    <p className="text-xs text-slate-500">{(d.specialties || []).join('، ') || 'طب عام'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pharmacies */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Pill size={16} className="text-emerald-500" /> الصيدليات في المجمع
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/pharmacies/new')}>
              + إضافة
            </Button>
          </div>
          {pharmacies.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-3">لا توجد صيدليات مسجلة في هذا المجمع</p>
          ) : (
            <div className="space-y-2">
              {pharmacies.map(p => (
                <Link key={p.id} to={`/pharmacies/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    💊
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {compound.notes && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 ملاحظات</h3>
            <p className="text-sm text-slate-700">{compound.notes}</p>
          </div>
        )}

        {/* Danger */}
        <div className="bg-white rounded-2xl border border-red-100 p-4">
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} fullWidth>
            <Trash2 size={14} /> حذف المجمع نهائياً
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        title={compound.archived ? 'إلغاء الأرشفة' : 'أرشفة'}
        message={compound.archived ? `استعادة "${compound.name}"؟` : `أرشفة "${compound.name}"؟`}
        confirmLabel={compound.archived ? 'استعادة' : 'أرشفة'}
        variant="warning"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف نهائي"
        message={`حذف المجمع "${compound.name}" نهائياً؟`}
        confirmLabel="حذف نهائياً"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
