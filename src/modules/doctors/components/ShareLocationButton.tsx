import { useState } from 'react';
import { Share2, Check, Copy, AlertCircle } from 'lucide-react';
import { shareLocation, type GeoLocation, type ShareResult } from '@/services/location/locationService';
import { Button } from '@/components/ui/Button';

// ============================================================
// ShareLocationButton – shares via native Share Sheet
// Falls back to clipboard copy on unsupported browsers
// ============================================================

interface ShareLocationButtonProps {
  location: { latitude: number; longitude: number };
  label?: string;
  address?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function ShareLocationButton({
  location,
  label,
  address,
  size = 'md',
  fullWidth = false,
  className,
}: ShareLocationButtonProps) {
  const [status, setStatus] = useState<'idle' | 'sharing' | 'shared' | 'copied' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleShare = async () => {
    setStatus('sharing');
    setErrorMsg('');

    const geo: GeoLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      label,
      address,
    };

    const result: ShareResult = await shareLocation(geo);

    if (result.success) {
      setStatus(result.method === 'clipboard' ? 'copied' : 'shared');
      // Reset after 2.5s
      setTimeout(() => setStatus('idle'), 2500);
    } else if (result.error === 'cancelled') {
      setStatus('idle');
    } else {
      setErrorMsg(result.error || 'فشل مشاركة الموقع');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const icon = {
    idle: <Share2 size={size === 'sm' ? 14 : 16} />,
    sharing: <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />,
    shared: <Check size={size === 'sm' ? 14 : 16} />,
    copied: <Copy size={size === 'sm' ? 14 : 16} />,
    error: <AlertCircle size={size === 'sm' ? 14 : 16} />,
  }[status];

  const text = {
    idle: 'مشاركة الموقع',
    sharing: 'جارٍ المشاركة...',
    shared: 'تمت المشاركة ✓',
    copied: 'تم نسخ الرابط ✓',
    error: errorMsg || 'فشل',
  }[status];

  const variant = status === 'error' ? 'danger' as const
    : status === 'shared' || status === 'copied' ? 'success' as const
    : 'primary' as const;

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      onClick={handleShare}
      disabled={status === 'sharing'}
    >
      {icon} {text}
    </Button>
  );
}
