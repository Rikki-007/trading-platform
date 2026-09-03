/** Shared Framer Motion variants — one definition, used across every page
 * so scroll-reveal timing/easing stays consistent site-wide. */

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/** A slightly heavier version (adds scale) for hero-scale moments — used for
 * the home hero's choreographed reveal off the loading screen. */
export const heroReveal = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};
