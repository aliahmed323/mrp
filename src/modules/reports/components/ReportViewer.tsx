import { useState } from 'react';
import { Copy, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ReportViewerProps {
  reportText: string;
}

export function ReportViewer({ reportText }: ReportViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      toast.success('تم نسخ التقرير');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('فشل نسخ التقرير');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تقرير الزيارات',
          text: reportText,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          toast.error('فشل مشاركة التقرير');
        }
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2 p-3 border-b border-slate-100 bg-slate-50">
        <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          {copied ? 'تم النسخ' : 'نسخ النص'}
        </Button>
        <Button size="sm" onClick={handleShare} className="gap-2">
          <Share2 size={14} /> مشاركة
        </Button>
      </div>

      {/* Text Area */}
      <div className="p-4 flex-1 overflow-y-auto">
        {reportText ? (
          <textarea
            readOnly
            value={reportText}
            className="w-full h-full min-h-[300px] bg-transparent resize-none outline-none text-sm text-slate-800 leading-relaxed font-sans"
            dir="rtl"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500 min-h-[300px]">
            لا توجد بيانات لعرض التقرير.
          </div>
        )}
      </div>
    </div>
  );
}
