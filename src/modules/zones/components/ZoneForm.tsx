import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import type { Zone, ZoneFormData } from '../models/zone.model';
import { Input, Textarea } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'اسم المنطقة مطلوب'),
  description: z.string().default(''),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface ZoneFormProps {
  initialData?: Partial<Zone>;
  onSubmit: (data: ZoneFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ZoneForm({ initialData, onSubmit, onCancel, submitLabel = 'حفظ' }: ZoneFormProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      active: initialData?.active ?? true,
    },
  });

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await onSubmit({
        name: values.name,
        description: values.description ?? '',
        active: values.active,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
      <Input
        label="اسم المنطقة"
        required
        placeholder="مثال: تكريت، كركوك، سامراء"
        {...register('name')}
        error={errors.name?.message}
      />
      <Textarea
        label="وصف"
        placeholder="وصف إضافي للمنطقة..."
        rows={3}
        {...register('description')}
      />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} fullWidth>إلغاء</Button>
        <Button type="submit" loading={loading} fullWidth>{submitLabel}</Button>
      </div>
    </form>
  );
}
