import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getProductById } from '@/services/storage/productRepository';
import { useProductStore } from '../hooks/useProductStore';
import { ProductForm } from '../components/ProductForm';
import { LoadingState } from '@/components/ui/States';
import type { Product, ProductFormData } from '../models/product.model';

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProductById(id).then(p => {
      setProduct(p ?? null);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!id) return;
    await editProduct(id, data);
    navigate(`/products/${id}`, { replace: true });
  };

  if (loading) return <LoadingState message="جارٍ تحميل بيانات المنتج..." />;
  if (!product) return (
    <div className="text-center py-12 text-slate-500">المنتج غير موجود</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">تعديل المنتج</h2>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.productName}</p>
        </div>
      </div>

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="حفظ التعديلات"
      />
    </div>
  );
}
