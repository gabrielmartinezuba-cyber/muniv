'use client'

import * as React from 'react'
import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
} from '@/lib/animations'

type AnimationVariant =
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'scaleIn'

const variantMap: Record<AnimationVariant, Variants> = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
}

interface AnimatedSectionProps {
  variant?: AnimationVariant
  stagger?: boolean
  delay?: number
  className?: string
  children?: React.ReactNode
}

function AnimatedSection({
  variant = 'fadeInUp',
  stagger = false,
  delay = 0,
  className,
  children,
}: AnimatedSectionProps) {
  const selectedVariant = variantMap[variant]

  // Build a delayed version of the variant when delay > 0
  const delayedVariant: Variants | undefined =
    delay > 0
      ? {
          hidden: selectedVariant.hidden,
          visible: {
            ...(typeof selectedVariant.visible === 'object'
              ? selectedVariant.visible
              : {}),
            transition: {
              ...(typeof selectedVariant.visible === 'object' &&
              selectedVariant.visible !== null &&
              'transition' in selectedVariant.visible
                ? (selectedVariant.visible.transition as Record<string, unknown>)
                : {}),
              delay,
            },
          },
        }
      : undefined

  const viewport = { once: true, margin: '-80px 0px' as const }

  if (stagger) {
    return (
      <motion.div
        className={cn(className)}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={
              delay > 0
                ? {
                    hidden: selectedVariant.hidden,
                    visible: {
                      ...(typeof selectedVariant.visible === 'object'
                        ? selectedVariant.visible
                        : {}),
                      transition: {
                        ...(typeof selectedVariant.visible === 'object' &&
                        selectedVariant.visible !== null &&
                        'transition' in selectedVariant.visible
                          ? (selectedVariant.visible.transition as Record<
                              string,
                              unknown
                            >)
                          : {}),
                        delay: delay + index * 0.05,
                      },
                    },
                  }
                : selectedVariant
            }
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(className)}
      variants={delayedVariant ?? selectedVariant}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {children}
    </motion.div>
  )
}

AnimatedSection.displayName = 'AnimatedSection'

export { AnimatedSection }
export type { AnimatedSectionProps, AnimationVariant }
