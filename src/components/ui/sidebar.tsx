'use client';

import * as React from 'react';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarContextType {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  children,
  className,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const state = open ? 'expanded' : 'collapsed';

  return (
    <SidebarContext.Provider value={{ state, open, setOpen, toggleSidebar }}>
      <div className={cn('min-h-screen w-full flex bg-app text-zinc-100 font-sans antialiased', className)}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn(
        'h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800 transition',
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      title={open ? 'Collapse Sidebar (Cmd+B)' : 'Expand Sidebar (Cmd+B)'}
      {...props}
    >
      <PanelLeft className="w-4 h-4 text-accent-orange" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

export function SidebarInset({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out', className)}>
      {children}
    </div>
  );
}
