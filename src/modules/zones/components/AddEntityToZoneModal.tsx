import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { db } from '@/services/storage/db';
import { Button } from '@/components/ui/Button';

interface AddEntityToZoneModalProps {
  open: boolean;
  onClose: () => void;
  zoneId: string;
  entityType: 'compound' | 'doctor' | 'pharmacy';
  onAdded: () => void;
}

export function AddEntityToZoneModal({ open, onClose, zoneId, entityType, onAdded }: AddEntityToZoneModalProps) {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Fetch all entities not already in this zone
      const fetchItems = async () => {
        let all: any[] = [];
        if (entityType === 'compound') all = await db.compounds.filter(c => c.zoneId !== zoneId).toArray();
        if (entityType === 'doctor') all = await db.doctors.filter(d => d.zoneId !== zoneId).toArray();
        if (entityType === 'pharmacy') all = await db.pharmacies.filter(p => p.zoneId !== zoneId).toArray();
        setItems(all);
      };
      fetchItems();
    }
  }, [open, zoneId, entityType]);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (item: any) => {
    setLoading(true);
    if (entityType === 'compound') await db.compounds.update(item.id, { zoneId });
    if (entityType === 'doctor') await db.doctors.update(item.id, { zoneId });
    if (entityType === 'pharmacy') await db.pharmacies.update(item.id, { zoneId });
    setLoading(false);
    onAdded();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">
            {entityType === 'compound' ? 'إضافة مجمع موجود' : entityType === 'doctor' ? 'إضافة طبيب موجود' : 'إضافة صيدلية موجودة'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="بحث بالاسم..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-4 pr-10 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">لا توجد نتائج</div>
          ) : (
            <div className="space-y-1">
              {filtered.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="font-medium text-sm text-slate-800">{item.name}</div>
                  <Button size="sm" onClick={() => handleAdd(item)} disabled={loading}>
                    إضافة
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
