"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMagnetic } from "@/lib/hooks/useMagnetic";
import { springSnap } from "@/lib/animations";

// ============================================
// === TYPES                                ===
// ============================================

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface MagneticButtonProps {
  /** Visual variant of the button. */
  variant?: ButtonVariant;
  /** Size preset. */
  size?: ButtonSize;
  /** Whether to show the glow aura around the button. */
  glow?: boolean;
  /** Whether to enable the magnetic cursor-follow effect. */
  magnetic?: boolean;
  /** Whether the button is in a loading state. */
  loading?: boolean;
  /** HTML button type attribute. */
  type?: "button" | "submit" | "reset";
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Additional class names. */
  className?: string;
  children?: React.ReactNode;
}

// ============================================
// === STYLE MAPS                           ===
// ============================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-burgundy-600 text-white",
    "hover:bg-burgundy-500",
    "border border-burgundy-500/30"
  ),
  secondary: cn(
    "glass-panel text-gold-400",
    "border border-gold-500/20",
    "hover:border-gold-500/40"
  ),
  ghost: cn(
    "bg-transparent text-gold-400",
    "hover:bg-gold-500/10",
    "border border-transparent"
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg gap-2",
  md: "px-6 py-3 text-base rounded-xl gap-2.5",
  lg: "px-8 py-4 text-lg rounded-2xl gap-3",
};

const glowVariantClass: Record<ButtonVariant, string | null> = {
  primary: "glass-glow-burgundy",
  secondary: "glass-glow-gold",
  ghost: null,
};

// ============================================
// === COMPONENT                            ===
// ============================================

/**
 * Premium button with magnetic hover effect and variant-aware glow.
 *
 * The magnetic effect makes the button subtly follow the cursor on hover,
 * creating a tactile, luxury feel consistent with the Medieval Luxury theme.
 */
const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      glow = true,
      magnetic = true,
      loading = false,
      disabled = false,
      type = "button",
      className,
      children,
      onClick,
    },
    forwardedRef
  ) => {
    const isDisabled = disabled || loading;
    const isMagnetic = magnetic && !isDisabled;
    const showGlow = glow && !isDisabled && glowVariantClass[variant] !== null;

    // Magnetic hook — always called (rules of hooks), but we only use its
    // values when the effect is active.
    const { ref: magneticRef, x, y, handleMouse, resetMouse } = useMagnetic();

    // Merge the magnetic ref with any forwarded ref.
    const setRefs = (node: HTMLButtonElement | null) => {
      // Internal magnetic ref
      (magneticRef as React.MutableRefObject<HTMLElement | null>).current =
        node;
      // Forwarded ref
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (
          forwardedRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
      }
    };

    return (
      <motion.button
        ref={setRefs}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        // --- Magnetic effect ---
        style={isMagnetic ? { x, y } : undefined}
        onMouseMove={isMagnetic ? handleMouse : undefined}
        onMouseLeave={isMagnetic ? resetMouse : undefined}
        // --- Animations ---
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={springSnap}
        // --- Styles ---
        className={cn(
          // Base
          "relative inline-flex items-center justify-center",
          "font-medium tracking-wide",
          "select-none outline-none",
          "transition-colors duration-200 ease-out",
          "cursor-pointer",
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          // Font: Playfair for lg, sans for others
          size === "lg" ? "font-display" : "font-sans",
          // Focus ring
          "focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-iron-900",
          // Disabled
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-auto",
          // Glow wrapper
          showGlow && glowVariantClass[variant],
          className
        )}
      >
        {/* Loading spinner */}
        {loading ? (
          <Loader2 className="h-[1.15em] w-[1.15em] animate-spin" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";

export { MagneticButton };
export type { MagneticButtonProps, ButtonVariant, ButtonSize };
