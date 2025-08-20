'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/layout/navigation';
import Footer from '@/components/layout/footer';

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/forgot-password');
  const showMainLayout = !isDashboard && !isAuthPage;

  return (
    <div className="min-h-screen antialiased relative flex flex-col">
      {/* Space grid background - always visible */}
      <div className="fixed inset-0 space-grid pointer-events-none opacity-20" />
      
      {/* Only show main navigation and footer on non-dashboard and non-auth pages */}
      {showMainLayout && <Navigation />}
      
      <main className={showMainLayout ? "flex-1 pt-24" : "flex-1"}>
        {children}
      </main>
      
      {showMainLayout && <Footer />}
    </div>
  );
}
