'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type DividerVariant = 'gold' | 'burgundy' | 'ember'

const gradientMap: Record<DividerVariant, string> = {
  gold: 'from-transparent via-gold-500/40 to-transparent',
  burgundy: 'from-transparent via-burgundy-500/40 to-transparent',
  ember: 'from-transparent via-ember-500/40 to-transparent',
}

interface SectionDividerProps {
  variant?: DividerVariant
  className?: string
}

function SectionDivider({
  variant = 'gold',
  className,
}: SectionDividerProps) {
  return (
    <motion.div
      className={cn(
        'h-px max-w-sm mx-auto bg-gradient-to-r',
        gradientMap[variant],
        className
      )}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    />
  )
}

SectionDivider.displayName = 'SectionDivider'

export { SectionDivider }
export type { SectionDividerProps, DividerVariant }
