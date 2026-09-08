import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Eye, Package2, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { useProductStore } from '@/modules/products/hooks/useProductStore';
import { ProductCard } from '@/modules/products/components/ProductCard';
import { StatCard } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';

export function DashboardPage() {
  const navigate = useNavigate();
  const { loading, stats, products, loadProducts } = useProductStore();

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Get recent 3 active products
  const recentProducts = products
    .filter(p => !p.archived)
    .slice(0, 3);

  if (loading) return <LoadingState message="جارٍ تحميل لوحة التحكم..." />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">مرحباً 👋</h2>
          <p className="text-sm text-slate-500">لوحة تحكم المندوب الطبي</p>
        </div>
        <Button size="sm" onClick={() => navigate('/products/new')}>
          <Plus size={16} /> منتج جديد
        </Button>
      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">إحصائيات المنتجات</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="إجمالي المنتجات"
            value={stats.total}
            icon={<Package size={18} />}
            color="blue"
            onClick={() => navigate('/products')}
          />
          <StatCard
            label="منتجات نشطة"
            value={stats.active}
            icon={<TrendingUp size={18} />}
            color="green"
            onClick={() => navigate('/products')}
          />
          <StatCard
            label="تنتهي قريباً"
            value={stats.expiringSoon}
            icon={<AlertTriangle size={18} />}
            color="orange"
            onClick={() => { navigate('/products'); }}
          />
          <StatCard
            label="منتهية الصلاحية"
            value={stats.expired}
            icon={<XCircle size={18} />}
            color="red"
            onClick={() => { navigate('/products'); }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/products/new')}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-[#0F52BA] text-white rounded-xl hover:bg-[#1d4ed8] active:scale-95 transition-all"
          >
            <Plus size={22} />
            <span className="text-sm font-medium">إضافة منتج</span>
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Eye size={22} className="text-[#0F52BA]" />
            <span className="text-sm font-medium">عرض المنتجات</span>
          </button>
        </div>
      </div>

      {/* Recent Products */}
      {recentProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">أحدث المنتجات</h3>
            <button
              onClick={() => navigate('/products')}
              className="text-xs text-[#0F52BA] font-medium hover:underline"
            >
              عرض الكل
            </button>
          </div>
          <div className="space-y-3">
            {recentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Empty dashboard call to action */}
      {stats.total === 0 && (
        <div className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-100">
          <Package2 size={40} className="text-[#0F52BA] mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">ابدأ بإضافة منتجاتك</h3>
          <p className="text-sm text-slate-600 mb-4">أضف منتجاتك الطبية لتتبع الأسعار والبونص والصلاحية</p>
          <Button onClick={() => navigate('/products/new')}>
            <Plus size={16} /> إضافة أول منتج
          </Button>
        </div>
      )}
    </div>
  );
}
