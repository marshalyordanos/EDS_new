import Reveal from "./Reveal";
import useInView from "../../hooks/useInView";
import { WORKFLOW } from "./landingContent";

const HowItWorksSection = () => {
  const [railRef, railIn] = useInView(0.35);

  return (
    <section className="ld-flow" id="how-it-works">
      <div className="ld-wrap">
        <Reveal>
          <p className="ld-eyebrow">How it works</p>
          <h2 className="ld-title">
            From search to connection
            <br />
            in minutes
          </h2>
          <p className="ld-lede">
            A simple, powerful workflow designed for decision-makers and
            researchers alike.
          </p>
        </Reveal>

        <div className="ld-flow-steps" ref={railRef}>
          <div className={`ld-flow-rail${railIn ? " is-in" : ""}`} />

          {WORKFLOW.map((step, i) => (
            <Reveal key={step.title} className="ld-step" delay={i * 110}>
              {/* Numbered because this genuinely is a sequence. */}
              <div className="ld-step-num">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="ld-step-title">{step.title}</h3>
              <p className="ld-step-text">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
