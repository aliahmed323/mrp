import { useState } from 'react';
import { MapPin, Loader2, Check, AlertCircle } from 'lucide-react';
import { getCurrentPosition, formatCoordinatesDisplay, type GeoLocation } from '@/services/location/locationService';
import { Button } from '@/components/ui/Button';

// ============================================================
// LocationPicker – capture & display GPS coordinates
// ============================================================

interface LocationPickerProps {
  value?: { latitude: number; longitude: number } | null;
  onChange: (loc: { latitude: number; longitude: number } | undefined) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    setLoading(true);
    setError(null);
    try {
      const pos = await getCurrentPosition({ enableHighAccuracy: true, timeoutMs: 20_000 });
      onChange({ latitude: pos.latitude, longitude: pos.longitude });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحديد الموقع');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setError(null);
  };

  const displayLoc: GeoLocation | null = value ? { latitude: value.latitude, longitude: value.longitude } : null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">📍 الموقع الجغرافي</label>

      {displayLoc ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <Check size={18} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800">تم تحديد الموقع</p>
            <p className="text-xs text-green-600 font-mono mt-0.5" dir="ltr">
              {formatCoordinatesDisplay(displayLoc)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0"
          >
            إزالة
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="md"
          fullWidth
          onClick={handleCapture}
          loading={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جارٍ تحديد الموقع...
            </>
          ) : (
            <>
              <MapPin size={16} />
              تحديد موقعي الحالي
            </>
          )}
        </Button>
      )}

      {error && (
        <div className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {displayLoc && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCapture}
          loading={loading}
        >
          <MapPin size={14} />
          تحديث الموقع
        </Button>
      )}
    </div>
  );
}
