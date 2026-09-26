import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import type { Doctor, DoctorFormData, DoctorClinic } from '../models/doctor.model';
import { SPECIALTY_OPTIONS, DOCTOR_ATTITUDE_LABELS, type DoctorAttitude } from '../models/doctor.model';
import { Input, Textarea, Select } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from './LocationPicker';
import { useCompoundStore } from '@/modules/compounds/hooks/useCompoundStore';
import { usePharmacyStore } from '@/modules/pharmacies/hooks/usePharmacyStore';
import { useZoneStore } from '@/modules/zones/hooks/useZoneStore';
import { cn } from '@/utils/cn';

// ============================================================
// Validation Schema
// ============================================================

const clinicSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'اسم العيادة مطلوب'),
  address: z.string().default(''),
  phone: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  specialties: z.array(z.string()).default([]),
  area: z.string().default(''),
  phone: z.string().default(''),
  notes: z.string().default(''),
  active: z.boolean().default(true),
  class: z.enum(['A+', 'A', 'B+', 'B', 'C+', 'C']).optional(),
  attitude: z.enum(['excellent', 'good', 'average', 'poor']).default('good'),
  relationshipType: z.enum(['Dealer', 'Dirty Dealer', 'Scientific']).default('Scientific'),
  zoneId: z.string().default(''),
  compoundIds: z.array(z.string()).default([]),
  pharmacyIds: z.array(z.string()).default([]),
  clinics: z.array(clinicSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

// ============================================================
// Section Component
// ============================================================

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

const attitudeOptions = (Object.entries(DOCTOR_ATTITUDE_LABELS) as [DoctorAttitude, string][]).map(
  ([v, l]) => ({ value: v, label: l })
);

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

  // New clinic state
  const [clinics, setClinics] = useState<DoctorClinic[]>(initialData?.clinics ?? []);
  const [newClinic, setNewClinic] = useState({ name: '', address: '', phone: '', isPrimary: false });

  const { compounds, loadCompounds } = useCompoundStore();
  const { pharmacies, loadPharmacies } = usePharmacyStore();
  const { zones, loadZones } = useZoneStore();

  useEffect(() => { loadCompounds(); loadPharmacies(); loadZones(); }, [loadCompounds, loadPharmacies, loadZones]);

  const defaultValues: FormValues = {
    name: initialData?.name ?? '',
    specialties: initialData?.specialties ?? [],
    area: initialData?.area ?? '',
    phone: initialData?.phone ?? '',
    notes: initialData?.notes ?? '',
    active: initialData?.active ?? true,
    class: initialData?.class ?? undefined,
    attitude: (initialData?.attitude as DoctorAttitude) ?? 'good',
    relationshipType: initialData?.relationshipType ?? 'Scientific',
    zoneId: initialData?.zoneId ?? '',
    compoundIds: initialData?.compoundIds ?? [],
    pharmacyIds: initialData?.pharmacyIds ?? [],
    clinics: initialData?.clinics ?? [],
  };

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedSpecialties = watch('specialties');
  const selectedPharmacyIds = watch('pharmacyIds');

  const activePharmacies = pharmacies.filter(p => !p.archived);

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const data: DoctorFormData = {
        name: values.name,
        specialties: values.specialties,
        area: values.area ?? '',
        phone: values.phone ?? '',
        notes: values.notes ?? '',
        location: locationValue,
        active: values.active,
        class: values.class,
        attitude: values.attitude,
        relationshipType: values.relationshipType,
        zoneId: values.zoneId ?? '',
        compoundIds: values.compoundIds,
        pharmacyIds: values.pharmacyIds,
        clinics,
      };
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (s: string) => {
    const current = selectedSpecialties ?? [];
    if (current.includes(s)) {
      setValue('specialties', current.filter(x => x !== s));
    } else {
      setValue('specialties', [...current, s]);
    }
  };

  const selectedCompoundIds = watch('compoundIds');
  const toggleCompound = (c: string) => {
    const current = selectedCompoundIds ?? [];
    if (current.includes(c)) {
      setValue('compoundIds', current.filter(x => x !== c));
    } else {
      setValue('compoundIds', [...current, c]);
    }
  };

  const togglePharmacy = (id: string) => {
    const current = selectedPharmacyIds ?? [];
    if (current.includes(id)) {
      setValue('pharmacyIds', current.filter(x => x !== id));
    } else {
      setValue('pharmacyIds', [...current, id]);
    }
  };

  const addClinic = () => {
    if (!newClinic.name.trim()) return;
    const clinic: DoctorClinic = {
      id: crypto.randomUUID(),
      name: newClinic.name.trim(),
      address: newClinic.address.trim(),
      phone: newClinic.phone.trim(),
      isPrimary: clinics.length === 0 || newClinic.isPrimary,
    };
    setClinics(prev => [...prev, clinic]);
    setNewClinic({ name: '', address: '', phone: '', isPrimary: false });
  };

  const removeClinic = (id: string) => {
    setClinics(prev => {
      const filtered = prev.filter(c => c.id !== id);
      // إذا حُذفت العيادة الأساسية، اجعل الأولى أساسية
      if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
        filtered[0] = { ...filtered[0], isPrimary: true };
      }
      return filtered;
    });
  };

  const setPrimaryClinic = (id: string) => {
    setClinics(prev => prev.map(c => ({ ...c, isPrimary: c.id === id })));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-3">
      {/* 1. Basic Info */}
      <Section title="📋 المعلومات الأساسية">
        <FullWidth>
          <Input label="اسم الطبيب" required placeholder="د. أحمد محمد" {...register('name')} error={errors.name?.message} />
        </FullWidth>
        <Input label="رقم الهاتف" type="tel" placeholder="01xxxxxxxxx" {...register('phone')} />
        <FullWidth>
          <Input label="المنطقة / العنوان" placeholder="المنطقة / الشارع" {...register('area')} />
        </FullWidth>
      </Section>

      {/* 2. Specialties – Multi Select */}
      <Section title="🏥 التخصصات">
        <FullWidth>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              اختر تخصصاً أو أكثر
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map(s => {
                const selected = (selectedSpecialties ?? []).includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {(selectedSpecialties ?? []).length > 0 && (
              <p className="text-xs text-blue-600 font-medium">
                محدد: {(selectedSpecialties ?? []).join(' + ')}
              </p>
            )}
          </div>
        </FullWidth>
      </Section>

      {/* 3. Doctor Rating */}
      <Section title="⭐ تصنيف الطبيب">
        <FullWidth>
          <Controller
            name="class"
            control={control}
            render={({ field }) => (
              <Select
                label="Class (تصنيف الأهمية)"
                options={[
                  { value: '', label: '-- اختر --' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A', label: 'A' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B', label: 'B' },
                  { value: 'C+', label: 'C+' },
                  { value: 'C', label: 'C' },
                ]}
                {...field}
              />
            )}
          />
        </FullWidth>
        <Controller
          name="attitude"
          control={control}
          render={({ field }) => (
            <Select
              label="تقييم تعامل الطبيب"
              options={attitudeOptions}
              {...field}
            />
          )}
        />
        <Controller
          name="relationshipType"
          control={control}
          render={({ field }) => (
            <Select
              label="تصنيف العلاقة (Relationship Type)"
              options={[
                { value: 'Scientific', label: 'Scientific' },
                { value: 'Dealer', label: 'Dealer' },
                { value: 'Dirty Dealer', label: 'Dirty Dealer' }
              ]}
              {...field}
            />
          )}
        />
      </Section>

      {/* 4. Zone */}
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
          <p className="text-[11px] text-slate-400 mt-1">يمكن إضافة مناطق جديدة من قائمة المناطق</p>
        </FullWidth>
      </Section>

      {/* 5. Compounds */}
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

      {/* 5. Clinics */}
      <Section title="🏥 عيادات الطبيب">
        <FullWidth>
          <div className="space-y-3">
            {/* Existing Clinics */}
            {clinics.length > 0 && (
              <div className="space-y-2">
                {clinics.map(clinic => (
                  <div key={clinic.id} className={cn(
                    'flex items-start gap-2 p-3 rounded-xl border',
                    clinic.isPrimary ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50'
                  )}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{clinic.name}</span>
                        {clinic.isPrimary && (
                          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">أساسية</span>
                        )}
                      </div>
                      {clinic.address && <p className="text-xs text-slate-500 mt-0.5">{clinic.address}</p>}
                      {clinic.phone && <p className="text-xs text-slate-500">{clinic.phone}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!clinic.isPrimary && (
                        <button type="button" onClick={() => setPrimaryClinic(clinic.id)} className="text-[10px] text-blue-600 hover:underline px-1">
                          أساسية
                        </button>
                      )}
                      <button type="button" onClick={() => removeClinic(clinic.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Clinic */}
            <div className="border border-dashed border-slate-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600">إضافة عيادة</p>
              <input
                type="text"
                placeholder="اسم العيادة أو وصفها *"
                value={newClinic.name}
                onChange={e => setNewClinic(p => ({ ...p, name: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="العنوان"
                value={newClinic.address}
                onChange={e => setNewClinic(p => ({ ...p, address: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف (اختياري)"
                value={newClinic.phone}
                onChange={e => setNewClinic(p => ({ ...p, phone: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addClinic}
                className="w-full flex items-center justify-center gap-1 text-sm text-blue-600 font-medium border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors"
              >
                <Plus size={15} /> إضافة عيادة
              </button>
            </div>
          </div>
        </FullWidth>
      </Section>

      {/* 6. Linked Pharmacies */}
      {activePharmacies.length > 0 && (
        <Section title="💊 الصيدليات المرتبطة" defaultOpen={false}>
          <FullWidth>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">اختر الصيدليات المرتبطة بهذا الطبيب</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {activePharmacies.map(ph => {
                  const selected = (selectedPharmacyIds ?? []).includes(ph.id);
                  return (
                    <button
                      key={ph.id}
                      type="button"
                      onClick={() => togglePharmacy(ph.id)}
                      className={cn(
                        'w-full flex items-center gap-2 p-2.5 rounded-xl border text-right transition-colors',
                        selected
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <span className="text-lg">💊</span>
                      <span className="text-sm font-medium flex-1">{ph.name}</span>
                      {selected && <X size={14} className="text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </FullWidth>
        </Section>
      )}

      {/* 7. Location */}
      <Section title="📍 الموقع الجغرافي (اختياري)" defaultOpen={false}>
        <FullWidth>
          <LocationPicker value={locationValue} onChange={setLocationValue} />
        </FullWidth>
      </Section>

      {/* 8. Notes */}
      <Section title="📝 ملاحظات" defaultOpen={false}>
        <FullWidth>
          <Textarea label="ملاحظات" placeholder="أوقات التواجد، اهتمامات الطبيب..." rows={4} {...register('notes')} />
        </FullWidth>
      </Section>

      {/* Actions */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-[#F8FAFC] pb-2">
        <Button type="button" variant="ghost" onClick={onCancel} fullWidth>إلغاء</Button>
        <Button type="submit" loading={loading} fullWidth>{submitLabel}</Button>
      </div>
    </form>
  );
}
