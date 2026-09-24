import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Archive, RotateCcw,
  Package, Calendar, Info, FileText, CheckCircle2, FlaskConical
} from 'lucide-react';
import { getProductById } from '@/services/storage/productRepository';
import { useProductStore } from '../hooks/useProductStore';
import type { Product, ActiveIngredient } from '../models/product.model';
import { getExpiryStatus, EXPIRY_STATUS_LABELS, DOSAGE_FORM_LABELS, BONUS_TYPE_LABELS, PACKAGING_TYPE_LABELS } from '../models/product.model';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archiveProduct, unarchiveProduct } = useProductStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id).then(p => { setProduct(p ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ التحميل..." />;
  if (!product) return <div className="text-center py-12 text-slate-500">المنتج غير موجود</div>;

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (product.archived) await unarchiveProduct(product.id);
      else await archiveProduct(product.id);
      navigate('/products', { replace: true });
    } finally {
      setActionLoading(false);
      setConfirmArchive(false);
    }
  };

  const expiryStatus = getExpiryStatus(product.expiryDate);
  const expiryColors = {
    valid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    expiring_soon: 'bg-orange-50 text-orange-700 border-orange-200',
    expired: 'bg-red-50 text-red-700 border-red-200',
  };

  const ingredients: ActiveIngredient[] = product.activeIngredients && product.activeIngredients.length > 0 
    ? product.activeIngredients 
    : [{ name: product.genericName || 'غير محدد', concentration: product.strength || '' }];

  const packagingLabel = product.packagingType ? PACKAGING_TYPE_LABELS[product.packagingType] : 'وحدات';

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto pb-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/products/${product.id}/edit`)}>
              <Edit2 size={14} /> تعديل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmArchive(true)}>
              {product.archived ? <RotateCcw size={14} /> : <Archive size={14} />}
              {product.archived ? 'استعادة' : 'أرشفة'}
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-right">
            <div className="w-24 h-24 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
              {product.image ? (
                <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
              ) : (
                <Package size={32} className="text-indigo-300" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">{product.productName}</h1>
                  <p className="text-sm text-slate-500 mt-1">{product.company}</p>
                </div>
                
                <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                  {product.protected && (
                    <span className="text-[10px] px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold border border-amber-200">
                      محمي
                    </span>
                  )}
                  {product.burning && (
                    <span className="text-[10px] px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg font-bold border border-rose-200">
                      حرق
                    </span>
                  )}
                  <span className={cn('text-[10px] px-2.5 py-1 rounded-lg font-bold border', expiryColors[expiryStatus])}>
                    {EXPIRY_STATUS_LABELS[expiryStatus]}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                  {product.category}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                  {DOSAGE_FORM_LABELS[product.dosageForm] || product.dosageForm}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                  {packagingLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 border-t border-slate-100">
            <div className="bg-white p-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">الكمية في الباكيت</p>
              <p className="text-sm font-bold text-slate-900">{product.unitsPerPackage || product.stripsPerBox}</p>
            </div>
            <div className="bg-white p-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">صافي السعر</p>
              <p className="text-sm font-bold text-[#0F52BA]" dir="ltr">{formatCurrency(product.netPrice)}</p>
            </div>
            <div className="bg-white p-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">سعر الباكيت</p>
              <p className="text-sm font-bold text-slate-900" dir="ltr">{formatCurrency(product.boxPrice)}</p>
            </div>
            <div className="bg-white p-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">البونص</p>
              <p className="text-sm font-bold text-slate-900">{product.bonus || '-'}</p>
            </div>
          </div>
        </div>

        {/* Active Ingredients */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FlaskConical size={16} className="text-teal-500" /> المواد الفعالة والتركيز
          </h3>
          <div className="space-y-2">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-800">{ing.name}</span>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-100" dir="ltr">
                  {ing.concentration}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Info size={16} className="text-blue-500" /> تفاصيل إضافية
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">الاسم التجاري (Brand)</p>
              <p className="text-sm font-medium text-slate-900">{product.brandName || '-'}</p>
            </div>
            {product.packagingType === 'strips' && (
              <div>
                <p className="text-xs text-slate-500 mb-1">سعر الشريط</p>
                <p className="text-sm font-medium text-slate-900" dir="ltr">{formatCurrency(product.stripPrice)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">نقاط البونص</p>
              <p className="text-sm font-medium text-slate-900">{product.bonusPoints || 0} نقطة</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">نوع البونص</p>
              <p className="text-sm font-medium text-slate-900">{BONUS_TYPE_LABELS[product.bonusType]}</p>
            </div>
          </div>
        </div>

        {/* Expiry */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', expiryColors[expiryStatus])}>
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500">تاريخ الصلاحية المشحون</p>
            <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">{product.expiryDate}</p>
          </div>
        </div>

        {/* Competitors */}
        {product.competitors && product.competitors.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-rose-500" /> المنافسون
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.competitors.map(comp => (
                <span key={comp} className="text-xs px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg">
                  {comp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {product.notes && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={16} className="text-slate-500" /> ملاحظات
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{product.notes}</p>
          </div>
        )}

      </div>

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        title={product.archived ? 'إلغاء الأرشفة' : 'أرشفة المنتج'}
        message={product.archived ? 'هل تريد استعادة هذا المنتج؟' : 'هل أنت متأكد من أرشفة هذا المنتج؟'}
        confirmLabel={product.archived ? 'استعادة' : 'أرشفة'}
        variant="warning"
        loading={actionLoading}
      />
    </>
  );
}
