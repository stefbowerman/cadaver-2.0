/**
 * Returns whether the use prefers reduced motion or not
 *
 * @return {Boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}