import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav, SideNav } from './Navigation';

// ============================================================
// AppShell – the persistent layout wrapper
// The <Outlet /> renders the current route's page component.
// Header and Navigation persist across all routes.
// ============================================================

export function AppShell() {
  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <SideNav />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-4 pb-24 sm:pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
