import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, Archive, Trash2, RotateCcw, MapPin, Phone } from 'lucide-react';
import type { Doctor } from '../models/doctor.model';
import { DOCTOR_TYPE_LABELS, DOCTOR_TYPE_ICONS } from '../models/doctor.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useDoctorStore } from '../hooks/useDoctorStore';
import { ShareLocationButton } from './ShareLocationButton';
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
            {/* Type Icon */}
            <div className={cn(
              'w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-lg',
              doctor.type === 'doctor' ? 'bg-blue-50' :
              doctor.type === 'clinic' ? 'bg-emerald-50' :
              'bg-purple-50'
            )}>
              {DOCTOR_TYPE_ICONS[doctor.type]}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {doctor.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={cn(
                  'text-xs rounded-md px-1.5 py-0.5 font-medium',
                  doctor.type === 'doctor' ? 'bg-blue-50 text-blue-700' :
                  doctor.type === 'clinic' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-purple-50 text-purple-700'
                )}>
                  {DOCTOR_TYPE_LABELS[doctor.type]}
                </span>
                {doctor.specialty && (
                  <>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-600">{doctor.specialty}</span>
                  </>
                )}
              </div>
              {doctor.address && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">{doctor.address}</p>
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

          {/* Bottom: Contact + Location */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-t border-slate-100 flex-wrap">
            {doctor.phone && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                <Phone size={11} /> {doctor.phone}
              </span>
            )}
            {doctor.location && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <MapPin size={11} /> موقع محفوظ
              </span>
            )}
          </div>
        </div>

        {/* Share Location Button (outside the navigable card area) */}
        {doctor.location && (
          <div className="px-3 pb-3 pt-1" onClick={e => e.stopPropagation()}>
            <ShareLocationButton
              location={doctor.location}
              label={doctor.name}
              address={doctor.address}
              size="sm"
              fullWidth
            />
          </div>
        )}
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
