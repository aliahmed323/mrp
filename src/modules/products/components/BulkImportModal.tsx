import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/FormControls';
import { useProductStore } from '../hooks/useProductStore';
import type { ProductFormData } from '../models/product.model';

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function BulkImportModal({ open, onClose }: BulkImportModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { bulkAddProducts } = useProductStore();

  const handleImport = async () => {
    setError('');
    if (!jsonText.trim()) {
      setError('الرجاء لصق كود المنتجات أولاً');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('الكود لا يحتوي على قائمة (مصفوفة) صحيحة');
      }

      setLoading(true);
      await bulkAddProducts(parsed as ProductFormData[]);
      setJsonText('');
      onClose();
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError('الكود غير صالح (Syntax Error). تأكد من صحة الـ JSON.');
      } else {
        setError(e instanceof Error ? e.message : 'حدث خطأ أثناء الإضافة');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg" title="استيراد المنتجات بالجملة">
      <div className="p-4 space-y-4">
        <p className="text-sm text-slate-600">
          قم بلصق كود <strong>JSON</strong> المولد بواسطة الذكاء الاصطناعي هنا. ستتم إضافة كافة المنتجات إلى القائمة فوراً.
        </p>
        
        <Textarea
          placeholder="[{...}, {...}]"
          rows={12}
          value={jsonText}
          onChange={e => { setJsonText(e.target.value); setError(''); }}
          error={error}
          className="font-mono text-left"
          dir="ltr"
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button onClick={handleImport} loading={loading}>
            <UploadCloud size={18} className="ml-2" />
            استيراد وإضافة
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
