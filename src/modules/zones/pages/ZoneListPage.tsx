import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, MapPin, ChevronRight } from 'lucide-react';
import { useZoneStore } from '../hooks/useZoneStore';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';

export function ZoneListPage() {
  const navigate = useNavigate();
  const { zones, loading, loadZones } = useZoneStore();
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => { loadZones(); }, [loadZones]);

  const filtered = zones.filter(z => showArchived ? z.archived : !z.archived);

  if (loading) return <LoadingState message="جارٍ تحميل المناطق..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">المناطق</h1>
          <p className="text-xs text-slate-500">{filtered.length} منطقة</p>
        </div>
        <Button onClick={() => navigate('/zones/new')} size="sm">
          <Plus size={16} /> إضافة منطقة
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="لا توجد مناطق"
          description="أضف منطقة جغرافية جديدة لتنظيم عملك الميداني"
          action={{ label: '+ إضافة منطقة', onClick: () => navigate('/zones/new') }}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(zone => (
            <Link
              key={zone.id}
              to={`/zones/${zone.id}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{zone.name}</h3>
                  {zone.description && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-48">{zone.description}</p>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowArchived(s => !s)}
        className="text-xs text-slate-400 hover:text-slate-600 underline w-full text-center py-2"
      >
        {showArchived ? 'إخفاء المناطق المؤرشفة' : 'عرض المناطق المؤرشفة'}
      </button>
    </div>
  );
}
