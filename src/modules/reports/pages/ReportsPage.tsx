import { useState, useEffect } from 'react';
import { Calendar, CalendarDays, FileText } from 'lucide-react';
import { generateTextReport } from '../services/reportGenerator';
import { ReportViewer } from '../components/ReportViewer';
import { Input } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';

export function ReportsPage() {
  const today = new Date().toISOString().split('T')[0];
  
  const [repName, setRepName] = useState(() => localStorage.getItem('mrp_rep_name') || '');
  const [reportType, setReportType] = useState<'daily' | 'range'>('daily');
  const [date, setDate] = useState(today);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  
  const [reportText, setReportText] = useState('');
  const [generating, setGenerating] = useState(false);

  // Save rep name changes
  useEffect(() => {
    localStorage.setItem('mrp_rep_name', repName);
  }, [repName]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const start = reportType === 'daily' ? date : fromDate;
      const end = reportType === 'daily' ? date : toDate;
      
      const text = await generateTextReport(repName, start, end);
      setReportText(text);
    } finally {
      setGenerating(false);
    }
  };

  // Auto-generate on load if name exists
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
          <FileText size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">التقارير الذكية</h2>
          <p className="text-xs text-slate-500">تقارير نصية جاهزة للمشاركة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Controls Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 h-fit shrink-0 overflow-y-auto">
          <div>
            <Input 
              label="اسم المندوب (يظهر في التقرير)" 
              placeholder="مثال: Ali Ahmed" 
              value={repName}
              onChange={e => setRepName(e.target.value)}
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-semibold text-slate-700 mb-2">نوع التقرير</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200 p-1 bg-slate-50 gap-1">
              <button
                onClick={() => setReportType('daily')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${reportType === 'daily' ? 'bg-white shadow-sm font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                يومي
              </button>
              <button
                onClick={() => setReportType('range')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${reportType === 'range' ? 'bg-white shadow-sm font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                فترة محددة
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {reportType === 'daily' ? (
              <Input 
                type="date" 
                label="يوم التقرير" 
                value={date}
                onChange={e => setDate(e.target.value)}
                leftIcon={<Calendar size={14} />}
              />
            ) : (
              <>
                <Input 
                  type="date" 
                  label="من تاريخ" 
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  leftIcon={<CalendarDays size={14} />}
                />
                <Input 
                  type="date" 
                  label="إلى تاريخ" 
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  leftIcon={<CalendarDays size={14} />}
                />
              </>
            )}
          </div>

          <Button onClick={handleGenerate} loading={generating} fullWidth>
            توليد التقرير
          </Button>
        </div>

        {/* Report Viewer */}
        <div className="md:col-span-2 h-full flex flex-col min-h-[400px]">
          <ReportViewer reportText={reportText} />
        </div>
      </div>
    </div>
  );
}
