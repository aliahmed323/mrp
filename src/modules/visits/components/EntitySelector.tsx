import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { VisitType } from '../models/visit.model';
import { useDoctorStore } from '@/modules/doctors/hooks/useDoctorStore';
import { usePharmacyStore } from '@/modules/pharmacies/hooks/usePharmacyStore';
import { useClinicStore } from '@/modules/clinics/hooks/useClinicStore';
import { VISIT_TYPE_LABELS, VISIT_TYPE_ICONS } from '../models/visit.model';

interface EntitySelectorProps {
  value: { type: VisitType; id: string; name: string; doctorId?: string; doctorName?: string } | null;
  onChange: (value: { type: VisitType; id: string; name: string; doctorId?: string; doctorName?: string } | null) => void;
}

export function EntitySelector({ value, onChange }: EntitySelectorProps) {
  const [type, setType] = useState<VisitType>(value?.type ?? 'doctor');
  const [search, setSearch] = useState('');
  
  const { doctors, loadDoctors } = useDoctorStore();
  const { pharmacies, loadPharmacies } = usePharmacyStore();
  const { clinics, loadClinics } = useClinicStore();

  useEffect(() => {
    loadDoctors();
    loadPharmacies();
    loadClinics();
  }, [loadDoctors, loadPharmacies, loadClinics]);

  useEffect(() => {
    if (value) setType(value.type);
  }, [value]);

  // Handle type change
  const handleTypeChange = (newType: VisitType) => {
    setType(newType);
    setSearch('');
    onChange(null); // reset selection
  };

  // Get options based on type and search
  const getOptions = () => {
    const q = search.trim().toLowerCase();
    if (type === 'doctor') {
      return doctors
        .filter(d => !d.archived && (d.name.toLowerCase().includes(q) || (d.specialties && d.specialties.join(' ').toLowerCase().includes(q))))
        .map(d => ({ id: d.id, name: d.name, subtitle: d.specialties?.join('، ') || 'طبيب عام', doctorId: undefined, doctorName: undefined }));
    }
    if (type === 'pharmacy') {
      return pharmacies
        .filter(p => !p.archived && (p.name.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)))
        .map(p => ({ id: p.id, name: p.name, subtitle: p.address, doctorId: p.doctorId, doctorName: p.doctorName }));
    }
    if (type === 'clinic') {
      return clinics
        .filter(c => !c.archived && (c.name.toLowerCase().includes(q) || c.doctorName?.toLowerCase().includes(q)))
        .map(c => ({ id: c.id, name: c.name, subtitle: c.doctorName ? `د. ${c.doctorName}` : '', doctorId: c.doctorId, doctorName: c.doctorName }));
    }
    return [];
  };

  const options = getOptions();

  return (
    <div className="space-y-4">
      {/* 1. Type Selection */}
      <div className="grid grid-cols-2 gap-2">
        {(['doctor', 'pharmacy'] as VisitType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border transition-all',
              type === t
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            )}
          >
            <span className="text-xl mb-1">{VISIT_TYPE_ICONS[t]}</span>
            <span className="text-xs font-semibold">{VISIT_TYPE_LABELS[t]}</span>
          </button>
        ))}
      </div>

      {/* 2. Entity Selection (Search + List) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Selected State */}
        {value ? (
          <div className="p-3 flex items-center justify-between bg-blue-50">
            <div>
              <div className="font-semibold text-sm text-slate-900">{value.name}</div>
              <div className="text-[11px] text-slate-500">{VISIT_TYPE_LABELS[type]}</div>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-blue-600 font-medium hover:underline px-2 py-1"
            >
              تغيير
            </button>
          </div>
        ) : (
          /* Search State */
          <>
            <div className="flex items-center gap-2 px-3 border-b border-slate-100 h-10">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={`ابحث عن ${VISIT_TYPE_LABELS[type]}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </div>
            <div className="p-1 space-y-1">
              {options.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">لا توجد نتائج</div>
              ) : (
                options.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ type, id: opt.id, name: opt.name, doctorId: opt.doctorId, doctorName: opt.doctorName })}
                    className="w-full flex flex-col items-start px-3 py-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 text-right transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-900">{opt.name}</span>
                    {opt.subtitle && <span className="text-[11px] text-slate-500 mt-0.5">{opt.subtitle}</span>}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
