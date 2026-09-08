import { useRef, useState } from 'react';
import { Camera, X, ImagePlus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ProductImageUploadProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  productName?: string;
}

const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ProductImageUpload({ value, onChange, productName }: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    setError(undefined);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`حجم الصورة كبير جداً. الحد الأقصى ${MAX_SIZE_MB} ميجابايت`);
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      setLoading(false);
    };
    reader.onerror = () => {
      setError('فشل قراءة الصورة');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">صورة المنتج</label>

      {value ? (
        /* Image preview */
        <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 group">
          <img src={value} alt={productName || 'صورة المنتج'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white"
              title="تغيير الصورة"
            >
              <Camera size={15} />
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white"
              title="إزالة الصورة"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-28 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1',
            'cursor-pointer transition-colors',
            loading
              ? 'border-slate-300 bg-slate-50'
              : 'border-slate-300 bg-slate-50 hover:border-[#0F52BA] hover:bg-blue-50'
          )}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-[#0F52BA] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ImagePlus size={22} className="text-slate-400" />
              <span className="text-[10px] text-slate-400 text-center px-1">إضافة صورة</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-slate-400">JPG، PNG، WebP — حد أقصى {MAX_SIZE_MB} ميجابايت</p>
    </div>
  );
}
