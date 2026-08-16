import useInView from "../../hooks/useInView";

/**
 * Fades + lifts its children in the first time they scroll into view.
 * Replaces the AOS dependency on this page so entrance timing is owned by
 * the component tree rather than a global library scan.
 */
const Reveal = ({ as = "div", delay = 0, className = "", children, ...rest }) => {
  const [ref, inView] = useInView(0.12);
  const Tag = as;

  return (
    <Tag
      ref={ref}
      className={`ld-rise${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--ld-delay": `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
