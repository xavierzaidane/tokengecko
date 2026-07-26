import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (v: string) => void;
}>({ value: '', onValueChange: () => {} });

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('space-y-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 overflow-x-auto  bg-[#141414] border border-zinc-800/90 p-1 font-mono text-xs text-zinc-400 no-scrollbar',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, icon, badge }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        'inline-flex items-center gap-2  px-3.5 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap select-none',
        isActive
          ? 'bg-zinc-800 text-white font-bold border border-zinc-700/80 shadow-md'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40',
        className
      )}
    >
      {icon}
      <span>{children}</span>
      {badge}
    </button>
  );
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={cn('focus-visible:outline-none animate-in fade-in-50 duration-150', className)}>{children}</div>;
}
