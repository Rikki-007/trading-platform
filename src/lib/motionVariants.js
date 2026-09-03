/** Shared Framer Motion variants — one definition, used across every page
 * so scroll-reveal timing/easing stays consistent site-wide. */

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/** The home hero's choreographed reveal off the loading screen: starts
 * above its resting position and slides straight down into place — a
 * deliberate top-to-bottom motion, not the more common "rise up from
 * below" — over exactly 1.2s with a smooth ease-in-out. */
export const heroReveal = {
  hidden: { opacity: 0, y: -48 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: "easeInOut" },
  },
};
