import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, MapPin, Building2, Users, Pill, ChevronRight } from 'lucide-react';
import { getZoneById, getZoneCompounds, getZoneDoctors, getZonePharmacies, deleteZone } from '@/services/storage/zoneRepository';
import type { Zone } from '../models/zone.model';
import type { Compound } from '@/modules/compounds/models/compound.model';
import type { Doctor } from '@/modules/doctors/models/doctor.model';
import type { Pharmacy } from '@/modules/pharmacies/models/pharmacy.model';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { useZoneStore } from '../hooks/useZoneStore';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { AddEntityToZoneModal } from '../components/AddEntityToZoneModal';

export function ZoneDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archiveZone, unarchiveZone } = useZoneStore();

  const [zone, setZone] = useState<Zone | null>(null);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [tab, setTab] = useState<'compounds' | 'doctors' | 'pharmacies'>('compounds');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'compound' | 'doctor' | 'pharmacy'>('compound');

  const loadData = () => {
    if (!id) return;
    Promise.all([
      getZoneById(id),
      getZoneCompounds(id),
      getZoneDoctors(id),
      getZonePharmacies(id),
    ]).then(([z, c, d, p]) => {
      setZone(z ?? null);
      setCompounds(c);
      setDoctors(d);
      setPharmacies(p);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <LoadingState message="جارٍ تحميل المنطقة..." />;
  if (!zone) return <div className="text-center py-12 text-slate-500">المنطقة غير موجودة</div>;

  const handleArchive = async () => {
    if (zone.archived) await unarchiveZone(zone.id);
    else await archiveZone(zone.id);
    navigate('/zones', { replace: true });
  };

  const handleDelete = async () => {
    await deleteZone(zone.id);
    navigate('/zones', { replace: true });
  };

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto pb-8">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/zones/${zone.id}/edit`)}>
              <Edit2 size={14} /> تعديل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmArchive(true)}>
              {zone.archived ? 'استعادة' : 'أرشفة'}
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <MapPin size={28} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{zone.name}</h1>
              {zone.description && <p className="text-sm text-slate-500 mt-1">{zone.description}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-50">
            <div className="text-center bg-purple-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-purple-700">{compounds.length}</p>
              <p className="text-xs text-purple-600 mt-0.5">مجمع</p>
            </div>
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

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[
            { key: 'compounds', label: 'المجمعات', icon: Building2 },
            { key: 'doctors', label: 'الأطباء', icon: Users },
            { key: 'pharmacies', label: 'الصيدليات', icon: Pill },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'compounds' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setAddModalType('compound'); setAddModalOpen(true); }}>
                + إضافة مجمع موجود
              </Button>
            </div>
            {compounds.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
                <Building2 size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">لا توجد مجمعات في هذه المنطقة</p>
              </div>
            ) : (
              compounds.map(c => (
                <Link
                  key={c.id}
                  to={`/compounds/${c.id}`}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:border-purple-200 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      {c.area && <p className="text-xs text-slate-500">{c.area}</p>}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>
              ))
            )}
          </div>
        )}

        {tab === 'doctors' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setAddModalType('doctor'); setAddModalOpen(true); }}>
                + إضافة طبيب موجود
              </Button>
            </div>
            {doctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
                <Users size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">لا يوجد أطباء في هذه المنطقة</p>
              </div>
            ) : (
              doctors.map(d => (
                <Link
                  key={d.id}
                  to={`/doctors/${d.id}`}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-lg">
                      🩺
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                      <p className="text-xs text-slate-500">{(d.specialties || []).join('، ')}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>
              ))
            )}
          </div>
        )}

        {tab === 'pharmacies' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setAddModalType('pharmacy'); setAddModalOpen(true); }}>
                + إضافة صيدلية موجودة
              </Button>
            </div>
            {pharmacies.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
                <Pill size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">لا توجد صيدليات في هذه المنطقة</p>
              </div>
            ) : (
              pharmacies.map(p => (
                <Link
                  key={p.id}
                  to={`/pharmacies/${p.id}`}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-lg">
                      💊
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.address}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>
              ))
            )}
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-4">
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} fullWidth>
            <Trash2 size={14} /> حذف المنطقة نهائياً
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        title={zone.archived ? 'استعادة المنطقة' : 'أرشفة المنطقة'}
        message={zone.archived ? `هل أنت متأكد من استعادة منطقة "${zone.name}"؟` : `هل أنت متأكد من أرشفة منطقة "${zone.name}"؟`}
        confirmLabel={zone.archived ? 'استعادة' : 'أرشفة'}
        variant="warning"
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف نهائي"
        message={`هل أنت متأكد من حذف منطقة "${zone.name}" نهائياً؟`}
        confirmLabel="حذف نهائياً"
        variant="danger"
      />

      <AddEntityToZoneModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        zoneId={zone.id}
        entityType={addModalType}
        onAdded={loadData}
      />
    </>
  );
}
