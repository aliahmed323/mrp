import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Doctor, DoctorFormData, DoctorType } from '../models/doctor.model';
import { DOCTOR_TYPE_LABELS, SPECIALTY_OPTIONS } from '../models/doctor.model';
import { Input, Textarea, Select } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from './LocationPicker';

// ============================================================
// Validation Schema
// ============================================================

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  type: z.string().min(1, 'النوع مطلوب'),
  specialty: z.string().default(''),
  phone: z.string().default(''),
  address: z.string().default(''),
  notes: z.string().default(''),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
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

const typeOptions = Object.entries(DOCTOR_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
const specialtyOptions = SPECIALTY_OPTIONS.map(s => ({ value: s, label: s }));

// ============================================================
// Main Form
// ============================================================

interface DoctorFormProps {
  initialData?: Partial<Doctor>;
  onSubmit: (data: DoctorFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function DoctorForm({ initialData, onSubmit, onCancel, submitLabel = 'حفظ' }: DoctorFormProps) {
  const [loading, setLoading] = useState(false);
  const [locationValue, setLocationValue] = useState<{ latitude: number; longitude: number } | undefined>(
    initialData?.location ?? undefined
  );

  const defaultValues: FormValues = {
    name: initialData?.name ?? '',
    type: initialData?.type ?? 'doctor',
    specialty: initialData?.specialty ?? '',
    phone: initialData?.phone ?? '',
    address: initialData?.address ?? '',
    notes: initialData?.notes ?? '',
    active: initialData?.active ?? true,
  };

  const {
    register, handleSubmit, control, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const data: DoctorFormData = {
        name: values.name,
        type: values.type as DoctorType,
        specialty: values.specialty ?? '',
        phone: values.phone ?? '',
        address: values.address ?? '',
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
          <Input label="الاسم" required placeholder="د. أحمد محمد / صيدلية النور" {...register('name')} error={errors.name?.message} />
        </FullWidth>
        <Controller name="type" control={control} render={({ field }) => (
          <Select label="النوع" required options={typeOptions} {...field} error={errors.type?.message} />
        )} />
        <Controller name="specialty" control={control} render={({ field }) => (
          <Select label="التخصص" options={specialtyOptions} placeholder="اختر التخصص..." {...field} />
        )} />
        <Input label="رقم الهاتف" type="tel" placeholder="01xxxxxxxxx" {...register('phone')} />
        <FullWidth>
          <Input label="العنوان" placeholder="المنطقة / الشارع / المبنى" {...register('address')} />
        </FullWidth>
      </Section>

      {/* 2. Location */}
      <Section title="📍 الموقع الجغرافي">
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
            placeholder="أي ملاحظات أو تعليمات خاصة..."
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
