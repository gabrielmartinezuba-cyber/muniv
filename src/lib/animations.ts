/**
 * Framer Motion animation presets for MUNIV Visual Overhaul.
 * Centralized variants, transitions, and spring configs.
 * 
 * Usage: import { fadeInUp, staggerContainer } from '@/lib/animations';
 *        <motion.div variants={fadeInUp} initial="hidden" animate="visible" />
 */

import type { Variants, Transition } from "framer-motion";

// ============================================
// === SPRING CONFIGURATIONS                ===
// ============================================

/** Snappy, responsive spring for UI interactions */
export const springSnap: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

/** Smooth, elegant spring for page-level transitions */
export const springSmooth: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 0.5,
};

/** Bouncy spring for attention-grabbing animations */
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 15,
};

/** Slow, luxurious spring for hero-level reveals */
export const springLuxury: Transition = {
  type: "spring",
  stiffness: 50,
  damping: 20,
  mass: 1,
};

// ============================================
// === EASING FUNCTIONS                     ===
// ============================================

/** Apple-style ease-out curve */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/** Dramatic ease-in-out for hero reveals */
export const easeInOutCubic = [0.65, 0, 0.35, 1] as const;

// ============================================
// === VARIANTS: FADE                       ===
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

// ============================================
// === VARIANTS: SCALE                      ===
// ============================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springBouncy,
  },
};

// ============================================
// === VARIANTS: STAGGER CONTAINERS         ===
// ============================================

/** Container that staggers children by 100ms */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/** Container with slower stagger (150ms) for dramatic reveals */
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

/** Container with fast stagger (60ms) for lists */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// ============================================
// === VARIANTS: CARD INTERACTIONS          ===
// ============================================

/** Card hover effect with lift and glow */
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    scale: 1.02,
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// ============================================
// === VARIANTS: PAGE TRANSITIONS           ===
// ============================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// ============================================
// === VARIANTS: DRAWER / MODAL             ===
// ============================================

export const drawerSlideRight: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { ...springSmooth, stiffness: 200, damping: 30 },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

export const drawerSlideUp: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { ...springSmooth, stiffness: 200, damping: 30 },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ============================================
// === VARIANTS: NOTIFICATION BADGES        ===
// ============================================

export const badgePop: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: springBouncy,
  },
};

// ============================================
// === VIEWPORT CONFIG FOR useInView        ===
// ============================================

/** Standard viewport detection settings for scroll reveals */
export const viewportOnce = {
  once: true,
  margin: "-80px 0px" as `${number}px ${number}px`,
};

/** More aggressive trigger (element visible sooner) */
export const viewportEager = {
  once: true,
  margin: "-40px 0px" as `${number}px ${number}px`,
};
