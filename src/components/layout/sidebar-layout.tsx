'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import {
  Terminal,
  History,
  Key,
  Plus,
  LogOut,
  ChevronDown,
  Layers,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

function SidebarContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { open } = useSidebar();

  const isInspector = pathname === '/inspector';
  const isHistory = pathname === '/history';
  const isSettings = pathname === '/settings';

  const navSections = [
    {
      group: 'PROJECT',
      items: [
        { label: 'Inspector Workspace', href: '/inspector', icon: Terminal, active: isInspector },
        { label: 'Analysis History', href: '/history', icon: History, active: isHistory },
      ],
    },
    {
      group: 'SETTINGS & SECURITY',
      items: [
        { label: 'BYOK API Keys', href: '/settings', icon: Key, active: isSettings },
        { label: 'Encryption Vault', href: '/settings', icon: ShieldCheck, active: false },
      ],
    },
  ];

  return (
    <>
      {/* Collapsible Icon Rail Sidebar */}
      <aside
        className={`bg-sidebar border-r border-zinc-800/80 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out ${
          open ? 'w-64 p-4' : 'w-16 p-2.5 items-center'
        }`}
      >
        <div className={`space-y-5 w-full ${!open ? 'flex flex-col items-center' : ''}`}>
          {/* Logo & Brand Header */}
          <div className={`flex items-center gap-2.5 px-1 ${!open ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-accent-orange flex items-center justify-center text-zinc-950 font-bold font-mono text-base shadow-md shadow-accent-orange/20 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            {open && (
              <div className="overflow-hidden whitespace-nowrap transition-all duration-200">
                <span className="font-mono text-2xl font-bold tracking-tight text-white uppercase">
                  TOKENGECKO
                </span>

              </div>
            )}
          </div>

          {/* Workspace Switcher Selector */}
          {open ? (
            <div className="p-2.5 bg-card-dark border border-zinc-800 flex items-center justify-between font-mono text-xs cursor-pointer hover:border-zinc-700 transition">
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-bold text-white leading-tight truncate">Main Workspace</div>
                  <div className="text-[10px] text-zinc-500 leading-tight truncate">v2.4.0 • Production</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            </div>
          ) : (
            <div
              title="Main Workspace (v2.4.0)"
              className="w-10 h-10 bg-card-dark border border-zinc-800 flex items-center justify-center cursor-pointer hover:border-zinc-700 transition shrink-0"
            >
              <Layers className="w-4 h-4 text-accent-orange" />
            </div>
          )}

          {/* Primary Action Button (+ Create Prompt) */}
          <Button
            onClick={() => router.push('/inspector')}
            variant="storeframe"
            className={`font-mono text-xs shadow-md transition-all ${
              open ? 'w-full justify-center gap-2' : 'w-10 h-10 p-0 justify-center'
            }`}
            title="Create Analysis"
          >
            <Plus className="w-4 h-4 text-zinc-950 shrink-0" />
            {open && <span>Create Analysis</span>}
          </Button>

          {/* Navigation Items Grouped by Category */}
          <nav className="space-y-5 pt-2 w-full">
            {navSections.map((section) => (
              <div key={section.group} className="space-y-1.5 w-full">
                {open && (
                  <div className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap overflow-hidden">
                    {section.group}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={item.label}
                      className={`flex items-center font-mono text-xs transition ${
                        open
                          ? 'justify-between px-2.5 py-2'
                          : 'justify-center w-10 h-10 mx-auto rounded-md'
                      } ${
                        item.active
                          ? 'bg-zinc-800/80 text-white font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-accent-orange' : 'text-zinc-500'}`} />
                        {open && <span>{item.label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className={`border-t border-zinc-800/80 pt-3 w-full ${!open ? 'flex justify-center' : ''}`}>
          {user ? (
            <div className={`flex items-center ${open ? 'justify-between px-2' : 'justify-center'}`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className="w-7 h-7 border-zinc-800 border border-accent-orange/30 text-accent-orange font-mono text-xs font-bold flex items-center justify-center uppercase shrink-0"
                  title={user.email || ''}
                >
                  {user.email?.[0] || 'U'}
                </div>
                {open && (
                  <div className="truncate">
                    <div className="text-xs font-mono text-white truncate font-medium">{user.email?.split('@')[0]}</div>
                    <div className="text-[10px] font-mono text-zinc-500 truncate">{user.email}</div>
                  </div>
                )}
              </div>
              {open && (
                <button
                  onClick={logout}
                  className="text-zinc-500 hover:text-red-400 transition p-1 shrink-0"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={`py-2 bg-zinc-800 hover:bg-zinc-700 text-center font-mono text-xs font-bold text-white block transition ${
                open ? 'w-full' : 'w-10 h-10 p-0 flex items-center justify-center'
              }`}
              title="Sign In"
            >
              {open ? 'Sign In' : <LogOut className="w-4 h-4" />}
            </Link>
          )}
        </div>
      </aside>

      {/* Main Responsive Workspace Frame */}
      <SidebarInset>
        {/* Top Header Bar with Single Sidebar Trigger */}
        <header className="h-14 border-b border-zinc-800/80 bg-header-dark/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Single Sidebar Trigger in Top Header */}
            <SidebarTrigger />

            <span className="text-zinc-400 hidden sm:inline">Main Workspace</span>
            <span className="text-zinc-600 hidden sm:inline">/</span>
            <span className="text-white font-bold capitalize">
              {isInspector ? 'Inspector' : isHistory ? 'History' : isSettings ? 'BYOK Settings' : 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push('/history')}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex gap-1.5 text-xs"
            >
              <History className="w-3.5 h-3.5 text-zinc-400" />
              History Vault
            </Button>

            <Button
              onClick={() => router.push('/settings')}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-accent-orange text-accent-orange hover:bg-accent-orange/10"
            >
              <Key className="w-3.5 h-3.5 text-accent-orange" />
              BYOK Keys
            </Button>
          </div>
        </header>

        {/* Dynamic Responsive Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-full w-full mx-auto transition-all duration-300">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarContent>{children}</SidebarContent>
    </SidebarProvider>
  );
}
