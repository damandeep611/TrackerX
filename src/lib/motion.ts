import type { Transition, Variants } from "motion/react";

/**
 * Shared motion presets. Keep motion subtle: short durations, soft easing,
 * small distances. Wrap the app in <MotionConfig reducedMotion="user"> (done in
 * the dashboard layout) so these respect prefers-reduced-motion automatically.
 */

export const ease = {
  out: [0.22, 1, 0.36, 1] as const, // matches --ease-out-soft
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const duration = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
};

export const spring: Transition = { type: "spring", stiffness: 380, damping: 32, mass: 0.8 };

/** Page / section entrance: fade + 6px rise. */
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
};

/** Parent for staggered lists/grids. Children use `listItem`. */
export const stagger = (step = 0.05, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren } },
});

export const listItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.fast } },
};

/** Card hover: 2px lift. Use with `whileHover="hover"` or spread as props. */
export const hoverLift = {
  whileHover: { y: -2, transition: { duration: duration.fast, ease: ease.out } },
  whileTap: { scale: 0.99 },
};

/** Popovers / dialogs. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 4 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.fast } },
};

/** Layout transitions (reordering, expanding). */
export const layoutTransition: Transition = { duration: duration.base, ease: ease.out };
