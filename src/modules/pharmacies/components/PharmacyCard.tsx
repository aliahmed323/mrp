import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, Archive, Trash2, RotateCcw, MapPin, Phone, Users } from 'lucide-react';
import type { Pharmacy } from '../models/pharmacy.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { usePharmacyStore } from '../hooks/usePharmacyStore';
import { ShareLocationButton } from '@/modules/doctors/components/ShareLocationButton';
import { cn } from '@/utils/cn';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

export function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  const navigate = useNavigate();
  const { archivePharmacy, unarchivePharmacy, deletePharmacy } = usePharmacyStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (pharmacy.archived) await unarchivePharmacy(pharmacy.id);
      else await archivePharmacy(pharmacy.id);
    } finally {
      setActionLoading(false);
      setConfirmArchive(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deletePharmacy(pharmacy.id);
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
          pharmacy.archived && 'opacity-60'
        )}
      >
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/pharmacies/${pharmacy.id}`)}
        >
          {/* Top: Icon + Identity */}
          <div className="flex gap-3 p-3">
            <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl bg-emerald-50">
              💊
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {pharmacy.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={cn(
                  'text-xs rounded-md px-1.5 py-0.5 font-medium',
                  pharmacy.ownership === 'independent' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'
                )}>
                  {pharmacy.ownership === 'independent' ? 'مستقلة' : 'تابعة لطبيب'}
                </span>
                {pharmacy.doctorName && (
                  <span className="text-xs text-blue-600 flex items-center gap-1">
                    <Users size={10} /> {pharmacy.doctorName}
                  </span>
                )}
              </div>
              {pharmacy.address && (
                <p className="text-xs text-slate-400 mt-1 truncate">{pharmacy.address}</p>
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
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); navigate(`/pharmacies/${pharmacy.id}/edit`); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 size={15} /> تعديل
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmArchive(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {pharmacy.archived ? <RotateCcw size={15} /> : <Archive size={15} />}
                      {pharmacy.archived ? 'إلغاء الأرشفة' : 'أرشفة'}
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
            {pharmacy.phone && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Phone size={11} /> {pharmacy.phone}
              </span>
            )}
            {pharmacy.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                <MapPin size={11} /> موقع محفوظ
              </span>
            )}
          </div>
        </div>

        {/* Share Location Button */}
        {pharmacy.location && (
          <div className="px-3 pb-3 pt-1" onClick={e => e.stopPropagation()}>
            <ShareLocationButton
              location={pharmacy.location}
              label={pharmacy.name}
              address={pharmacy.address}
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
        title={pharmacy.archived ? 'إلغاء الأرشفة' : 'أرشفة'}
        message={pharmacy.archived ? `استعادة "${pharmacy.name}" من الأرشيف؟` : `أرشفة "${pharmacy.name}"؟`}
        confirmLabel={pharmacy.archived ? 'استعادة' : 'أرشفة'}
        variant="warning"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف نهائي"
        message={`هل أنت متأكد من حذف "${pharmacy.name}"؟`}
        confirmLabel="حذف نهائياً"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
