import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { Pharmacy, PharmacyFormData } from '../models/pharmacy.model';
import { PHARMACY_OWNERSHIP_LABELS } from '../models/pharmacy.model';
import { Input, Textarea, Select } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/modules/doctors/components/LocationPicker';
import { useDoctorStore } from '@/modules/doctors/hooks/useDoctorStore';

// ============================================================
// Validation Schema
// ============================================================

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  ownership: z.enum(['independent', 'doctor-affiliated']),
  doctorId: z.string().optional(),
  address: z.string().default(''),
  phone: z.string().default(''),
  notes: z.string().default(''),
  active: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.ownership === 'doctor-affiliated' && !data.doctorId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'يجب اختيار الطبيب',
      path: ['doctorId'],
    });
  }
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

interface PharmacyFormProps {
  initialData?: Partial<Pharmacy>;
  onSubmit: (data: PharmacyFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function PharmacyForm({ initialData, onSubmit, onCancel, submitLabel = 'حفظ' }: PharmacyFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationValue, setLocationValue] = useState<{ latitude: number; longitude: number } | undefined>(
    initialData?.location ?? undefined
  );

  const { doctors, loadDoctors } = useDoctorStore();

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  const defaultValues: FormValues = {
    name: initialData?.name ?? '',
    ownership: initialData?.ownership ?? 'independent',
    doctorId: initialData?.doctorId ?? '',
    address: initialData?.address ?? '',
    phone: initialData?.phone ?? '',
    notes: initialData?.notes ?? '',
    active: initialData?.active ?? true,
  };

  const {
    register, handleSubmit, control, watch, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const ownership = watch('ownership');

  const doctorOptions = doctors
    .filter(d => !d.archived)
    .map(d => ({ value: d.id, label: d.name }));

  const ownershipOptions = Object.entries(PHARMACY_OWNERSHIP_LABELS).map(([v, l]) => ({ value: v, label: l }));

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const selectedDoc = doctors.find(d => d.id === values.doctorId);
      const data: PharmacyFormData = {
        name: values.name,
        ownership: values.ownership,
        doctorId: values.ownership === 'doctor-affiliated' ? values.doctorId : undefined,
        doctorName: values.ownership === 'doctor-affiliated' ? selectedDoc?.name : undefined,
        address: values.address ?? '',
        phone: values.phone ?? '',
        notes: values.notes ?? '',
        location: locationValue,
        active: values.active,
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
          <Input label="اسم الصيدلية" required placeholder="صيدلية النور" {...register('name')} error={errors.name?.message} />
        </FullWidth>
        <Controller name="ownership" control={control} render={({ field }) => (
          <Select label="تبعية الصيدلية" required options={ownershipOptions} {...field} error={errors.ownership?.message} />
        )} />
        
        {ownership === 'doctor-affiliated' && (
          <div className="flex flex-col gap-1">
            <Controller name="doctorId" control={control} render={({ field }) => (
              <Select label="الطبيب المرتبط" required options={doctorOptions} placeholder="اختر الطبيب..." {...field} error={errors.doctorId?.message} />
            )} />
            <button
              type="button"
              onClick={() => navigate('/doctors/new')}
              className="text-[11px] text-[#0F52BA] font-medium flex items-center gap-1 mt-1 hover:underline w-fit"
            >
              <Plus size={12} /> طبيب غير موجود؟ إضافة طبيب جديد
            </button>
          </div>
        )}

        <Input label="رقم الهاتف" type="tel" placeholder="01xxxxxxxxx" {...register('phone')} />
        <FullWidth>
          <Input label="العنوان" placeholder="المنطقة / الشارع / المبنى" {...register('address')} />
        </FullWidth>
      </Section>

      {/* 2. Location */}
      <Section title="📍 الموقع الجغرافي (اختياري)">
        <FullWidth>
          <LocationPicker
            value={locationValue}
            onChange={setLocationValue}
          />
        </FullWidth>
      </Section>

      {/* 3. Notes */}
      <Section title="📝 ملاحظات" defaultOpen={false}>
        <FullWidth>
          <Textarea
            label="ملاحظات"
            placeholder="أوقات الدوام، ملاحظات عن الصيدلي، المنتجات المتوفرة..."
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
