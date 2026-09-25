import { Copy, Share2, CheckCircle2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ReportViewerProps {
  reportText: string;
}

export function ReportViewer({ reportText }: ReportViewerProps) {
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState('');

  const displayText = editMode ? editedText : reportText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
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
          text: displayText,
        });
      } else {
        const url = `https://wa.me/?text=${encodeURIComponent(displayText)}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('فشل المشاركة');
      }
    }
  };

  const handleEditToggle = () => {
    if (!editMode) {
      setEditedText(reportText);
    }
    setEditMode(m => !m);
  };

  if (!reportText) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center h-full flex flex-col justify-center">
        <p className="text-slate-400 text-base" dir="rtl">حدد المعايير واضغط "تحديث التقرير" لإنشاء التقرير</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50 shrink-0">
        <span className="text-sm font-semibold text-slate-700 px-2">التقرير المُنشأ</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditToggle}
            className={editMode ? 'text-amber-600 bg-amber-50' : 'text-slate-600'}
          >
            <Pencil size={15} />
            <span className="hidden sm:inline">{editMode ? 'إنهاء التعديل' : 'تعديل'}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-slate-600">
            {copied ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Copy size={15} />}
            <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ'}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="text-blue-600 hover:bg-blue-50">
            <Share2 size={15} />
            <span className="hidden sm:inline">مشاركة</span>
          </Button>
        </div>
      </div>

      {/* Report Content — Large, RTL, Editable */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 min-h-0">
        {editMode ? (
          <textarea
            className="w-full h-full min-h-[400px] p-4 text-sm sm:text-base leading-relaxed bg-white rounded-xl border border-amber-200 outline-none resize-none text-slate-800"
            style={{
              direction: 'rtl',
              textAlign: 'right',
              fontFamily: 'system-ui, -apple-system, Tahoma, sans-serif',
              lineHeight: '1.9',
            }}
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
          />
        ) : (
          <pre
            className="text-sm sm:text-base leading-relaxed text-slate-800 whitespace-pre-wrap bg-white rounded-xl border border-slate-100 p-5 shadow-sm min-h-[400px]"
            style={{
              direction: 'rtl',
              textAlign: 'right',
              fontFamily: 'system-ui, -apple-system, Tahoma, sans-serif',
              lineHeight: '1.9',
              unicodeBidi: 'embed',
            }}
          >
            {reportText}
          </pre>
        )}
      </div>
    </div>
  );
}
