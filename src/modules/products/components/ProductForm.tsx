import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { Product, ProductFormData, BonusType, DosageForm, PackagingType } from '../models/product.model';
import { DOSAGE_FORM_LABELS, BONUS_TYPE_LABELS, PACKAGING_TYPE_LABELS } from '../models/product.model';
import { Input, Textarea, Select, Toggle } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { ProductImageUpload } from './ProductImageUpload';

// ============================================================
// Validation Schema
// ============================================================

const activeIngredientSchema = z.object({
  name: z.string().min(1, 'اسم المادة الفعالة مطلوب'),
  concentration: z.string().default(''),
});

const schema = z.object({
  productName: z.string().min(2, 'اسم المنتج مطلوب (حرفان على الأقل)'),
  genericName: z.string().default(''), // Legacy fallback
  activeIngredients: z.array(activeIngredientSchema).min(1, 'يجب إضافة مادة فعالة واحدة على الأقل'),
  brandName: z.string().default(''),
  company: z.string().min(1, 'الشركة مطلوبة'),
  image: z.string().optional(),
  category: z.string().min(1, 'الفئة مطلوبة'),
  strength: z.string().default(''), // Legacy fallback
  dosageForm: z.string().min(1, 'الشكل الصيدلاني مطلوب'),
  packagingType: z.string().default('strips'),
  unitsPerPackage: z.coerce.number().int().min(1, 'يجب أن يكون أكبر من 0').default(1),
  boxPrice: z.coerce.number().min(0, 'يجب أن يكون غير سالب'),
  stripsPerBox: z.coerce.number().int().min(1, 'يجب أن يكون أكبر من 0').default(1), // Legacy fallback
  stripPrice: z.coerce.number().min(0, 'يجب أن يكون غير سالب'),
  netPrice: z.coerce.number().min(0, 'يجب أن يكون غير سالب'),
  bonus: z.string().default(''),
  bonusType: z.string().default('percentage'),
  bonusPoints: z.coerce.number().min(0, 'يجب أن يكون غير سالب').default(0),
  expiryDate: z.string().min(1, 'تاريخ الصلاحية مطلوب'),
  protected: z.boolean().default(false),
  burning: z.boolean().default(false),
  competitors: z.string().default(''),
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

const FullWidth = ({ children }: { children: React.ReactNode }) => (
  <div className="sm:col-span-2">{children}</div>
);

// ============================================================
// Options
// ============================================================

const dosageFormOptions = Object.entries(DOSAGE_FORM_LABELS).map(([v, l]) => ({ value: v, label: l }));
const bonusTypeOptions = Object.entries(BONUS_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
const packagingTypeOptions = Object.entries(PACKAGING_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
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
    activeIngredients: initialData?.activeIngredients ?? [{ name: '', concentration: '' }],
    brandName: initialData?.brandName ?? '',
    company: initialData?.company ?? '',
    image: initialData?.image ?? undefined,
    category: initialData?.category ?? '',
    strength: initialData?.strength ?? '',
    dosageForm: initialData?.dosageForm ?? 'tablet',
    packagingType: (initialData?.packagingType as string) ?? 'strips',
    unitsPerPackage: initialData?.unitsPerPackage ?? initialData?.stripsPerBox ?? 1,
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
    register, handleSubmit, control, formState: { errors }, watch
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'activeIngredients'
  });

  const packagingType = watch('packagingType');
  const isStrip = packagingType === 'strips';

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Sync legacy fields based on new fields
      const genericName = values.activeIngredients.map(a => a.name).join(' + ');
      const strength = values.activeIngredients.map(a => a.concentration).join(' + ');
      const stripsPerBox = isStrip ? values.unitsPerPackage : 1;

      const data: ProductFormData = {
        ...values,
        genericName,
        strength,
        stripsPerBox,
        bonusType: values.bonusType as BonusType,
        dosageForm: values.dosageForm as DosageForm,
        packagingType: values.packagingType as PackagingType,
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
        <Input label="اسم المنتج (التجاري)" required placeholder="Amoxil" {...register('productName')} error={errors.productName?.message} />
        <Input label="الشركة" required placeholder="GSK" {...register('company')} error={errors.company?.message} />
        <Controller name="category" control={control} render={({ field }) => (
          <Select label="الفئة" required options={categoryOptions} placeholder="اختر الفئة..." {...field} error={errors.category?.message} />
        )} />
        <Controller name="dosageForm" control={control} render={({ field }) => (
          <Select label="الشكل الصيدلاني" required options={dosageFormOptions} {...field} error={errors.dosageForm?.message} />
        )} />
      </Section>

      {/* 2. Active Ingredients */}
      <Section title="🧪 المواد الفعالة والتركيز">
        <FullWidth>
          <div className="space-y-3">
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="اسم المادة الفعالة (مثال: Amoxicillin)"
                    {...register(`activeIngredients.${index}.name` as const)}
                    error={errors.activeIngredients?.[index]?.name?.message}
                  />
                  <Input
                    placeholder="التركيز (مثال: 500mg)"
                    {...register(`activeIngredients.${index}.concentration` as const)}
                  />
                </div>
                {ingredientFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="w-10 h-10 flex items-center justify-center shrink-0 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendIngredient({ name: '', concentration: '' })}
              className="text-xs text-[#0F52BA] font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> إضافة مادة فعالة أخرى
            </button>
          </div>
        </FullWidth>
      </Section>

      {/* 3. Packaging & Pricing */}
      <Section title="📦 العبوة والأسعار">
        <Controller name="packagingType" control={control} render={({ field }) => (
          <Select label="نوع العبوة" required options={packagingTypeOptions} {...field} />
        )} />
        <Input 
          label={`عدد ${PACKAGING_TYPE_LABELS[packagingType] || 'الوحدات'} في الباكيت`} 
          required 
          type="number" 
          min="1" 
          {...register('unitsPerPackage')} 
          error={errors.unitsPerPackage?.message} 
        />
        <Input label="سعر الباكيت كاملاً" required type="number" step="0.01" min="0" placeholder="0.00" {...register('boxPrice')} error={errors.boxPrice?.message} />
        <Input label="صافي السعر للوحدة (Net Price)" required type="number" step="0.01" min="0" placeholder="0.00" {...register('netPrice')} error={errors.netPrice?.message} />
        {isStrip && (
          <Input label="سعر الشريط" required type="number" step="0.01" min="0" placeholder="0.00" {...register('stripPrice')} error={errors.stripPrice?.message} />
        )}
      </Section>

      {/* 4. Bonus */}
      <Section title="🎁 البونص">
        <Input label="وصف البونص" placeholder="1+1 أو 10% أو ..." {...register('bonus')} />
        <Controller name="bonusType" control={control} render={({ field }) => (
          <Select label="نوع البونص" options={bonusTypeOptions} {...field} />
        )} />
        <Input label="نقاط البونص" type="number" min="0" {...register('bonusPoints')} error={errors.bonusPoints?.message} />
      </Section>

      {/* 5. Status */}
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

      {/* 6. Expiry */}
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

      {/* 7. Competitors */}
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

      {/* 8. Notes */}
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
