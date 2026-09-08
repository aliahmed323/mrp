import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package } from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'المنتجات', icon: Package, end: false },
];

// ============================================================
// Bottom Navigation (Mobile)
// ============================================================

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex sm:hidden safe-bottom">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => cn(
            'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors',
            isActive ? 'text-[#0F52BA]' : 'text-slate-500'
          )}
        >
          {({ isActive }) => (
            <>
              <span className={cn(
                'w-8 h-7 flex items-center justify-center rounded-xl transition-colors',
                isActive ? 'bg-blue-50' : ''
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

// ============================================================
// Side Navigation (Desktop)
// ============================================================

export function SideNav() {
  return (
    <nav className="hidden sm:flex flex-col w-56 shrink-0 bg-white border-r border-slate-200 py-4 gap-1">
      <div className="px-4 mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">القائمة</span>
      </div>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => cn(
            'mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            isActive
              ? 'bg-blue-50 text-[#0F52BA]'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          {({ isActive }) => (
            <>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
