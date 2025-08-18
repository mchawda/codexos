'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  Database, 
  Shield, 
  Store, 
  Settings,
  Home,
  Workflow,
  Brain
} from 'lucide-react';
import DashboardNav from '@/components/dashboard/nav';

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Agents',
    href: '/dashboard/agents',
    icon: Bot,
  },
  {
    title: 'RAG Engine',
    href: '/dashboard/rag',
    icon: Brain,
  },
  {
    title: 'Vault',
    href: '/dashboard/vault',
    icon: Shield,
  },
  {
    title: 'Marketplace',
    href: '/dashboard/marketplace/seller',
    icon: Store,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col fixed left-0 top-16">
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 md:pl-64">
          {children}
        </main>
      </div>
    </div>
  );
}
