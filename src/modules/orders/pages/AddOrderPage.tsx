import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useOrderStore } from '../hooks/useOrderStore';
import { OrderForm } from '../components/OrderForm';
import type { OrderFormData } from '../models/order.model';

export function AddOrderPage() {
  const navigate = useNavigate();
  const { addOrder } = useOrderStore();

  const handleSubmit = async (data: OrderFormData) => {
    const order = await addOrder(data);
    navigate(`/orders/${order.id}`, { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">إضافة طلب جديد</h2>
      </div>

      <OrderForm
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="حفظ الطلب"
      />
    </div>
  );
}
