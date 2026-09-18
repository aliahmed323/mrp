import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, Archive, Trash2, RotateCcw, Package } from 'lucide-react';
import type { Product } from '../models/product.model';
import { getExpiryStatus } from '../models/product.model';
import { ExpiryBadge, ProtectedBadge, BurningBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { formatCurrency, getExpiryLabel } from '@/utils/formatters';
import { useProductStore } from '../hooks/useProductStore';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { archiveProduct, unarchiveProduct, deleteProduct } = useProductStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const expiryStatus = getExpiryStatus(product.expiryDate);
  const hasHighBonus = product.bonusPoints >= 15;

  const expiryBorderColor = {
    valid: '',
    expiring_soon: 'border-l-4 border-l-orange-400',
    expired: 'border-l-4 border-l-red-400',
  }[expiryStatus];

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      if (product.archived) await unarchiveProduct(product.id);
      else await archiveProduct(product.id);
    } finally {
      setActionLoading(false);
      setConfirmArchive(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteProduct(product.id);
    } finally {
      setActionLoading(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden',
          'hover:shadow-md transition-shadow duration-200',
          expiryBorderColor,
          product.archived && 'opacity-60'
        )}
      >
        {/* Card Body */}
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          {/* Top: Image + Identity */}
          <div className="flex gap-3 p-3">
            {/* Product Image */}
            <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Package size={24} className="text-slate-300" />
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {product.productName}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">{product.genericName}</p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-xs bg-slate-100 text-slate-600 rounded-md px-1.5 py-0.5 font-medium">
                  {product.strength}
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-600">{product.stripsPerBox} أشرطة</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{product.company}</p>
            </div>

            {/* Menu button */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="خيارات"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[160px]">
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); navigate(`/products/${product.id}/edit`); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 size={15} /> تعديل
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmArchive(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {product.archived ? <RotateCcw size={15} /> : <Archive size={15} />}
                      {product.archived ? 'إلغاء الأرشفة' : 'أرشفة'}
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmDelete(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} /> حذف نهائي
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-3 gap-0 border-t border-slate-100">
            <div className="flex flex-col items-center py-2.5 border-r border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium">سعر الشريط</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">
                {formatCurrency(product.stripPrice)} <span className="text-[9px] font-normal text-slate-400">ج</span>
              </span>
            </div>
            <div className="flex flex-col items-center py-2.5 border-r border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium">صافي السعر</span>
              <span className="text-sm font-bold text-[#0F52BA] mt-0.5">
                {formatCurrency(product.netPrice)} <span className="text-[9px] font-normal text-slate-400">ج</span>
              </span>
            </div>
            <div className="flex flex-col items-center py-2.5">
              <span className="text-[10px] text-slate-400 font-medium">البونص</span>
              <span className={cn(
                'text-sm font-bold mt-0.5',
                hasHighBonus ? 'text-purple-600' : 'text-slate-700'
              )}>
                {product.bonus || '—'}
              </span>
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 flex-wrap">
            <ExpiryBadge status={expiryStatus} />
            <ProtectedBadge isProtected={product.protected} />
            {product.burning && <BurningBadge isBurning={product.burning} />}
            {hasHighBonus && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                ⭐ {product.bonusPoints} نقطة
              </span>
            )}
            <span className="text-[10px] text-slate-400 ml-auto">
              {getExpiryLabel(product.expiryDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Confirm Archive */}
      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        title={product.archived ? 'إلغاء الأرشفة' : 'أرشفة المنتج'}
        message={product.archived
          ? `هل تريد استعادة "${product.productName}" من الأرشيف؟`
          : `هل تريد أرشفة "${product.productName}"؟ يمكنك استعادته لاحقاً.`
        }
        confirmLabel={product.archived ? 'استعادة' : 'أرشفة'}
        variant="warning"
        loading={actionLoading}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف المنتج نهائياً"
        message={`هل أنت متأكد من حذف "${product.productName}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائياً"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}
