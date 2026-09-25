import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Archive, RotateCcw,
  Phone, MapPin, Users, ShoppingBag, User, Contact, PhoneCall, Trash2, Building2
} from 'lucide-react';
import { getPharmacyById } from '@/services/storage/pharmacyRepository';
import { getDoctorById } from '@/services/storage/doctorRepository';
import { usePharmacyStore } from '../hooks/usePharmacyStore';
import type { Pharmacy } from '../models/pharmacy.model';
import type { Doctor } from '@/modules/doctors/models/doctor.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { ShareLocationButton } from '@/modules/doctors/components/ShareLocationButton';
import { formatCoordinatesDisplay } from '@/services/location/locationService';
import { getCompoundById } from '@/services/storage/compoundRepository';
import type { Compound } from '@/modules/compounds/models/compound.model';

export function PharmacyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archivePharmacy, unarchivePharmacy, deletePharmacy } = usePharmacyStore();

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const p = await getPharmacyById(id);
      setPharmacy(p ?? null);
      if (p) {
        // Fetch linked doctors
        const docIds = p.doctorIds || (p.doctorId ? [p.doctorId] : []);
        if (docIds.length > 0) {
          const docs = await Promise.all(docIds.map(docId => getDoctorById(docId)));
          setDoctors(docs.filter(d => d !== undefined) as Doctor[]);
        }
        // Fetch compounds
        const compIds = p.compoundIds || [];
        if (compIds.length > 0) {
          const comps = await Promise.all(compIds.map(compId => getCompoundById(compId)));
          setCompounds(comps.filter(c => c !== undefined) as Compound[]);
        }
      }
      setLoading(false);
    };
    fetchData();
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
        
        {/* Compound Links */}
        {compounds.length > 0 && (
          <div className="space-y-2">
            {compounds.map(compound => (
              <Link key={compound.id} to={`/compounds/${compound.id}`} className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 flex items-center justify-between hover:bg-purple-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">المجمع التنظيمي</p>
                    <p className="text-sm font-bold text-purple-700">{compound.name}</p>
                  </div>
                </div>
                <ArrowLeft size={16} className="text-purple-400" />
              </Link>
            ))}
          </div>
        )}

        {/* Doctor Links */}
        {pharmacy.ownership === 'doctor-affiliated' && doctors.length > 0 && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
              <Users size={16} className="text-blue-500" /> الأطباء المرتبطين
            </h3>
            <div className="space-y-2">
              {doctors.map(doctor => (
                <Link key={doctor.id} to={`/doctors/${doctor.id}`} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-lg">
                      🩺
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{doctor.name}</p>
                    </div>
                  </div>
                  <ArrowLeft size={14} className="text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">👥 جهات الاتصال والمعلومات</h3>
          
          {pharmacy.phone && (
            <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <Phone size={16} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">هاتف الصيدلية العام</p>
                <a href={`tel:${pharmacy.phone}`} className="text-sm font-medium text-[#0F52BA] hover:underline" dir="ltr">
                  {pharmacy.phone}
                </a>
              </div>
            </div>
          )}

          {pharmacy.ownerName && (
             <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
               <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                 <User size={16} className="text-amber-600" />
               </div>
               <div className="flex-1">
                 <p className="text-xs text-slate-500">صاحب الصيدلية</p>
                 <p className="text-sm font-medium text-slate-800">{pharmacy.ownerName}</p>
               </div>
               {pharmacy.ownerPhone && (
                 <a href={`tel:${pharmacy.ownerPhone}`} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                   <PhoneCall size={14} />
                 </a>
               )}
             </div>
          )}

          {pharmacy.orderManagerName && (
             <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
               <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                 <Contact size={16} className="text-indigo-600" />
               </div>
               <div className="flex-1">
                 <p className="text-xs text-slate-500">مسؤول الطلبات</p>
                 <p className="text-sm font-medium text-slate-800">{pharmacy.orderManagerName}</p>
               </div>
               {pharmacy.orderManagerPhone && (
                 <a href={`tel:${pharmacy.orderManagerPhone}`} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                   <PhoneCall size={14} />
                 </a>
               )}
             </div>
          )}

          {pharmacy.residentPharmacistName && (
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                 <Contact size={16} className="text-emerald-600" />
               </div>
               <div className="flex-1">
                 <p className="text-xs text-slate-500">الصيدلاني المقيم</p>
                 <p className="text-sm font-medium text-slate-800">{pharmacy.residentPharmacistName}</p>
               </div>
               {pharmacy.residentPharmacistPhone && (
                 <a href={`tel:${pharmacy.residentPharmacistPhone}`} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                   <PhoneCall size={14} />
                 </a>
               )}
             </div>
          )}
        </div>

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
            <div className="flex gap-2">
              <ShareLocationButton
                location={pharmacy.location}
                label={pharmacy.name}
                address={pharmacy.address}
                size="lg"
                fullWidth
              />
              <Button 
                variant="secondary" 
                size="lg" 
                className="shrink-0 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 px-4"
                onClick={() => window.open(`waze://ul?ll=${pharmacy.location!.latitude},${pharmacy.location!.longitude}&navigate=yes`, '_blank')}
                title="فتح في Waze"
              >
                🚗 Waze
              </Button>
            </div>
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

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-red-600">منطقة الخطر</h3>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} fullWidth>
            <Trash2 size={14} /> حذف الصيدلية نهائياً
          </Button>
        </div>

      </div>

      <ConfirmDialog open={confirmArchive} onClose={() => setConfirmArchive(false)} onConfirm={handleArchive} title="أرشفة" message="أرشفة هذه الصيدلية؟" confirmLabel="أرشفة" variant="warning" loading={actionLoading} />
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="حذف نهائي" message="حذف الصيدلية نهائياً؟" confirmLabel="حذف نهائياً" variant="danger" loading={actionLoading} />
    </>
  );
}
