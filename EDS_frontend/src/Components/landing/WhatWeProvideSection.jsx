import Reveal from "./Reveal";
import { CAPABILITIES } from "./landingContent";

const WhatWeProvideSection = () => (
  <section className="ld-cap" id="capabilities">
    <div className="ld-wrap">
      <Reveal>
        <p className="ld-eyebrow">Platform capabilities</p>
        <h2 className="ld-title">
          Built for serious
          <br />
          expert discovery
        </h2>
        <p className="ld-lede">
          Everything needed to find, evaluate and engage the right expert — from
          rapid search to deep sector analytics.
        </p>
      </Reveal>

      <div className="ld-cap-grid">
        {CAPABILITIES.map((item, i) => (
          <Reveal key={item.title} className="ld-cap-cell" delay={(i % 3) * 70}>
            <div className="ld-cap-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.path} />
              </svg>
            </div>
            <h3 className="ld-cap-title">{item.title}</h3>
            <p className="ld-cap-text">{item.text}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default WhatWeProvideSection;
