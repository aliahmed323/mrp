import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormControls';
import { db } from '@/services/storage/db';
import { updateDoctor } from '@/services/storage/doctorRepository';
import { updatePharmacy } from '@/services/storage/pharmacyRepository';
import type { Doctor } from '@/modules/doctors/models/doctor.model';
import type { Pharmacy } from '@/modules/pharmacies/models/pharmacy.model';
import { Search, Plus } from 'lucide-react';
import { LoadingState } from '@/components/ui/States';

interface AddEntityToCompoundModalProps {
  open: boolean;
  onClose: () => void;
  compoundId: string;
  entityType: 'doctor' | 'pharmacy';
  existingEntityIds: string[];
  onAdded: () => void;
}

export function AddEntityToCompoundModal({
  open, onClose, compoundId, entityType, existingEntityIds, onAdded
}: AddEntityToCompoundModalProps) {
  const [entities, setEntities] = useState<Array<Doctor | Pharmacy>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSearch('');
    const fetchEntities = async () => {
      let data: Array<Doctor | Pharmacy> = [];
      if (entityType === 'doctor') {
        data = await db.doctors.filter(d => !d.archived).toArray();
      } else {
        data = await db.pharmacies.filter(p => !p.archived).toArray();
      }
      setEntities(data.filter(e => !existingEntityIds.includes(e.id)));
      setLoading(false);
    };
    fetchEntities();
  }, [open, entityType, existingEntityIds]);

  const handleAdd = async (entity: Doctor | Pharmacy) => {
    setAddingId(entity.id);
    try {
      if (entityType === 'doctor') {
        const doc = entity as Doctor;
        const newIds = [...(doc.compoundIds || []), compoundId];
        await updateDoctor(doc.id, { compoundIds: newIds });
      } else {
        const ph = entity as Pharmacy;
        const newIds = [...(ph.compoundIds || []), compoundId];
        await updatePharmacy(ph.id, { compoundIds: newIds });
      }
      onAdded();
      onClose();
    } finally {
      setAddingId(null);
    }
  };

  const filtered = entities.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onClose={onClose} title={entityType === 'doctor' ? 'إضافة طبيب للمجمع' : 'إضافة صيدلية للمجمع'}>
      <div className="p-4 space-y-4">
        <div className="relative">
          <Input 
            placeholder="بحث بالاسم..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
          />
          <Search size={16} className="absolute left-3 top-10 text-slate-400" />
        </div>

        {loading ? (
          <div className="py-8"><LoadingState /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            لا توجد نتائج مطابقة أو أن جميع السجلات مضافة بالفعل.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filtered.map(entity => (
              <div key={entity.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{entity.name}</p>
                  <p className="text-xs text-slate-500">
                    {entityType === 'doctor' 
                      ? ((entity as Doctor).specialties || []).join('، ') 
                      : (entity as Pharmacy).address}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  loading={addingId === entity.id}
                  disabled={addingId !== null}
                  onClick={() => handleAdd(entity)}
                >
                  <Plus size={14} className="ml-1" /> إضافة
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
