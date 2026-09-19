import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, Trash2, Package, Calendar, CalendarDays } from 'lucide-react';
import type { Order } from '../models/order.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useOrderStore } from '../hooks/useOrderStore';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../models/order.model';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate();
  const { removeOrder } = useOrderStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await removeOrder(order.id);
    } finally {
      setActionLoading(false);
      setConfirmDelete(false);
    }
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex items-start justify-between p-3 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', bgColors[statusColor])}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <span className="text-xs text-slate-500 font-mono">{order.orderDate}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight mt-1 truncate max-w-[200px] sm:max-w-[250px]">
              {order.pharmacyName}
            </h3>
            {order.doctorName && (
              <p className="text-[11px] text-slate-500 mt-0.5">طبيب: {order.doctorName}</p>
            )}
          </div>

          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[160px]">
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); navigate(`/orders/${order.id}/edit`); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Edit2 size={15} /> تعديل الطلب
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmDelete(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={15} /> حذف الطلب
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Body (Clickable to detail page) */}
        <div className="p-3 cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <Package size={20} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-900 truncate">{order.productName}</div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                <span>الكمية: <strong>{order.quantity}</strong></span>
                {order.bonus && <span>بونص: <strong>{order.bonus}</strong></span>}
              </div>
            </div>
            <div className="text-left shrink-0">
              <div className="font-bold text-sm text-slate-900" dir="ltr">{formatCurrency(order.netPrice)}</div>
            </div>
          </div>
          
          {(order.expectedDate || order.followUpDate) && (
            <div className="mt-3 flex gap-4 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              {order.expectedDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-blue-500" /> التسليم المتوقع: {order.expectedDate}
                </span>
              )}
              {order.followUpDate && (
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} className="text-orange-500" /> متابعة: {order.followUpDate}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف الطلب"
        message="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
