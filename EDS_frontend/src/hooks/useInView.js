import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first scrolls into view, then stops observing.
 * Used to trigger entrance animations without re-running them on every scroll.
 *
 * @param {number} threshold Fraction of the element that must be visible.
 * @returns {[React.RefObject, boolean]} ref to attach, and whether it has appeared.
 */
export const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect(); // one-shot: never animate twice
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

export default useInView;
