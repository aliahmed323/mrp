/** Format number as currency (EGP) */
export function formatCurrency(value: number, decimals = 2): string {
  if (isNaN(value)) return '—';
  return value.toFixed(decimals);
}

/** Format date as readable Arabic-friendly string */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Days until expiry (negative if expired) */
export function daysUntilExpiry(dateStr: string): number {
  if (!dateStr) return Infinity;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  return Math.floor((expiry.getTime() - today.getTime()) / 86400000);
}

/** Get a readable expiry label */
export function getExpiryLabel(dateStr: string): string {
  const days = daysUntilExpiry(dateStr);
  if (days === Infinity) return '—';
  if (days < 0) return `منتهي منذ ${Math.abs(days)} يوم`;
  if (days === 0) return 'ينتهي اليوم!';
  if (days <= 30) return `ينتهي خلال ${days} يوم`;
  if (days <= 90) return `ينتهي خلال ${Math.round(days / 30)} أشهر`;
  return formatDate(dateStr);
}

/** Truncate text with ellipsis */
export function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.substring(0, max) + '…' : text;
}
