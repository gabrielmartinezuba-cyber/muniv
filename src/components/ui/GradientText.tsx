'use client';

import { type ReactNode, createElement } from 'react';
import { cn } from '@/lib/utils';

type GradientVariant = 'gold' | 'burgundy' | 'ember' | 'shimmer';
type GradientElement = 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';

interface GradientTextProps {
  /** Gradient color variant */
  variant?: GradientVariant;
  /** HTML element to render as */
  as?: GradientElement;
  /** If true, applies shimmer animation regardless of variant */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Text content */
  children?: ReactNode;
}

const variantClassMap: Record<GradientVariant, string> = {
  gold: 'gradient-text-gold',
  burgundy: 'gradient-text-burgundy',
  ember: 'gradient-text-ember',
  shimmer: 'gradient-text-shimmer',
};

export function GradientText({
  variant = 'gold',
  as: tag = 'span',
  animate = false,
  className,
  children,
}: GradientTextProps) {
  // When animate is true and variant is not already shimmer,
  // combine the variant gradient with the shimmer animation class
  const gradientClass = variantClassMap[variant];
  const shimmerClass =
    animate && variant !== 'shimmer' ? 'gradient-text-shimmer' : '';

  return createElement(
    tag,
    { className: cn(gradientClass, shimmerClass, className) },
    children
  );
}
