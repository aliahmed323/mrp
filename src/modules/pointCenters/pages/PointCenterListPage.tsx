import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building, User, Activity } from 'lucide-react';
import { usePointCenterStore } from '../hooks/usePointCenterStore';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { db } from '@/services/storage/db';

export function PointCenterListPage() {
  const navigate = useNavigate();
  const { loading, pointCenters, loadPointCenters, searchQuery, setSearchQuery, getFiltered } = usePointCenterStore();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { 
    loadPointCenters(); 
    db.orders.toArray().then(setOrders);
  }, [loadPointCenters]);

  if (loading) return <LoadingState message="جارٍ تحميل الـ Point Centers..." />;

  const filtered = getFiltered();

  const getActivityStatus = (pc: any) => {
    const count = orders.filter(o => 
      (pc.type === 'doctor' && o.doctorId === pc.doctorId) || 
      (pc.type === 'pharmacy' && o.pharmacyId === pc.pharmacyId)
    ).length;
    
    if (count === 0) return { label: 'خامل', class: 'bg-slate-100 text-slate-600' };
    if (count === 1) return { label: 'طلب واحد', class: 'bg-amber-100 text-amber-700' };
    return { label: 'نشط (مستمر)', class: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Point Centers</h2>
          <p className="text-xs text-slate-500">{pointCenters.length} مسجل</p>
        </div>
        <Button size="sm" onClick={() => navigate('/point-centers/new')}>
          <Plus size={16} /> إضافة جديد
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 h-10">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="search"
          placeholder="ابحث..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="لا توجد Point Centers" description="قم بالإضافة الآن" action={{ label: 'إضافة', onClick: () => navigate('/point-centers/new') }} />
      ) : (
        <div className="space-y-3">
          {filtered.map(pc => {
            const status = getActivityStatus(pc);
            return (
            <div key={pc.id} onClick={() => navigate(`/point-centers/${pc.id}/edit`)} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Activity className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-slate-900">{pc.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.class}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    {pc.type === 'doctor' ? <User size={12}/> : <Building size={12}/>}
                    {pc.type === 'doctor' ? 'تابع لطبيب' : 'تابع لصيدلية'}
                  </span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
