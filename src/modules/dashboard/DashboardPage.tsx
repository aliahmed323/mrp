import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Users, Pill, Building2, Package, 
  ShoppingBag, FileText, Activity 
} from 'lucide-react';
import { useVisitStore } from '@/modules/visits/hooks/useVisitStore';
import { useOrderStore } from '@/modules/orders/hooks/useOrderStore';
import { useDoctorStore } from '@/modules/doctors/hooks/useDoctorStore';
import { cn } from '@/utils/cn';

export function DashboardPage() {
  const navigate = useNavigate();

  const { stats: visitStats, loadVisits } = useVisitStore();
  const { stats: orderStats, loadOrders } = useOrderStore();
  const { loadDoctors } = useDoctorStore();

  useEffect(() => {
    loadVisits();
    loadOrders();
    loadDoctors();
  }, [loadVisits, loadOrders, loadDoctors]);

  const shortcuts = [
    { label: 'الأطباء', icon: Users, to: '/doctors', color: 'bg-blue-50 text-blue-600 border-blue-100', hover: 'hover:bg-blue-100 hover:border-blue-200' },
    { label: 'الصيدليات', icon: Pill, to: '/pharmacies', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', hover: 'hover:bg-emerald-100 hover:border-emerald-200' },
    { label: 'العيادات', icon: Building2, to: '/clinics', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', hover: 'hover:bg-indigo-100 hover:border-indigo-200' },
    { label: 'المنتجات', icon: Package, to: '/products', color: 'bg-slate-50 text-slate-600 border-slate-200', hover: 'hover:bg-slate-100 hover:border-slate-300' },
  ];

  const tools = [
    { label: 'الزيارات', icon: Activity, to: '/visits', desc: 'سجل الزيارات الميدانية', color: 'text-blue-500' },
    { label: 'الطلبات', icon: ShoppingBag, to: '/orders', desc: 'إدارة طلبات الصيدليات', color: 'text-orange-500' },
    { label: 'التقارير الذكية', icon: FileText, to: '/reports', desc: 'تقارير نصية للزيارات', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Primary Action: Quick Entry */}
      <section>
        <button
          onClick={() => navigate('/quick-entry')}
          className="w-full relative overflow-hidden bg-gradient-to-br from-[#0F52BA] to-blue-600 rounded-2xl p-6 text-right shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transition-all group"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                تسجيل سريع <Zap size={24} className="fill-current text-yellow-300" />
              </h2>
              <p className="text-blue-100 text-sm opacity-90">سجل زيارتك الميدانية في ثوانٍ</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Zap size={24} className="text-white" />
            </div>
          </div>
        </button>
      </section>

      {/* 2. Fast Stats */}
      <section className="grid grid-cols-3 gap-3">
        <Link to="/visits" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center hover:border-blue-200 transition-colors">
          <p className="text-xs text-slate-500 mb-1">زيارات اليوم</p>
          <p className="text-xl font-bold text-slate-900">{visitStats.today}</p>
        </Link>
        <Link to="/orders" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center hover:border-orange-200 transition-colors">
          <p className="text-xs text-slate-500 mb-1">طلبات قيد الانتظار</p>
          <p className="text-xl font-bold text-orange-600">{orderStats.pending}</p>
        </Link>
        <Link to="/planning" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center hover:border-red-200 transition-colors">
          <p className="text-xs text-slate-500 mb-1">متابعات مطلوبة</p>
          <p className="text-xl font-bold text-red-600">{visitStats.pendingFollowUps}</p>
        </Link>
      </section>

      {/* 3. Core Entities Shortcuts */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">قاعدة البيانات</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {shortcuts.map((s, i) => (
            <Link 
              key={i} 
              to={s.to}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-2xl border transition-all',
                s.color, s.hover
              )}
            >
              <s.icon size={24} className="mb-2" />
              <span className="text-sm font-semibold">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Tools */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">أدوات العمل</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tools.map((t, i) => (
            <Link 
              key={i} 
              to={t.to}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:border-blue-200 transition-colors group"
            >
              <div className={cn('w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors', t.color)}>
                <t.icon size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{t.label}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
