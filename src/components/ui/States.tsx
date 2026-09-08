import { PackageX, SearchX, FilterX, Loader2 } from 'lucide-react';
import { Button } from './Button';

// ============================================================
// Empty State
// ============================================================

interface EmptyStateProps {
  type?: 'no-products' | 'no-search' | 'no-filter' | 'generic';
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

const configs = {
  'no-products': {
    icon: PackageX,
    title: 'لا توجد منتجات',
    description: 'لم تُضف أي منتجات بعد. ابدأ بإضافة منتجك الأول.',
  },
  'no-search': {
    icon: SearchX,
    title: 'لا توجد نتائج',
    description: 'لم نجد منتجات تطابق بحثك. جرب كلمات مختلفة.',
  },
  'no-filter': {
    icon: FilterX,
    title: 'لا توجد منتجات مطابقة',
    description: 'لا يوجد منتجات تطابق الفلاتر المحددة. جرب تعديل الفلاتر.',
  },
  generic: {
    icon: PackageX,
    title: 'لا توجد عناصر',
    description: 'لا توجد عناصر لعرضها.',
  },
};

export function EmptyState({ type = 'generic', title, description, action }: EmptyStateProps) {
  const cfg = configs[type];
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title || cfg.title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{description || cfg.description}</p>
      {action && (
        <Button className="mt-5" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

// ============================================================
// Loading State
// ============================================================

export function LoadingState({ message = 'جارٍ التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={32} className="text-[#0F52BA] animate-spin" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

// ============================================================
// Stat Card
// ============================================================

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red';
  onClick?: () => void;
}

const colorStyles = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', value: 'text-blue-700' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', value: 'text-green-700' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', value: 'text-orange-700' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', value: 'text-red-700' },
};

export function StatCard({ label, value, icon, color = 'blue', onClick }: StatCardProps) {
  const c = colorStyles[color];
  return (
    <button
      onClick={onClick}
      className={`${c.bg} rounded-xl p-4 text-left flex flex-col gap-2 w-full transition-transform active:scale-95 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.icon}`}>{icon}</div>
      <div>
        <div className={`text-2xl font-bold ${c.value}`}>{value}</div>
        <div className="text-xs text-slate-600 mt-0.5">{label}</div>
      </div>
    </button>
  );
}
