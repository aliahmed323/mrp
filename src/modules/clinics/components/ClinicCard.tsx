import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, Archive, Trash2, RotateCcw, MapPin, Phone, Users } from 'lucide-react';
import type { Clinic } from '../models/clinic.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useClinicStore } from '../hooks/useClinicStore';
import { ShareLocationButton } from '@/modules/doctors/components/ShareLocationButton';
import { cn } from '@/utils/cn';

interface ClinicCardProps {
  clinic: Clinic;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const navigate = useNavigate();
  const { archiveClinic, unarchiveClinic, deleteClinic } = useClinicStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (clinic.archived) await unarchiveClinic(clinic.id);
      else await archiveClinic(clinic.id);
    } finally {
      setActionLoading(false);
      setConfirmArchive(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteClinic(clinic.id);
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
          clinic.archived && 'opacity-60'
        )}
      >
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/clinics/${clinic.id}`)}
        >
          {/* Top: Icon + Identity */}
          <div className="flex gap-3 p-3">
            <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl bg-indigo-50">
              🏥
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {clinic.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 rounded flex items-center gap-1">
                  <Users size={10} /> {clinic.doctorName}
                </span>
              </div>
              {clinic.address && (
                <p className="text-xs text-slate-400 mt-1 truncate">{clinic.address}</p>
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
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); navigate(`/clinics/${clinic.id}/edit`); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 size={15} /> تعديل
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmArchive(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {clinic.archived ? <RotateCcw size={15} /> : <Archive size={15} />}
                      {clinic.archived ? 'إلغاء الأرشفة' : 'أرشفة'}
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
            {clinic.phone && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Phone size={11} /> {clinic.phone}
              </span>
            )}
            {clinic.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                <MapPin size={11} /> موقع محفوظ
              </span>
            )}
          </div>
        </div>

        {/* Share Location Button */}
        {clinic.location && (
          <div className="px-3 pb-3 pt-1" onClick={e => e.stopPropagation()}>
            <ShareLocationButton
              location={clinic.location}
              label={clinic.name}
              address={clinic.address}
              size="sm"
              fullWidth
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        title={clinic.archived ? 'إلغاء الأرشفة' : 'أرشفة'}
        message={clinic.archived ? `استعادة "${clinic.name}" من الأرشيف؟` : `أرشفة "${clinic.name}"؟`}
        confirmLabel={clinic.archived ? 'استعادة' : 'أرشفة'}
        variant="warning"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف نهائي"
        message={`هل أنت متأكد من حذف "${clinic.name}"؟`}
        confirmLabel="حذف نهائياً"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
