import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Textarea } from '@/components/ui/FormControls';
import { getAllQuickResponses } from '@/services/storage/quickResponseRepository';
import type { QuickResponse } from '../models/quickResponse.model';
import { cn } from '@/utils/cn';

interface FeedbackInputProps {
  value: string;
  onChange: (value: string) => void;
  saveAsQuickResponse: boolean;
  onSaveToggle: (save: boolean) => void;
}

export function FeedbackInput({ value, onChange, saveAsQuickResponse, onSaveToggle }: FeedbackInputProps) {
  const [feedbackOptions, setFeedbackOptions] = useState<QuickResponse[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    getAllQuickResponses().then(res => {
      setFeedbackOptions(res.filter(r => r.category === 'feedback'));
    });
  }, []);

  const appendSuggestion = (text: string) => {
    const current = value.trim();
    if (current) {
      onChange(`${current} - ${text}`);
    } else {
      onChange(text);
    }
  };

  return (
    <div className="space-y-3">
      {/* Suggestions */}
      {feedbackOptions.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-xs text-[#0F52BA] font-medium hover:underline mb-2"
          >
            {showSuggestions ? 'إخفاء العبارات الجاهزة' : 'إدراج عبارة جاهزة...'}
          </button>
          
          {showSuggestions && (
            <div className="flex flex-wrap gap-2 mb-3">
              {feedbackOptions.slice(0, 10).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => appendSuggestion(opt.text)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="ملاحظات إضافية، رد فعل الطبيب، تفاصيل المناقشة..."
        rows={3}
      />

      {/* Save Toggle */}
      {value.trim().length > 5 && (
        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
          <div className={cn(
            'w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors',
            saveAsQuickResponse ? 'bg-[#0F52BA] text-white' : 'bg-slate-200 text-transparent'
          )}>
            <Star size={10} className={saveAsQuickResponse ? 'fill-current' : ''} />
          </div>
          <span className="text-xs font-medium text-slate-700 select-none">
            حفظ هذه العبارة لاستخدامها مستقبلاً (⭐ Quick Response)
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={saveAsQuickResponse}
            onChange={e => onSaveToggle(e.target.checked)}
          />
        </label>
      )}
    </div>
  );
}
