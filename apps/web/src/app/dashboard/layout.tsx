// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
'use client';

import type { Metadata } from 'next';
import { ReactNode, useState } from 'react';
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
  Brain,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DashboardNav from '@/components/dashboard/nav';
import { Button } from '@/components/ui/button';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <>
      <DashboardNav />
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className={`hidden md:flex ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/50 bg-background/95 transition-all duration-300`}>
          {/* Collapse Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:shadow-lg"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                    title={sidebarCollapsed ? item.title : undefined}
                  >
                    <Icon className={`${sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <main className={`flex-1 ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} bg-background transition-all duration-300`}>
          {children}
        </main>
      </div>
    </>
  );
}
