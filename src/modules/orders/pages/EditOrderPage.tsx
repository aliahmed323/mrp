import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useOrderStore } from '../hooks/useOrderStore';
import { OrderForm } from '../components/OrderForm';
import type { OrderFormData, Order } from '../models/order.model';
import { getOrderById } from '@/services/storage/orderRepository';
import { LoadingState } from '@/components/ui/States';

export function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editOrder } = useOrderStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then(o => { setOrder(o ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!order) return <div className="text-center py-12 text-slate-500">الطلب غير موجود</div>;

  const handleSubmit = async (data: OrderFormData) => {
    await editOrder(order.id, data);
    navigate(`/orders/${order.id}`, { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">تعديل الطلب</h2>
      </div>

      <OrderForm
        initialData={order}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="حفظ التعديلات"
      />
    </div>
  );
}
