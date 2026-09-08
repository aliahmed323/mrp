import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Product, ProductFormData, BonusType, DosageForm } from '../models/product.model';
import { DOSAGE_FORM_LABELS, BONUS_TYPE_LABELS } from '../models/product.model';
import { Input, Textarea, Select, Toggle } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { ProductImageUpload } from './ProductImageUpload';

// ============================================================
// Validation Schema
// ============================================================

const schema = z.object({
  productName: z.string().min(2, 'اسم المنتج مطلوب (حرفان على الأقل)'),
  genericName: z.string().min(1, 'المادة الفعالة مطلوبة'),
  brandName: z.string().default(''),
  company: z.string().min(1, 'الشركة مطلوبة'),
  image: z.string().optional(),
  category: z.string().min(1, 'الفئة مطلوبة'),
  strength: z.string().min(1, 'التركيز مطلوب'),
  dosageForm: z.string().min(1, 'الشكل الصيدلاني مطلوب'),
  boxPrice: z.coerce.number().min(0, 'يجب أن يكون غير سالب'),
  stripsPerBox: z.coerce.number().int().min(1, 'يجب أن يكون أكبر من 0'),
  stripPrice: z.coerce.number().min(0, 'يجب أن يكون غير سالب'),
  netPrice: z.coerce.number().min(0, 'يجب أن يكون غير سالب'),
  bonus: z.string().default(''),
  bonusType: z.string().default('percentage'),
  bonusPoints: z.coerce.number().min(0, 'يجب أن يكون غير سالب').default(0),
  expiryDate: z.string().min(1, 'تاريخ الصلاحية مطلوب'),
  protected: z.boolean().default(false),
  burning: z.boolean().default(false),
  competitors: z.string().default(''), // comma separated, parsed on submit
  notes: z.string().default(''),
  active: z.boolean().default(true),
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

// ============================================================
// Form span helpers
// ============================================================
const FullWidth = ({ children }: { children: React.ReactNode }) => (
  <div className="sm:col-span-2">{children}</div>
);

// ============================================================
// Options
// ============================================================

const dosageFormOptions = Object.entries(DOSAGE_FORM_LABELS).map(([v, l]) => ({ value: v, label: l }));
const bonusTypeOptions = Object.entries(BONUS_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
const categoryOptions = [
  'Antibiotics', 'Cardiovascular', 'Diabetes', 'Gastroenterology',
  'Pain & Inflammation', 'Neurology', 'Respiratory', 'Oncology',
  'Dermatology', 'Ophthalmology', 'Urology', 'Vitamins & Supplements', 'Other',
].map(v => ({ value: v, label: v }));

// ============================================================
// Main Form
// ============================================================

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ProductForm({ initialData, onSubmit, onCancel, submitLabel = 'حفظ المنتج' }: ProductFormProps) {
  const [loading, setLoading] = useState(false);

  const defaultValues: FormValues = {
    productName: initialData?.productName ?? '',
    genericName: initialData?.genericName ?? '',
    brandName: initialData?.brandName ?? '',
    company: initialData?.company ?? '',
    image: initialData?.image ?? undefined,
    category: initialData?.category ?? '',
    strength: initialData?.strength ?? '',
    dosageForm: initialData?.dosageForm ?? 'tablet',
    boxPrice: initialData?.boxPrice ?? 0,
    stripsPerBox: initialData?.stripsPerBox ?? 1,
    stripPrice: initialData?.stripPrice ?? 0,
    netPrice: initialData?.netPrice ?? 0,
    bonus: initialData?.bonus ?? '',
    bonusType: initialData?.bonusType ?? 'percentage',
    bonusPoints: initialData?.bonusPoints ?? 0,
    expiryDate: initialData?.expiryDate ?? '',
    protected: initialData?.protected ?? false,
    burning: initialData?.burning ?? false,
    competitors: (initialData?.competitors ?? []).join(', '),
    notes: initialData?.notes ?? '',
    active: initialData?.active ?? true,
  };

  const {
    register, handleSubmit, control, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const data: ProductFormData = {
        ...values,
        bonusType: values.bonusType as BonusType,
        dosageForm: values.dosageForm as DosageForm,
        competitors: values.competitors
          ? values.competitors.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        image: values.image ?? undefined,
      };
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-3">

      {/* 1. Basic Info */}
      <Section title="📋 المعلومات الأساسية">
        <FullWidth>
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ProductImageUpload
                value={field.value}
                onChange={field.onChange}
                productName={defaultValues.productName}
              />
            )}
          />
        </FullWidth>
        <Input label="اسم المنتج" required placeholder="Amoxil 500mg" {...register('productName')} error={errors.productName?.message} />
        <Input label="المادة الفعالة (Generic)" required placeholder="Amoxicillin" {...register('genericName')} error={errors.genericName?.message} />
        <Input label="الاسم التجاري (Brand)" placeholder="Amoxil" {...register('brandName')} />
        <Input label="الشركة" required placeholder="GSK" {...register('company')} error={errors.company?.message} />
        <Controller name="category" control={control} render={({ field }) => (
          <Select label="الفئة" required options={categoryOptions} placeholder="اختر الفئة..." {...field} error={errors.category?.message} />
        )} />
        <Input label="التركيز" required placeholder="500mg" {...register('strength')} error={errors.strength?.message} />
        <Controller name="dosageForm" control={control} render={({ field }) => (
          <Select label="الشكل الصيدلاني" required options={dosageFormOptions} {...field} error={errors.dosageForm?.message} />
        )} />
        <Input label="سعر الباكيت كاملاً" required type="number" step="0.01" min="0" placeholder="0.00" {...register('boxPrice')} error={errors.boxPrice?.message} />
        <Input label="كم شريط في الباكيت" required type="number" min="1" placeholder="مثال: 2" {...register('stripsPerBox')} error={errors.stripsPerBox?.message} />
      </Section>

      {/* 2. Pricing */}
      <Section title="💰 الأسعار">
        <Input label="سعر الشريط" required type="number" step="0.01" min="0" placeholder="0.00" {...register('stripPrice')} error={errors.stripPrice?.message} />
        <Input label="صافي السعر للمجموع (Net Price)" required type="number" step="0.01" min="0" placeholder="0.00" {...register('netPrice')} error={errors.netPrice?.message} />
      </Section>

      {/* 3. Bonus */}
      <Section title="🎁 البونص">
        <Input label="وصف البونص" placeholder="1+1 أو 10% أو ..." {...register('bonus')} />
        <Controller name="bonusType" control={control} render={({ field }) => (
          <Select label="نوع البونص" options={bonusTypeOptions} {...field} />
        )} />
        <Input label="نقاط البونص" type="number" min="0" {...register('bonusPoints')} error={errors.bonusPoints?.message} />
      </Section>

      {/* 4. Status */}
      <Section title="🔖 الحالة">
        <div className="sm:col-span-2 space-y-3 pt-2">
          <Controller name="protected" control={control} render={({ field }) => (
            <Toggle
              checked={field.value}
              onChange={field.onChange}
              label="منتج محمي (Protected)"
              description="المنتج يمتلك حماية تسويقية حصرية"
            />
          )} />
          <Controller name="burning" control={control} render={({ field }) => (
            <Toggle
              checked={field.value}
              onChange={field.onChange}
              label="منتج حرق (Burning)"
              description="المنتج بحاجة لترويج مكثف"
            />
          )} />
          <Controller name="active" control={control} render={({ field }) => (
            <Toggle
              checked={field.value}
              onChange={field.onChange}
              label="نشط (Active)"
              description="المنتج نشط في القائمة"
            />
          )} />
        </div>
      </Section>

      {/* 5. Expiry */}
      <Section title="📅 الصلاحية">
        <FullWidth>
          <Input
            label="تاريخ الصلاحية"
            required
            type="date"
            {...register('expiryDate')}
            error={errors.expiryDate?.message}
          />
        </FullWidth>
      </Section>

      {/* 6. Competitors */}
      <Section title="⚔️ المنافسون" defaultOpen={false}>
        <FullWidth>
          <Input
            label="المنافسون"
            placeholder="Augmentin, Clamoxyl (مفصولة بفاصلة)"
            {...register('competitors')}
            hint="أدخل أسماء المنتجات المنافسة مفصولة بفاصلة"
          />
        </FullWidth>
      </Section>

      {/* 7. Notes */}
      <Section title="📝 ملاحظات" defaultOpen={false}>
        <FullWidth>
          <Textarea
            label="ملاحظات"
            placeholder="أي ملاحظات أو تعليمات خاصة بهذا المنتج..."
            rows={4}
            {...register('notes')}
          />
        </FullWidth>
      </Section>

      {/* Actions */}
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
