import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Package, Calendar, CalendarDays, ShoppingBag, Store, User } from 'lucide-react';
import { getOrderById } from '@/services/storage/orderRepository';
import { useOrderStore } from '../hooks/useOrderStore';
import type { Order } from '../models/order.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../models/order.model';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { removeOrder } = useOrderStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then(o => { setOrder(o ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!order) return <div className="text-center py-12 text-slate-500">الطلب غير موجود</div>;

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await removeOrder(order.id);
      navigate('/orders', { replace: true });
    } finally { setActionLoading(false); setConfirmDelete(false); }
  };

  const statusColor = ORDER_STATUS_COLORS[order.status];
  const bgColors: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto pb-8">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/orders/${order.id}/edit`)}>
              <Edit2 size={14} /> تعديل
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-5 relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{order.productName}</h1>
                <p className="text-sm text-slate-500 font-mono mt-0.5">{order.orderDate}</p>
              </div>
            </div>
            <span className={cn('text-xs px-3 py-1 rounded-full border font-bold', bgColors[statusColor])}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 mb-4">
            <div className="text-center border-r border-slate-100 last:border-0">
              <p className="text-xs text-slate-500">الكمية</p>
              <p className="text-lg font-bold text-slate-900">{order.quantity}</p>
            </div>
            <div className="text-center border-r border-slate-100 last:border-0">
              <p className="text-xs text-slate-500">البونص</p>
              <p className="text-lg font-bold text-slate-900">{order.bonus || '-'}</p>
            </div>
            <div className="text-center border-r border-slate-100 last:border-0">
              <p className="text-xs text-slate-500">الإجمالي</p>
              <p className="text-sm font-bold text-[#0F52BA] mt-1" dir="ltr">{formatCurrency(order.netPrice)}</p>
            </div>
          </div>

          <Link to={`/products/${order.productId}`} className="w-full flex items-center justify-center gap-2 text-sm text-[#0F52BA] font-medium hover:underline p-2 bg-blue-50 rounded-xl">
            <Package size={16} /> عرض تفاصيل المنتج
          </Link>
        </div>

        {/* Entity Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to={`/pharmacies/${order.pharmacyId}`} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:border-blue-200 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Store size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500">صيدلية الطلب</p>
              <p className="text-sm font-bold text-slate-900">{order.pharmacyName}</p>
            </div>
          </Link>
          
          {order.doctorId && (
            <Link to={`/doctors/${order.doctorId}`} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">الطبيب المعني</p>
                <p className="text-sm font-bold text-slate-900">{order.doctorName}</p>
              </div>
            </Link>
          )}
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-50 pb-2">📅 التواريخ والمتابعة</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {order.expectedDate && (
              <div className="flex gap-2 items-center">
                <Calendar size={16} className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500">التسليم المتوقع</p>
                  <p className="text-sm font-medium text-slate-800">{order.expectedDate}</p>
                </div>
              </div>
            )}
            {order.followUpDate && (
              <div className="flex gap-2 items-center">
                <CalendarDays size={16} className="text-orange-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500">تاريخ المتابعة</p>
                  <p className="text-sm font-medium text-slate-800">{order.followUpDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 border-b border-slate-50 pb-2">📝 ملاحظات الطلب</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}

        {/* Danger */}
        <div className="bg-white rounded-2xl border border-red-100 p-4">
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} fullWidth>
            <Trash2 size={14} /> حذف الطلب نهائياً
          </Button>
        </div>
      </div>

      <ConfirmDialog 
        open={confirmDelete} 
        onClose={() => setConfirmDelete(false)} 
        onConfirm={handleDelete} 
        title="حذف الطلب" 
        message="هل أنت متأكد من حذف هذا الطلب نهائياً؟" 
        confirmLabel="حذف" 
        variant="danger" 
        loading={actionLoading} 
      />
    </>
  );
}
