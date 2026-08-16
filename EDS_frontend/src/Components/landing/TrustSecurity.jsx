import Reveal from "./Reveal";
import { TRUST } from "./landingContent";

const TrustSecurity = () => (
  <section className="ld-trust" id="trust">
    <div className="ld-wrap">
      <Reveal>
        <p className="ld-eyebrow">Trust and security</p>
        <h2 className="ld-title">
          Every record earns
          <br />
          its place
        </h2>
      </Reveal>

      <div className="ld-trust-grid">
        {TRUST.map((item, i) => (
          <Reveal key={item.title} className="ld-trust-cell" delay={i * 90}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.path} />
            </svg>
            <h3 className="ld-trust-title">{item.title}</h3>
            <p className="ld-trust-text">{item.text}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSecurity;
