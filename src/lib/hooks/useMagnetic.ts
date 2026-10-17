"use client";

/**
 * Magnetic hover effect hook for buttons and interactive elements.
 * Creates a subtle "pull" effect where the element follows the cursor
 * when hovering, giving a premium interactive feel.
 *
 * Usage:
 *   const { ref, x, y, handleMouse, resetMouse } = useMagnetic(0.3);
 *   <motion.button ref={ref} style={{ x, y }} onMouseMove={handleMouse} onMouseLeave={resetMouse} />
 */

import { useRef, useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";

interface UseMagneticOptions {
  /** Strength of the pull effect (0 = none, 1 = follows cursor exactly). Default: 0.3 */
  strength?: number;
  /** Spring stiffness. Default: 150 */
  stiffness?: number;
  /** Spring damping. Default: 15 */
  damping?: number;
}

export function useMagnetic(options: UseMagneticOptions = {}) {
  const { strength = 0.3, stiffness = 150, damping = 15 } = options;

  const ref = useRef<HTMLElement>(null);

  const xRaw = useMotionValue(0);
  const yRaw = useMotionValue(0);

  const x = useSpring(xRaw, { stiffness, damping });
  const y = useSpring(yRaw, { stiffness, damping });

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      xRaw.set(deltaX);
      yRaw.set(deltaY);
    },
    [strength, xRaw, yRaw]
  );

  const resetMouse = useCallback(() => {
    xRaw.set(0);
    yRaw.set(0);
  }, [xRaw, yRaw]);

  return { ref, x, y, handleMouse, resetMouse };
}
