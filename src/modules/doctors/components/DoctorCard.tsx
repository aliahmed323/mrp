import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, Archive, Trash2, RotateCcw, MapPin, Phone, Building2, Pill } from 'lucide-react';
import type { Doctor } from '../models/doctor.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useDoctorStore } from '../hooks/useDoctorStore';
import { getDoctorClinics, getDoctorPharmacies } from '@/services/storage/doctorRepository';
import { cn } from '@/utils/cn';

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const navigate = useNavigate();
  const { archiveDoctor, unarchiveDoctor, deleteDoctor } = useDoctorStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Relations count
  const [clinicsCount, setClinicsCount] = useState(0);
  const [pharmaciesCount, setPharmaciesCount] = useState(0);

  useEffect(() => {
    getDoctorClinics(doctor.id).then(c => setClinicsCount(c.length));
    getDoctorPharmacies(doctor.id).then(p => setPharmaciesCount(p.length));
  }, [doctor.id]);

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (doctor.archived) await unarchiveDoctor(doctor.id);
      else await archiveDoctor(doctor.id);
    } finally {
      setActionLoading(false);
      setConfirmArchive(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteDoctor(doctor.id);
    } finally {
      setActionLoading(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden',
          'hover:shadow-md transition-shadow duration-200',
          doctor.archived && 'opacity-60'
        )}
      >
        {/* Card Body */}
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/doctors/${doctor.id}`)}
        >
          {/* Top: Icon + Identity */}
          <div className="flex gap-3 p-3">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl bg-blue-50">
              🩺
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 leading-tight truncate">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {doctor.name}
                </h3>
                {doctor.class && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-900 text-white shadow-sm shrink-0">
                    {doctor.class}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {doctor.specialties && doctor.specialties.length > 0 && (
                  <span className="text-xs bg-slate-100 text-slate-700 rounded-md px-1.5 py-0.5">
                    {doctor.specialties.join('، ')}
                  </span>
                )}
              </div>
              {doctor.area && (
                <p className="text-xs text-slate-400 mt-1 truncate">{doctor.area}</p>
              )}
            </div>

            {/* Menu button */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="خيارات"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[160px]">
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); navigate(`/doctors/${doctor.id}/edit`); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 size={15} /> تعديل
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmArchive(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {doctor.archived ? <RotateCcw size={15} /> : <Archive size={15} />}
                      {doctor.archived ? 'إلغاء الأرشفة' : 'أرشفة'}
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmDelete(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} /> حذف نهائي
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom: Badges */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-t border-slate-100 flex-wrap">
            {doctor.phone && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Phone size={11} /> {doctor.phone}
              </span>
            )}
            {clinicsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 bg-indigo-50 px-1.5 rounded">
                <Building2 size={11} /> {clinicsCount} عيادة
              </span>
            )}
            {pharmaciesCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-1.5 rounded">
                <Pill size={11} /> {pharmaciesCount} صيدلية
              </span>
            )}
            {doctor.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                <MapPin size={11} /> الموقع
              </span>
            )}
          </div>
        </div>


      </div>

      {/* Confirm Archive */}
      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        title={doctor.archived ? 'إلغاء الأرشفة' : 'أرشفة'}
        message={doctor.archived
          ? `هل تريد استعادة "${doctor.name}" من الأرشيف؟`
          : `هل تريد أرشفة "${doctor.name}"؟ يمكنك استعادته لاحقاً.`
        }
        confirmLabel={doctor.archived ? 'استعادة' : 'أرشفة'}
        variant="warning"
        loading={actionLoading}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف نهائي"
        message={`هل أنت متأكد من حذف "${doctor.name}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائياً"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
