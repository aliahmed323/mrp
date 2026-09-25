import { Settings, Info, HardDrive, Database, Shield, Moon } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/utils/cn';

export function SettingsPage() {
  const { isDark, setIsDark } = useDarkMode();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">الإعدادات</h2>
          <p className="text-sm text-slate-500">إدارة تفضيلات التطبيق والنسخ الاحتياطي</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Dark Mode Toggle */}
        <div 
          onClick={() => setIsDark(!isDark)}
          className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
        >
          <div className="flex items-center gap-4">
            <Moon className={cn("transition-colors", isDark ? "text-indigo-500" : "text-slate-400")} size={20} />
            <div>
              <h3 className="font-semibold text-slate-800">الوضع الداكن</h3>
              <p className="text-xs text-slate-500">تفعيل أو تعطيل المظهر الداكن للتطبيق</p>
            </div>
          </div>
          <div className={cn(
            "w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0",
            isDark ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
          )}>
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </div>
        </div>

        <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100">
          <HardDrive className="text-slate-400" size={20} />
          <div>
            <h3 className="font-semibold text-slate-800">النسخ الاحتياطي (قريباً)</h3>
            <p className="text-xs text-slate-500">حفظ نسخة من بياناتك محلياً أو سحابياً</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100">
          <Database className="text-slate-400" size={20} />
          <div>
            <h3 className="font-semibold text-slate-800">إدارة البيانات (قريباً)</h3>
            <p className="text-xs text-slate-500">استيراد وتصدير قاعدة البيانات</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
          <Shield className="text-slate-400" size={20} />
          <div>
            <h3 className="font-semibold text-slate-800">الخصوصية والأمان (قريباً)</h3>
            <p className="text-xs text-slate-500">حماية التطبيق برمز مرور</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mt-8 space-y-2 text-slate-400">
        <Info size={24} />
        <div className="text-center">
          <p className="font-bold text-slate-600">MedRep 360</p>
          <p className="text-sm">المساعد الذكي للمندوب</p>
          <div className="mt-2 inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold font-mono border border-blue-100">
            Version 3.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
