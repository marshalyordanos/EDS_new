import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TYPE_MS = 74;
const DELETE_MS = 46;
const HOLD_MS = 2600;
const SWAP_MS = 260;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Types through a list of words without ever reflowing the headline.
 *
 * Layout technique: a hidden "ghost" span holds the widest word and reserves
 * the slot's width; the visible word and caret are absolutely positioned
 * inside it. The widest word is chosen by MEASURED width, not character
 * count, because equal-length words render at different widths.
 */
const RotatingWord = ({ words, startDelay = 2400 }) => {
  const [text, setText] = useState(words[0]);
  const [widest, setWidest] = useState(words[0]);

  const ghostRef = useRef(null);
  const wordRef = useRef(null);
  const caretRef = useRef(null);

  // Measure every candidate once, before paint, to size the slot.
  useLayoutEffect(() => {
    const ghost = ghostRef.current;
    if (!ghost) return;

    const original = ghost.textContent;
    let widestWord = words[0];
    let widestPx = 0;

    words.forEach((word) => {
      ghost.textContent = word;
      const px = ghost.getBoundingClientRect().width;
      if (px > widestPx) {
        widestPx = px;
        widestWord = word;
      }
    });

    ghost.textContent = original;
    setWidest(widestWord);
  }, [words]);

  // Park the caret at the end of the visible text.
  useLayoutEffect(() => {
    const word = wordRef.current;
    const caret = caretRef.current;
    if (!word || !caret) return;
    caret.style.setProperty("--ld-caret-x", `${word.getBoundingClientRect().width + 2}px`);
  }, [text]);

  useEffect(() => {
    if (prefersReducedMotion() || words.length < 2) return undefined;

    let timer;
    let wordIndex = 0;
    let charCount = words[0].length;
    let deleting = true;

    const tick = () => {
      const current = words[wordIndex];
      charCount += deleting ? -1 : 1;
      setText(current.slice(0, charCount));

      let wait = deleting ? DELETE_MS : TYPE_MS;
      if (deleting && charCount <= 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        wait = SWAP_MS;
      } else if (!deleting && charCount >= words[wordIndex].length) {
        deleting = true;
        wait = HOLD_MS;
      }

      timer = setTimeout(tick, wait);
    };

    timer = setTimeout(tick, startDelay);
    return () => clearTimeout(timer);
  }, [words, startDelay]);

  return (
    <span className="ld-swap-slot">
      {/* reserves the widest word's width so the line never reflows */}
      <span className="ld-swap-ghost" ref={ghostRef} aria-hidden="true">
        {widest}
      </span>
      <span className="ld-swap-word" ref={wordRef}>
        {text}
      </span>
      <span className="ld-caret" ref={caretRef} aria-hidden="true" />
    </span>
  );
};

export default RotatingWord;
