import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useOrderStore } from '../hooks/useOrderStore';
import { OrderCard } from '../components/OrderCard';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { cn } from '@/utils/cn';
import type { OrderStatus } from '../models/order.model';
import { ORDER_STATUS_LABELS } from '../models/order.model';

export function OrderListPage() {
  const navigate = useNavigate();
  const { orders, loading, loadOrders, stats } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => { loadOrders(); }, [loadOrders]);

  if (loading) return <LoadingState message="جارٍ تحميل الطلبات..." />;

  // Filter logic
  let filtered = orders;
  if (statusFilter !== 'all') {
    filtered = filtered.filter(o => o.status === statusFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(o => 
      o.pharmacyName.toLowerCase().includes(q) || 
      o.productName.toLowerCase().includes(q) ||
      (o.doctorName && o.doctorName.toLowerCase().includes(q))
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">الطلبات (Orders)</h2>
          <p className="text-xs text-slate-500">{stats.pending} طلب قيد الانتظار</p>
        </div>
        <Button size="sm" onClick={() => navigate('/orders/new')}>
          <Plus size={16} /> طلب جديد
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 h-10">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="search"
          placeholder="ابحث باسم الصيدلية أو المنتج..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            'whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
            statusFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
          )}
        >
          الكل ({stats.total})
        </button>
        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              statusFilter === status ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
            )}
          >
            {ORDER_STATUS_LABELS[status]} ({orders.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          type="generic"
          title="لا توجد طلبات"
          description={searchQuery || statusFilter !== 'all' ? 'لا توجد نتائج تطابق الفلاتر المحددة' : 'ابدأ بإنشاء أول طلب للصيدلية'}
          action={(!searchQuery && statusFilter === 'all') ? { label: '+ إضافة طلب', onClick: () => navigate('/orders/new') } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
