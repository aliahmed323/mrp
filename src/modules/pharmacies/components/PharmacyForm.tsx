import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import type { Pharmacy, PharmacyFormData } from '../models/pharmacy.model';
import { PHARMACY_OWNERSHIP_LABELS } from '../models/pharmacy.model';
import { Input, Textarea, Select } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/modules/doctors/components/LocationPicker';
import { useDoctorStore } from '@/modules/doctors/hooks/useDoctorStore';
import { useCompoundStore } from '@/modules/compounds/hooks/useCompoundStore';
import { useZoneStore } from '@/modules/zones/hooks/useZoneStore';
import { cn } from '@/utils/cn';

// ============================================================
// Validation Schema
// ============================================================

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  ownership: z.enum(['independent', 'doctor-affiliated']),
  doctorIds: z.array(z.string()).default([]),
  address: z.string().default(''),
  phone: z.string().default(''),
  notes: z.string().default(''),
  active: z.boolean().default(true),
  zoneId: z.string().default(''),
  compoundIds: z.array(z.string()).default([]),
  ownerName: z.string().default(''),
  ownerPhone: z.string().default(''),
  orderManagerName: z.string().default(''),
  orderManagerPhone: z.string().default(''),
  residentPharmacistName: z.string().default(''),
  residentPharmacistPhone: z.string().default(''),
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
  const { compounds, loadCompounds } = useCompoundStore();
  const { zones, loadZones } = useZoneStore();

  useEffect(() => { loadDoctors(); loadCompounds(); loadZones(); }, [loadDoctors, loadCompounds, loadZones]);

  const defaultValues: FormValues = {
    name: initialData?.name ?? '',
    ownership: initialData?.ownership ?? 'independent',
    doctorIds: initialData?.doctorIds ?? (initialData?.doctorId ? [initialData.doctorId] : []),
    address: initialData?.address ?? '',
    phone: initialData?.phone ?? '',
    notes: initialData?.notes ?? '',
    active: initialData?.active ?? true,
    zoneId: initialData?.zoneId ?? '',
    compoundIds: initialData?.compoundIds ?? [],
    ownerName: initialData?.ownerName ?? '',
    ownerPhone: initialData?.ownerPhone ?? '',
    orderManagerName: initialData?.orderManagerName ?? '',
    orderManagerPhone: initialData?.orderManagerPhone ?? '',
    residentPharmacistName: initialData?.residentPharmacistName ?? '',
    residentPharmacistPhone: initialData?.residentPharmacistPhone ?? '',
  };

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const ownership = watch('ownership');
  const selectedDoctorIds = watch('doctorIds');
  const selectedCompoundIds = watch('compoundIds');

  const activeDoctors = doctors.filter(d => !d.archived);

  const ownershipOptions = Object.entries(PHARMACY_OWNERSHIP_LABELS).map(([v, l]) => ({ value: v, label: l }));

  const toggleDoctor = (id: string) => {
    const current = selectedDoctorIds ?? [];
    if (current.includes(id)) {
      setValue('doctorIds', current.filter(x => x !== id));
    } else {
      setValue('doctorIds', [...current, id]);
    }
  };

  const toggleCompound = (c: string) => {
    const current = selectedCompoundIds ?? [];
    if (current.includes(c)) {
      setValue('compoundIds', current.filter(x => x !== c));
    } else {
      setValue('compoundIds', [...current, c]);
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const data: PharmacyFormData = {
        name: values.name,
        ownership: values.ownership,
        doctorIds: values.ownership === 'doctor-affiliated' ? values.doctorIds : [],
        // Keep legacy fields for backward compatibility
        doctorId: values.ownership === 'doctor-affiliated' && values.doctorIds.length > 0 ? values.doctorIds[0] : undefined,
        doctorName: values.ownership === 'doctor-affiliated' && values.doctorIds.length > 0 ? activeDoctors.find(d => d.id === values.doctorIds[0])?.name : undefined,
        address: values.address ?? '',
        phone: values.phone ?? '',
        notes: values.notes ?? '',
        location: locationValue,
        active: values.active,
        zoneId: values.zoneId ?? '',
        compoundIds: values.compoundIds,
        ownerName: values.ownerName,
        ownerPhone: values.ownerPhone,
        orderManagerName: values.orderManagerName,
        orderManagerPhone: values.orderManagerPhone,
        residentPharmacistName: values.residentPharmacistName,
        residentPharmacistPhone: values.residentPharmacistPhone,
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

        <Input label="رقم هاتف الصيدلية العام" type="tel" placeholder="01xxxxxxxxx" {...register('phone')} />
        <FullWidth>
          <Input label="العنوان" placeholder="المنطقة / الشارع / المبنى" {...register('address')} />
        </FullWidth>
      </Section>

      {/* 2. Zone */}
      <Section title="🗺️ المنطقة الجغرافية">
        <FullWidth>
          <Controller
            name="zoneId"
            control={control}
            render={({ field }) => (
              <Select
                label="المنطقة"
                options={[
                  { value: '', label: 'بدون منطقة' },
                  ...zones.filter(z => !z.archived).map(z => ({ value: z.id, label: z.name })),
                ]}
                {...field}
              />
            )}
          />
        </FullWidth>
      </Section>

      {/* 3. Compounds */}
      <Section title="🏘️ المجمعات التنظيمية">
        <FullWidth>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">اختر مجمعاً أو أكثر</p>
            <div className="flex flex-wrap gap-2">
              {compounds.filter(c => !c.archived).map(c => {
                const selected = (selectedCompoundIds ?? []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCompound(c.id)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                      selected
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
            {compounds.filter(c => !c.archived).length === 0 && (
              <p className="text-xs text-slate-400">لا توجد مجمعات مسجلة</p>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">يمكن إضافة مجمعات جديدة من قائمة المجمعات</p>
        </FullWidth>
      </Section>

      {/* 3. Associated Doctors */}
      {ownership === 'doctor-affiliated' && (
        <Section title="🩺 الأطباء المرتبطين">
          <FullWidth>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">اختر طبيباً أو أكثر يتعاملون مع هذه الصيدلية</p>
              <div className="max-h-48 overflow-y-auto space-y-1 p-1 border border-slate-200 rounded-xl bg-slate-50">
                {activeDoctors.map(doc => {
                  const selected = (selectedDoctorIds ?? []).includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => toggleDoctor(doc.id)}
                      className={cn(
                        'w-full flex items-center gap-2 p-2.5 rounded-lg border text-right transition-colors',
                        selected
                          ? 'border-blue-300 bg-blue-100 text-blue-800 shadow-sm'
                          : 'border-transparent hover:bg-slate-200 text-slate-700'
                      )}
                    >
                      <span className="text-lg">🩺</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{(doc.specialties || []).join('، ')}</span>
                      </div>
                      {selected && <X size={14} className="text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => navigate('/doctors/new')}
                className="text-[11px] text-[#0F52BA] font-medium flex items-center gap-1 mt-2 hover:underline w-fit"
              >
                <Plus size={12} /> طبيب غير موجود؟ إضافة طبيب جديد
              </button>
            </div>
          </FullWidth>
        </Section>
      )}

      {/* 4. Contact Persons */}
      <Section title="👥 جهات الاتصال في الصيدلية">
        <FullWidth>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold text-slate-700">صاحب الصيدلية (Owner)</h4>
              <Input label="الاسم" placeholder="اسم المالك" {...register('ownerName')} />
              <Input label="رقم الهاتف" type="tel" placeholder="رقم الهاتف" {...register('ownerPhone')} />
            </div>
            <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold text-slate-700">مسؤول الطلبات</h4>
              <Input label="الاسم" placeholder="اسم مسؤول الطلبات" {...register('orderManagerName')} />
              <Input label="رقم الهاتف" type="tel" placeholder="رقم الهاتف" {...register('orderManagerPhone')} />
            </div>
            <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-3 sm:col-span-2">
              <h4 className="text-xs font-bold text-slate-700">الصيدلاني المقيم (Resident)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="الاسم" placeholder="اسم الصيدلاني" {...register('residentPharmacistName')} />
                <Input label="رقم الهاتف" type="tel" placeholder="رقم الهاتف" {...register('residentPharmacistPhone')} />
              </div>
            </div>
          </div>
        </FullWidth>
      </Section>

      {/* 5. Location */}
      <Section title="📍 الموقع الجغرافي (اختياري)" defaultOpen={false}>
        <FullWidth>
          <LocationPicker
            value={locationValue}
            onChange={setLocationValue}
          />
        </FullWidth>
      </Section>

      {/* 6. Notes */}
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
