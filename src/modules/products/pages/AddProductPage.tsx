import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProductStore } from '../hooks/useProductStore';
import { ProductForm } from '../components/ProductForm';
import type { ProductFormData } from '../models/product.model';

export function AddProductPage() {
  const navigate = useNavigate();
  const { addProduct } = useProductStore();

  const handleSubmit = async (data: ProductFormData) => {
    await addProduct(data);
    navigate('/products', { replace: true });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">إضافة منتج جديد</h2>
          <p className="text-xs text-slate-500">أدخل بيانات المنتج</p>
        </div>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="إضافة المنتج"
      />
    </div>
  );
}
