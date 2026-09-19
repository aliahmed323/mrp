import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Order, OrderFormData } from '../models/order.model';
import { ORDER_STATUS_LABELS } from '../models/order.model';
import { Input, Textarea, Select } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { usePharmacyStore } from '@/modules/pharmacies/hooks/usePharmacyStore';
import { db } from '@/services/storage/db';
import type { Product } from '@/modules/products/models/product.model';

// ============================================================
// Validation Schema
// ============================================================

const schema = z.object({
  pharmacyId: z.string().min(1, 'يجب اختيار الصيدلية'),
  productId: z.string().min(1, 'يجب اختيار المنتج'),
  quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
  bonus: z.string().default(''),
  netPrice: z.coerce.number().min(0, 'السعر لا يمكن أن يكون سالباً'),
  status: z.enum(['pending', 'confirmed', 'delivered', 'cancelled']),
  orderDate: z.string().min(1, 'تاريخ الطلب مطلوب'),
  expectedDate: z.string().optional(),
  followUpDate: z.string().optional(),
  notes: z.string().default(''),
});

type FormValues = z.infer<typeof schema>;

// ============================================================
// Section Component
// ============================================================

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50">
          {children}
        </div>
      )}
    </div>
  );
}

const FullWidth = ({ children }: { children: React.ReactNode }) => (
  <div className="sm:col-span-2">{children}</div>
);

// ============================================================
// Main Form
// ============================================================

interface OrderFormProps {
  initialData?: Partial<Order>;
  onSubmit: (data: OrderFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function OrderForm({ initialData, onSubmit, onCancel, submitLabel = 'حفظ' }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const { pharmacies, loadPharmacies } = usePharmacyStore();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadPharmacies();
    db.products.filter(p => p.active && !p.archived).toArray().then(setProducts);
  }, [loadPharmacies]);

  const defaultValues: FormValues = {
    pharmacyId: initialData?.pharmacyId ?? '',
    productId: initialData?.productId ?? '',
    quantity: initialData?.quantity ?? 1,
    bonus: initialData?.bonus ?? '',
    netPrice: initialData?.netPrice ?? 0,
    status: initialData?.status ?? 'pending',
    orderDate: initialData?.orderDate ?? new Date().toISOString().split('T')[0],
    expectedDate: initialData?.expectedDate ?? '',
    followUpDate: initialData?.followUpDate ?? '',
    notes: initialData?.notes ?? '',
  };

  const {
    register, handleSubmit, control, watch, setValue, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const selectedProductId = watch('productId');
  const quantity = watch('quantity');

  // Auto-calculate net price when product or quantity changes
  useEffect(() => {
    if (selectedProductId && quantity > 0) {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod && !initialData?.id) { // Only auto-calc for new orders
        setValue('netPrice', prod.netPrice * quantity);
      }
    }
  }, [selectedProductId, quantity, products, setValue, initialData]);

  const pharmacyOptions = pharmacies.map(p => ({ value: p.id, label: p.name }));
  const productOptions = products.map(p => ({ value: p.id, label: p.productName }));
  const statusOptions = Object.entries(ORDER_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }));

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const selectedPharmacy = pharmacies.find(p => p.id === values.pharmacyId);
      const selectedProduct = products.find(p => p.id === values.productId);

      const data: OrderFormData = {
        pharmacyId: values.pharmacyId,
        pharmacyName: selectedPharmacy?.name ?? '',
        doctorId: selectedPharmacy?.doctorId, // Inherit doctor from pharmacy
        doctorName: selectedPharmacy?.doctorName,
        productId: values.productId,
        productName: selectedProduct?.productName ?? '',
        quantity: values.quantity,
        bonus: values.bonus,
        netPrice: values.netPrice,
        status: values.status,
        orderDate: values.orderDate,
        expectedDate: values.expectedDate || undefined,
        followUpDate: values.followUpDate || undefined,
        notes: values.notes,
      };
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-3">
      <Section title="🛒 بيانات الطلب">
        <FullWidth>
          <Controller name="pharmacyId" control={control} render={({ field }) => (
            <Select label="الصيدلية" required options={pharmacyOptions} placeholder="اختر الصيدلية..." {...field} error={errors.pharmacyId?.message} />
          )} />
        </FullWidth>
        
        <FullWidth>
          <Controller name="productId" control={control} render={({ field }) => (
            <Select label="المنتج" required options={productOptions} placeholder="اختر المنتج..." {...field} error={errors.productId?.message} />
          )} />
        </FullWidth>

        <Input label="الكمية" type="number" required {...register('quantity')} error={errors.quantity?.message} />
        <Input label="البونص (اختياري)" placeholder="مثال: 10+2" {...register('bonus')} />
        <Input label="السعر الإجمالي (الصافي)" type="number" step="0.01" required {...register('netPrice')} error={errors.netPrice?.message} />
        
        <Controller name="status" control={control} render={({ field }) => (
          <Select label="حالة الطلب" required options={statusOptions} {...field} error={errors.status?.message} />
        )} />
      </Section>

      <Section title="📅 التواريخ والمتابعة">
        <Input label="تاريخ الطلب" type="date" required {...register('orderDate')} error={errors.orderDate?.message} />
        <Input label="تاريخ التسليم المتوقع" type="date" {...register('expectedDate')} />
        <FullWidth>
          <Input label="تاريخ المتابعة (Follow-up)" type="date" {...register('followUpDate')} />
        </FullWidth>
      </Section>

      <Section title="📝 ملاحظات" defaultOpen={false}>
        <FullWidth>
          <Textarea label="ملاحظات" placeholder="ملاحظات إضافية حول الطلب أو التسليم..." rows={3} {...register('notes')} />
        </FullWidth>
      </Section>

      <div className="flex gap-3 pt-2 sticky bottom-0 bg-[#F8FAFC] pb-2">
        <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
          إلغاء
        </Button>
        <Button type="submit" loading={loading} fullWidth>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
