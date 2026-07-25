import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium transition-colors border',
  {
    variants: {
      variant: {
        default: 'border-accent-orange/30 bg-accent-orange/10 text-accent-orange',
        secondary: 'border-zinc-700 bg-zinc-800 text-zinc-300',
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        destructive: 'border-red-500/30 bg-red-500/10 text-red-400',
        outline: 'border-zinc-800 text-zinc-400',
        orange: 'border-accent-orange bg-accent-orange text-zinc-950 font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
