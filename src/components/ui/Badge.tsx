import { cn } from '@/utils/cn';

type BadgeVariant = 'valid' | 'expiring' | 'expired' | 'protected' | 'burning' | 'high-bonus' | 'neutral' | 'blue' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  valid: 'bg-green-50 text-green-700 border border-green-200',
  expiring: 'bg-orange-50 text-orange-700 border border-orange-200',
  expired: 'bg-red-50 text-red-700 border border-red-200',
  protected: 'bg-blue-50 text-blue-700 border border-blue-200',
  burning: 'bg-red-50 text-red-600 border border-red-200',
  'high-bonus': 'bg-purple-50 text-purple-700 border border-purple-200',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export function Badge({ variant = 'neutral', children, className, icon }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
      variantStyles[variant],
      className
    )}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// ============================================================
// Status Badge – specific to product status display
// ============================================================

import type { ExpiryStatus } from '@/modules/products/models/product.model';
import { EXPIRY_STATUS_LABELS } from '@/modules/products/models/product.model';
import { ShieldCheck, ShieldOff, Flame, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export function ExpiryBadge({ status }: { status: ExpiryStatus }) {
  const configs = {
    valid: { variant: 'valid' as BadgeVariant, icon: <CheckCircle size={10} /> },
    expiring_soon: { variant: 'expiring' as BadgeVariant, icon: <AlertTriangle size={10} /> },
    expired: { variant: 'expired' as BadgeVariant, icon: <XCircle size={10} /> },
  };
  const { variant, icon } = configs[status];
  return <Badge variant={variant} icon={icon}>{EXPIRY_STATUS_LABELS[status]}</Badge>;
}

export function ProtectedBadge({ isProtected }: { isProtected: boolean }) {
  return isProtected
    ? <Badge variant="protected" icon={<ShieldCheck size={10} />}>محمي</Badge>
    : <Badge variant="neutral" icon={<ShieldOff size={10} />}>غير محمي</Badge>;
}

export function BurningBadge({ isBurning }: { isBurning: boolean }) {
  return isBurning
    ? <Badge variant="burning" icon={<Flame size={10} />}>حرق</Badge>
    : null;
}
