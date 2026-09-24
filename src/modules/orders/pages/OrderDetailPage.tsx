import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, CheckCircle2, XCircle, 
  Clock, Package, AlertCircle, Building2, User, Share2
} from 'lucide-react';
import { getOrderById, updateOrder } from '@/services/storage/orderRepository';
import { useOrderStore } from '../hooks/useOrderStore';
import type { Order } from '../models/order.model';
import { ORDER_STATUS_LABELS } from '../models/order.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { formatCurrency } from '@/utils/currency';
import toast from 'react-hot-toast';

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

  if (loading) return <LoadingState message="جارٍ تحميل الطلبية..." />;
  if (!order) return <div className="text-center py-12 text-slate-500">الطلبية غير موجودة</div>;

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await removeOrder(order.id);
      navigate('/orders', { replace: true });
    } finally {
      setActionLoading(false);
      setConfirmDelete(false);
    }
  };

  const updateStatus = async (status: Order['status']) => {
    try {
      const updated = await updateOrder(order.id, { status });
      setOrder(updated);
      toast.success('تم تحديث حالة الطلبية');
    } catch {
      toast.error('فشل تحديث الحالة');
    }
  };

  const handleWhatsAppShare = () => {
    // Generate text WITHOUT netPrice as requested
    const text = `*طلب جديد*\n\nالصيدلية: ${order.pharmacyName}\n${order.doctorName ? `الطبيب: ${order.doctorName}\n` : ''}المنتج: ${order.productName}\nالكمية: ${order.quantity} علبة\nالبونص: ${order.bonus || 'لا يوجد'}\n${order.notes ? `ملاحظات: ${order.notes}` : ''}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto pb-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
             <Button variant="secondary" size="sm" onClick={handleWhatsAppShare} className="text-green-700 bg-green-50 border-green-200 hover:bg-green-100">
               <Share2 size={14} /> واتساب
             </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/orders/${order.id}/edit`)}>
              <Edit2 size={14} /> تعديل
            </Button>
          </div>
        </div>

        {/* Status Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${statusColors[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <p className="text-xs text-slate-500 mt-2">تاريخ الطلب: {order.orderDate}</p>
        </div>

        {/* Entities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">الصيدلية الطالبة</p>
                <p className="text-sm font-bold text-slate-900">{order.pharmacyName}</p>
              </div>
            </div>
          </div>
          
          {order.doctorName && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">بناءً على طلب الطبيب</p>
                  <p className="text-sm font-bold text-slate-900">{order.doctorName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Package size={16} className="text-indigo-500" /> تفاصيل الطلبية
            </h3>
          </div>
          
          <div className="p-4 bg-slate-50 flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-sm">
              📦
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{order.productName}</h4>
              <div className="flex gap-4 mt-2">
                <div>
                  <p className="text-[10px] text-slate-500">الكمية</p>
                  <p className="text-sm font-bold">{order.quantity} علبة</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">البونص</p>
                  <p className="text-sm font-bold text-emerald-600">{order.bonus || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-50 bg-white flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">صافي السعر المتوقع (الداخلي)</span>
            <span className="text-lg font-bold text-[#0F52BA]" dir="ltr">
              {formatCurrency(order.netPrice * order.quantity)}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 grid grid-cols-2 gap-4">
           {order.expectedDate && (
             <div>
               <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                 <Clock size={14} /> التوصيل المتوقع
               </p>
               <p className="text-sm font-medium text-slate-900">{order.expectedDate}</p>
             </div>
           )}
           {order.followUpDate && (
             <div>
               <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                 <AlertCircle size={14} /> المتابعة القادمة
               </p>
               <p className="text-sm font-medium text-slate-900">{order.followUpDate}</p>
             </div>
           )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 ملاحظات</h3>
            <p className="text-sm text-slate-700">{order.notes}</p>
          </div>
        )}

        {/* Quick Status Actions */}
        {order.status === 'pending' && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50" onClick={() => updateStatus('delivered')}>
              <CheckCircle2 size={16} /> تم التوصيل
            </Button>
            <Button variant="secondary" className="text-red-700 border-red-200 hover:bg-red-50" onClick={() => updateStatus('cancelled')}>
              <XCircle size={16} /> إلغاء الطلبية
            </Button>
          </div>
        )}

        <div className="pt-6">
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} fullWidth>
            <Trash2 size={14} /> حذف الطلبية
          </Button>
        </div>

      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف نهائي"
        message="هل أنت متأكد من حذف هذه الطلبية نهائياً؟"
        confirmLabel="حذف نهائياً"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
