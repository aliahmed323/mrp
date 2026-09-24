import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Compound, CompoundFormData } from '../models/compound.model';
import { Input, Textarea } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'اسم المجمع مطلوب'),
  area: z.string().default(''),
  description: z.string().default(''),
  notes: z.string().default(''),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left">
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

interface CompoundFormProps {
  initialData?: Partial<Compound>;
  onSubmit: (data: CompoundFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function CompoundForm({ initialData, onSubmit, onCancel, submitLabel = 'حفظ' }: CompoundFormProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      area: initialData?.area ?? '',
      description: initialData?.description ?? '',
      notes: initialData?.notes ?? '',
      active: initialData?.active ?? true,
    },
  });

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await onSubmit(values as CompoundFormData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-3">
      <Section title="🏘️ معلومات المجمع">
        <FullWidth>
          <Input label="اسم المجمع" required placeholder="مثال: مجمع النرجس" {...register('name')} error={errors.name?.message} />
        </FullWidth>
        <FullWidth>
          <Input label="المنطقة / الموقع" placeholder="مثال: حي الروضة، الرياض" {...register('area')} />
        </FullWidth>
        <FullWidth>
          <Input label="وصف المجمع" placeholder="وصف مختصر عن المجمع" {...register('description')} />
        </FullWidth>
      </Section>

      <Section title="📝 ملاحظات" defaultOpen={false}>
        <FullWidth>
          <Textarea label="ملاحظات" placeholder="ملاحظات إضافية..." rows={3} {...register('notes')} />
        </FullWidth>
      </Section>

      <div className="flex gap-3 pt-2 sticky bottom-0 bg-[#F8FAFC] pb-2">
        <Button type="button" variant="ghost" onClick={onCancel} fullWidth>إلغاء</Button>
        <Button type="submit" loading={loading} fullWidth>{submitLabel}</Button>
      </div>
    </form>
  );
}
