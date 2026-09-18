// ============================================================
// Location Service – Modular location/navigation layer
// Provides sharing via native Share Sheet, GPS capture,
// and standard geo URI formatting.
// ============================================================

export interface GeoLocation {
  latitude: number;
  longitude: number;
  label?: string;
  address?: string;
}

// ────────────────────────────────────────────────────────────
// Format helpers
// ────────────────────────────────────────────────────────────

/** Standard RFC 5870 geo URI  →  geo:lat,lng */
export function formatGeoUri(loc: GeoLocation): string {
  return `geo:${loc.latitude},${loc.longitude}`;
}

/** Google Maps URL – works as a universal fallback link */
export function formatGoogleMapsUrl(loc: GeoLocation): string {
  return `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
}

/** Readable text for sharing */
export function formatShareText(loc: GeoLocation): string {
  const parts: string[] = [];
  if (loc.label) parts.push(loc.label);
  if (loc.address) parts.push(loc.address);
  parts.push(`📍 ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`);
  parts.push(formatGoogleMapsUrl(loc));
  return parts.join('\n');
}

/** Short display label  →  "30.0444°N, 31.2357°E" */
export function formatCoordinatesDisplay(loc: GeoLocation): string {
  const latDir = loc.latitude >= 0 ? 'N' : 'S';
  const lngDir = loc.longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(loc.latitude).toFixed(4)}°${latDir}, ${Math.abs(loc.longitude).toFixed(4)}°${lngDir}`;
}

// ────────────────────────────────────────────────────────────
// Capability checks
// ────────────────────────────────────────────────────────────

/** Is the Web Share API available? (mobile browsers, some desktop) */
export function isShareSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/** Is Geolocation API available? */
export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.geolocation;
}

// ────────────────────────────────────────────────────────────
// Share location via native Share Sheet
// Falls back to clipboard copy when Share API is unavailable
// ────────────────────────────────────────────────────────────

export interface ShareResult {
  success: boolean;
  method: 'share' | 'clipboard' | 'none';
  error?: string;
}

export async function shareLocation(loc: GeoLocation): Promise<ShareResult> {
  const text = formatShareText(loc);
  const title = loc.label || 'موقع مشترك';
  const url = formatGoogleMapsUrl(loc);

  // 1) Try native Share API
  if (isShareSupported()) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'share' };
    } catch (err: unknown) {
      // User cancelled – not an error
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { success: false, method: 'share', error: 'cancelled' };
      }
      // Fall through to clipboard
    }
  }

  // 2) Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'none', error: 'لا يمكن مشاركة أو نسخ الموقع' };
  }
}

// ────────────────────────────────────────────────────────────
// Get current GPS position
// ────────────────────────────────────────────────────────────

export interface GetPositionOptions {
  enableHighAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}

export async function getCurrentPosition(
  options: GetPositionOptions = {}
): Promise<GeoLocation> {
  const { enableHighAccuracy = true, timeoutMs = 15_000, maximumAgeMs = 0 } = options;

  if (!isGeolocationSupported()) {
    throw new Error('خدمة تحديد الموقع غير متاحة في هذا المتصفح');
  }

  return new Promise<GeoLocation>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'تم رفض إذن الموقع. يرجى السماح بالوصول للموقع من إعدادات المتصفح.',
          2: 'لا يمكن تحديد الموقع حالياً. تأكد من تشغيل GPS.',
          3: 'انتهت مهلة تحديد الموقع. حاول مرة أخرى.',
        };
        reject(new Error(messages[err.code] || 'خطأ غير معروف في تحديد الموقع'));
      },
      {
        enableHighAccuracy,
        timeout: timeoutMs,
        maximumAge: maximumAgeMs,
      }
    );
  });
}
