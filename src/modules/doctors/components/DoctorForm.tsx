import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Doctor, DoctorFormData } from '../models/doctor.model';
import { SPECIALTY_OPTIONS } from '../models/doctor.model';
import { Input, Textarea, Select } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from './LocationPicker';

// ============================================================
// Validation Schema
// ============================================================

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  specialty: z.string().default(''),
  area: z.string().default(''),
  phone: z.string().default(''),
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
    specialty: initialData?.specialty ?? '',
    area: initialData?.area ?? '',
    phone: initialData?.phone ?? '',
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
        specialty: values.specialty ?? '',
        area: values.area ?? '',
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
          <Input label="اسم الطبيب" required placeholder="د. أحمد محمد" {...register('name')} error={errors.name?.message} />
        </FullWidth>
        <Controller name="specialty" control={control} render={({ field }) => (
          <Select label="التخصص" options={specialtyOptions} placeholder="اختر التخصص..." {...field} />
        )} />
        <Input label="رقم الهاتف" type="tel" placeholder="01xxxxxxxxx" {...register('phone')} />
        <FullWidth>
          <Input label="المنطقة / العنوان" placeholder="المنطقة / الشارع" {...register('area')} />
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
            placeholder="أوقات التواجد، اهتمامات الطبيب..."
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
