import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Pill, Stethoscope, 
  PlusCircle, FileText, ShoppingBag, Settings,
  MoreHorizontal, CalendarDays, Navigation as NavIcon, Building2, MapPin
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ============================================================
// Navigation Config
// ============================================================

const MAIN_NAV_ITEMS = [
  { path: '/', label: 'الرئيسية', icon: LayoutDashboard },
  { path: '/quick-entry', label: 'إضافة سريعة', icon: PlusCircle, isAction: true },
  { path: '/planning', label: 'التخطيط', icon: NavIcon },
  { path: '/visits', label: 'الزيارات', icon: CalendarDays },
  { path: '/reports', label: 'التقارير', icon: FileText },
];

const MORE_NAV_ITEMS = [
  { path: '/doctors', label: 'الأطباء', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50' },
  { path: '/pharmacies', label: 'الصيدليات', icon: Pill, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { path: '/products', label: 'المنتجات', icon: Package, color: 'text-rose-600', bg: 'bg-rose-50' },
  { path: '/compounds', label: 'المجمعات', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
  { path: '/zones', label: 'المناطق', icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { path: '/orders', label: 'الطلبيات', icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
];

// Fallback for missing icon in import
function Package(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16.5 9.4 7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}

// ============================================================
// Mobile Bottom Navigation
// ============================================================

export function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();

  // Close more menu on route change
  useEffect(() => setShowMore(false), [location.pathname]);

  const isMoreActive = MORE_NAV_ITEMS.some(item => 
    location.pathname.startsWith(item.path) && item.path !== '/'
  );

  return (
    <>
      {/* Overlay for More Menu */}
      {showMore && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu Sheet */}
      <div className={cn(
        "fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 transition-all duration-300 md:hidden",
        showMore ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      )}>
        <div className="grid grid-cols-3 gap-4">
          {MORE_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setShowMore(false)}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-2 p-2 rounded-xl transition-colors",
                isActive ? "bg-slate-50" : "hover:bg-slate-50"
              )}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.bg, item.color)}>
                <item.icon size={24} />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">{item.label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            onClick={() => setShowMore(false)}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-2 p-2 rounded-xl transition-colors",
              isActive ? "bg-slate-50" : "hover:bg-slate-50"
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Settings size={24} />
            </div>
            <span className="text-xs font-medium text-slate-700 text-center">الإعدادات</span>
          </NavLink>
        </div>
      </div>

      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            
            if (item.isAction) {
              return (
                <NavLink key={item.path} to={item.path} className="relative -top-5 flex flex-col items-center gap-1">
                  <div className="w-14 h-14 bg-[#0F52BA] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-white border-2 border-transparent hover:border-blue-300 transition-all active:scale-95">
                    <Icon size={28} />
                  </div>
                  <span className="text-[10px] font-bold text-[#0F52BA]">{item.label}</span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                  isActive ? "text-[#0F52BA]" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon size={22} className={cn("transition-transform duration-200")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
              (isMoreActive || showMore) ? "text-[#0F52BA]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <MoreHorizontal size={22} className={cn("transition-transform duration-200", showMore && "rotate-90")} />
            <span className="text-[10px] font-medium">المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
}

// ============================================================
// Desktop Side Navigation
// ============================================================

export function SideNav() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-200 h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-black bg-gradient-to-r from-[#0F52BA] to-blue-500 bg-clip-text text-transparent">
          MedRep 360
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">المساعد الذكي للمندوب</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
        
        {/* Quick Action */}
        <div className="px-3">
          <NavLink
            to="/quick-entry"
            className="flex items-center justify-center gap-2 w-full bg-[#0F52BA] hover:bg-blue-700 text-white py-3 rounded-xl shadow-sm transition-all hover:shadow active:scale-95 font-medium"
          >
            <PlusCircle size={20} />
            إضافة سريعة
          </NavLink>
        </div>

        {/* Main Section */}
        <div>
          <p className="px-4 text-xs font-bold text-slate-400 mb-3 tracking-wider">القائمة الرئيسية</p>
          <div className="space-y-1">
            <NavLink to="/" className={navLinkClass}>
              <LayoutDashboard size={20} /> الرئيسية
            </NavLink>
            <NavLink to="/planning" className={navLinkClass}>
              <NavIcon size={20} /> التخطيط والمتابعة
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              <Package size={20} /> المنتجات
            </NavLink>
          </div>
        </div>

        {/* Database Section */}
        <div>
          <p className="px-4 text-xs font-bold text-slate-400 mb-3 tracking-wider">قاعدة البيانات</p>
          <div className="space-y-1">
            <NavLink to="/doctors" className={navLinkClass}>
              <Stethoscope size={20} /> الأطباء
            </NavLink>
            <NavLink to="/pharmacies" className={navLinkClass}>
              <Pill size={20} /> الصيدليات
            </NavLink>
            <NavLink to="/zones" className={navLinkClass}>
              <MapPin size={20} /> المناطق
            </NavLink>
            <NavLink to="/compounds" className={navLinkClass}>
              <Building2 size={20} /> المجمعات
            </NavLink>
          </div>
        </div>

        {/* Operations Section */}
        <div>
          <p className="px-4 text-xs font-bold text-slate-400 mb-3 tracking-wider">العمليات</p>
          <div className="space-y-1">
            <NavLink to="/visits" className={navLinkClass}>
              <CalendarDays size={20} /> سجل الزيارات
            </NavLink>
            <NavLink to="/orders" className={navLinkClass}>
              <ShoppingBag size={20} /> الطلبيات
            </NavLink>
            <NavLink to="/reports" className={navLinkClass}>
              <FileText size={20} /> التقارير الذكية
            </NavLink>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <NavLink to="/settings" className={navLinkClass}>
          <Settings size={20} /> الإعدادات
        </NavLink>
      </div>
    </aside>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) => cn(
  "flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors",
  isActive 
    ? "bg-blue-50 text-[#0F52BA]" 
    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
);
