import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Archive, Trash2, Package, RotateCcw,
  Star, Calendar, Building2,
} from 'lucide-react';
import { getProductById } from '@/services/storage/productRepository';
import { useProductStore } from '../hooks/useProductStore';
import type { Product } from '../models/product.model';
import { getExpiryStatus, DOSAGE_FORM_LABELS, BONUS_TYPE_LABELS } from '../models/product.model';
import { ExpiryBadge, ProtectedBadge, BurningBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';
import { formatCurrency, getExpiryLabel, formatDate } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { archiveProduct, unarchiveProduct, deleteProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id).then(p => { setProduct(p ?? null); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState message="جارٍ تحميل..." />;
  if (!product) return <div className="text-center py-12 text-slate-500">المنتج غير موجود</div>;

  const expiryStatus = getExpiryStatus(product.expiryDate);

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (product.archived) await unarchiveProduct(product.id);
      else await archiveProduct(product.id);
      navigate('/products', { replace: true });
    } finally { setActionLoading(false); setConfirmArchive(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteProduct(product.id);
      navigate('/products', { replace: true });
    } finally { setActionLoading(false); setConfirmDelete(false); }
  };

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Top Nav */}
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

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex gap-4 p-4">
            {/* Image */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
              {product.image
                ? <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                : <Package size={32} className="text-slate-300" />
              }
            </div>
            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{product.productName}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{product.genericName}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 font-medium">{product.strength}</span>
                <span className="text-xs bg-slate-100 text-slate-700 rounded-md px-2 py-0.5">{product.packSize}</span>
                <span className="text-xs bg-slate-100 text-slate-700 rounded-md px-2 py-0.5">{DOSAGE_FORM_LABELS[product.dosageForm] || product.dosageForm}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <Building2 size={12} /> {product.company}
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-1.5 flex-wrap px-4 pb-4">
            <ExpiryBadge status={expiryStatus} />
            <ProtectedBadge isProtected={product.protected} />
            {product.burning && <BurningBadge isBurning />}
            {product.bonusPoints >= 15 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <Star size={10} /> بونص عالي
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">💰 الأسعار</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'سعر الشريط', value: product.stripPrice, color: 'text-slate-900' },
              { label: 'صافي السعر', value: product.netPrice, color: 'text-[#0F52BA]' },
              { label: 'سعر البيع', value: product.sellingPrice, color: 'text-slate-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-500 mb-1">{label}</div>
                <div className={cn('text-lg font-bold', color)}>{formatCurrency(value)}</div>
                <div className="text-[10px] text-slate-400">جنيه</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bonus */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">🎁 البونص</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-purple-500 mb-1">البونص</div>
              <div className="text-base font-bold text-purple-700">{product.bonus || '—'}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-purple-500 mb-1">النوع</div>
              <div className="text-sm font-bold text-purple-700">{BONUS_TYPE_LABELS[product.bonusType] || product.bonusType}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-purple-500 mb-1">النقاط</div>
              <div className="text-lg font-bold text-purple-700">{product.bonusPoints}</div>
            </div>
          </div>
        </div>

        {/* Expiry */}
        <div className={cn(
          'rounded-2xl border shadow-sm p-4',
          expiryStatus === 'expired' ? 'bg-red-50 border-red-200' :
          expiryStatus === 'expiring_soon' ? 'bg-orange-50 border-orange-200' :
          'bg-green-50 border-green-200'
        )}>
          <div className="flex items-center gap-2">
            <Calendar size={16} className={
              expiryStatus === 'expired' ? 'text-red-500' :
              expiryStatus === 'expiring_soon' ? 'text-orange-500' :
              'text-green-500'
            } />
            <span className="text-sm font-semibold text-slate-800">الصلاحية</span>
          </div>
          <div className="mt-2 flex items-end gap-3">
            <div>
              <div className="text-lg font-bold text-slate-900">{formatDate(product.expiryDate)}</div>
              <div className="text-sm text-slate-600">{getExpiryLabel(product.expiryDate)}</div>
            </div>
          </div>
        </div>

        {/* Extra Info */}
        {(product.competitors.length > 0 || product.notes || product.category) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            {product.category && (
              <div>
                <span className="text-xs text-slate-500">الفئة</span>
                <p className="text-sm font-medium text-slate-900">{product.category}</p>
              </div>
            )}
            {product.competitors.length > 0 && (
              <div>
                <span className="text-xs text-slate-500">المنافسون</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {product.competitors.map(c => (
                    <span key={c} className="text-xs bg-slate-100 text-slate-600 rounded-md px-2 py-0.5">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {product.notes && (
              <div>
                <span className="text-xs text-slate-500">ملاحظات</span>
                <p className="text-sm text-slate-700 mt-1">{product.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-red-600">منطقة الخطر</h3>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} fullWidth>
            <Trash2 size={14} /> حذف المنتج نهائياً
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        title={product.archived ? 'إلغاء الأرشفة' : 'أرشفة المنتج'}
        message={product.archived ? `استعادة "${product.productName}" من الأرشيف؟` : `أرشفة "${product.productName}"؟`}
        confirmLabel={product.archived ? 'استعادة' : 'أرشفة'}
        variant="warning"
        loading={actionLoading}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف المنتج نهائياً"
        message={`هل أنت متأكد من حذف "${product.productName}"؟ لا يمكن التراجع.`}
        confirmLabel="حذف نهائياً"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
