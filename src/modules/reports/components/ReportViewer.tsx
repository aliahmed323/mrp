import { Copy, Share2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
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
    } catch {
      toast.error('فشل النسخ');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'تقرير الزيارات',
          text: reportText,
        });
      } else {
        // Fallback to WhatsApp
        const url = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('فشل المشاركة');
      }
    }
  };

  if (!reportText) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center h-full flex flex-col justify-center">
        <p className="text-slate-400">حدد المعايير واضغط "تحديث التقرير" لإنشاء التقرير</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50 shrink-0">
        <span className="text-sm font-semibold text-slate-700 px-2">التقرير المولد</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-slate-600">
            {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
            <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ'}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="text-blue-600 hover:bg-blue-50">
            <Share2 size={16} />
            <span className="hidden sm:inline">مشاركة</span>
          </Button>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50">
        <pre className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap font-sans text-left" dir="ltr" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {reportText}
        </pre>
      </div>
    </div>
  );
}
