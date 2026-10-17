'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'card' | 'image' | 'circle' | 'button';

interface SkeletonProps {
  /** Shape variant of the skeleton */
  variant?: SkeletonVariant;
  /** Number of text lines (only used when variant is 'text') */
  lines?: number;
  /** Additional CSS classes */
  className?: string;
}

/** Shared pulse animation config */
const pulseTransition = {
  opacity: {
    duration: 1.8,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const,
  },
};

/** Generate varying widths for text lines to look natural */
function getLineWidth(index: number, total: number): string {
  if (total <= 1) return '100%';
  // Last line is shorter, middle lines vary
  const widths = ['100%', '85%', '70%', '90%', '60%', '75%', '95%', '80%'];
  if (index === total - 1) return '70%';
  return widths[index % widths.length];
}

function SkeletonLine({
  width,
  className,
}: {
  width: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn('skeleton-shimmer h-4 rounded bg-stone-800/60', className)}
      style={{ width }}
      animate={{ opacity: [0.5, 1] }}
      transition={pulseTransition}
    />
  );
}

export function Skeleton({
  variant = 'text',
  lines = 3,
  className,
}: SkeletonProps) {
  switch (variant) {
    case 'text': {
      const lineCount = Math.max(1, lines);
      return (
        <div className={cn('flex flex-col gap-2.5', className)} role="status" aria-label="Loading">
          {Array.from({ length: lineCount }, (_, i) => (
            <SkeletonLine
              key={i}
              width={getLineWidth(i, lineCount)}
            />
          ))}
        </div>
      );
    }

    case 'card':
      return (
        <motion.div
          className={cn(
            'skeleton-shimmer aspect-[4/3] rounded-2xl bg-stone-800/60',
            className
          )}
          animate={{ opacity: [0.5, 1] }}
          transition={pulseTransition}
          role="status"
          aria-label="Loading"
        />
      );

    case 'image':
      return (
        <motion.div
          className={cn(
            'skeleton-shimmer aspect-square rounded-xl bg-stone-800/60',
            className
          )}
          animate={{ opacity: [0.5, 1] }}
          transition={pulseTransition}
          role="status"
          aria-label="Loading"
        />
      );

    case 'circle':
      return (
        <motion.div
          className={cn(
            'skeleton-shimmer h-12 w-12 rounded-full bg-stone-800/60',
            className
          )}
          animate={{ opacity: [0.5, 1] }}
          transition={pulseTransition}
          role="status"
          aria-label="Loading"
        />
      );

    case 'button':
      return (
        <motion.div
          className={cn(
            'skeleton-shimmer h-10 w-32 rounded-full bg-stone-800/60',
            className
          )}
          animate={{ opacity: [0.5, 1] }}
          transition={pulseTransition}
          role="status"
          aria-label="Loading"
        />
      );

    default:
      return null;
  }
}
