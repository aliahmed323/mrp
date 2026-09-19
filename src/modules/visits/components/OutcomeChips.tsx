import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getAllQuickResponses } from '@/services/storage/quickResponseRepository';
import type { QuickResponse } from '../models/quickResponse.model';
import { LoadingState } from '@/components/ui/States';

interface OutcomeChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function OutcomeChips({ value, onChange }: OutcomeChipsProps) {
  const [outcomes, setOutcomes] = useState<QuickResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getAllQuickResponses().then(res => {
      // Filter for 'outcome' category only
      setOutcomes(res.filter(r => r.category === 'outcome'));
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState />;

  const toggleOutcome = (text: string) => {
    if (value.includes(text)) {
      onChange(value.filter(v => v !== text));
    } else {
      onChange([...value, text]);
    }
  };

  const displayedOutcomes = showAll ? outcomes : outcomes.slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {displayedOutcomes.map(outcome => {
          const isSelected = value.includes(outcome.text);
          return (
            <button
              key={outcome.id}
              type="button"
              onClick={() => toggleOutcome(outcome.text)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border',
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
              )}
            >
              {isSelected && <Check size={12} />}
              {outcome.text}
            </button>
          );
        })}
      </div>

      {outcomes.length > 8 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-600 font-medium hover:underline px-1"
        >
          {showAll ? 'عرض أقل' : `عرض ${outcomes.length - 8} خيارات إضافية...`}
        </button>
      )}
    </div>
  );
}
