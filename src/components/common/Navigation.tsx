import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Zap, MoreHorizontal, Pill, Building2, ShoppingBag, Activity, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

// ============================================================
// Bottom Navigation (Mobile)
// ============================================================

export function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const mainItems = [
    { to: '/', label: 'الرئيسية', icon: LayoutDashboard, end: true },
    { to: '/quick-entry', label: 'تسجيل سريع', icon: Zap, end: false },
    { to: '/products', label: 'المنتجات', icon: Package, end: false },
    { to: '/doctors', label: 'الأطباء', icon: Users, end: false },
  ];

  const moreItems = [
    { to: '/pharmacies', label: 'الصيدليات', icon: Pill },
    { to: '/clinics', label: 'العيادات', icon: Building2 },
    { to: '/visits', label: 'الزيارات', icon: Activity },
    { to: '/orders', label: 'الطلبات', icon: ShoppingBag },
    { to: '/reports', label: 'التقارير', icon: FileText },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex sm:hidden safe-bottom px-1">
        {mainItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-[#0F52BA]' : 'text-slate-500'
            )}
            onClick={() => setMenuOpen(false)}
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'w-8 h-7 flex items-center justify-center rounded-xl transition-colors',
                  isActive ? 'bg-blue-50' : ''
                )}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className={to === '/quick-entry' ? 'text-orange-500 fill-orange-100' : ''} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* More Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors',
            menuOpen ? 'text-[#0F52BA]' : 'text-slate-500'
          )}
        >
          <span className={cn(
            'w-8 h-7 flex items-center justify-center rounded-xl transition-colors',
            menuOpen ? 'bg-blue-50' : ''
          )}>
            <MoreHorizontal size={20} strokeWidth={menuOpen ? 2.5 : 1.8} />
          </span>
          المزيد
        </button>
      </nav>

      {/* More Menu Overlay */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 sm:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed bottom-16 right-2 left-2 z-30 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 sm:hidden grid grid-cols-3 gap-2 animate-in slide-in-from-bottom-4">
            {moreItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => cn(
                  'flex flex-col items-center justify-center py-3 px-2 rounded-xl text-[11px] font-medium gap-1.5 transition-colors',
                  isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ============================================================
// Side Navigation (Desktop)
// ============================================================

export function SideNav() {
  const navGroups = [
    {
      title: 'القائمة الرئيسية',
      items: [
        { to: '/', label: 'الرئيسية', icon: LayoutDashboard, end: true },
        { to: '/quick-entry', label: 'تسجيل سريع', icon: Zap, end: false, highlight: true },
      ]
    },
    {
      title: 'قاعدة البيانات',
      items: [
        { to: '/doctors', label: 'الأطباء', icon: Users, end: false },
        { to: '/pharmacies', label: 'الصيدليات', icon: Pill, end: false },
        { to: '/clinics', label: 'العيادات', icon: Building2, end: false },
        { to: '/products', label: 'المنتجات', icon: Package, end: false },
      ]
    },
    {
      title: 'العمليات',
      items: [
        { to: '/visits', label: 'سجل الزيارات', icon: Activity, end: false },
        { to: '/orders', label: 'الطلبات', icon: ShoppingBag, end: false },
        { to: '/reports', label: 'التقارير', icon: FileText, end: false },
      ]
    }
  ];

  return (
    <nav className="hidden sm:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200 py-4 gap-6 overflow-y-auto">
      {navGroups.map((group, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <div className="px-5 mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{group.title}</span>
          </div>
          {group.items.map(({ to, label, icon: Icon, end, highlight }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'mx-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-[#0F52BA]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                highlight && !isActive && 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} className={highlight ? 'fill-orange-100' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
