import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Animates 0 → target once `active` becomes true.
 *
 * Returns the target immediately when the user prefers reduced motion, or when
 * the target arrives late (e.g. after the API resolves), so the figure is never
 * left stuck at zero.
 *
 * @param {number} target  Final value.
 * @param {boolean} active Start the animation.
 * @param {number} duration Milliseconds.
 */
export const useCountUp = (target, active, duration = 1900) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!active || !target) return undefined;

    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }

    let start = null;
    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Quartic ease-out: the figure decelerates hard into its final value.
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.floor(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, active, duration]);

  return value;
};

export default useCountUp;
