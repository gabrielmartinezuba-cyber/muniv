'use client'

import * as React from 'react'
import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cardHover } from '@/lib/animations'

type GlassVariant = 'subtle' | 'standard' | 'heavy'
type GlowVariant = 'none' | 'default' | 'gold' | 'burgundy'

const variantClassMap: Record<GlassVariant, string> = {
  subtle: 'glass-subtle',
  standard: 'glass-panel',
  heavy: 'glass-heavy',
}

const glowClassMap: Record<GlowVariant, string> = {
  none: '',
  default: 'glass-glow',
  gold: 'glass-glow glass-glow-gold',
  burgundy: 'glass-glow glass-glow-burgundy',
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant
  glow?: GlowVariant
  hover?: boolean
  children?: React.ReactNode
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = 'standard',
      glow = 'none',
      hover = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'rounded-2xl overflow-hidden',
      variantClassMap[variant],
      glowClassMap[glow],
      className
    )

    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={classes}
          variants={cardHover as Variants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export { GlassCard }
export type { GlassCardProps, GlassVariant, GlowVariant }
