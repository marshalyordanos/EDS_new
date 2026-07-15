import { useEffect, useState } from "react";
import { getTestimonials } from "../../services/contentService";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const Testimonials = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getTestimonials()
      .then((res) => {
        const results = res.data.results ?? res.data;
        if (Array.isArray(results)) setItems(results);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <span className="testimonials-subtitle">What People Say</span>
          <h2 className="testimonials-title">What early users are saying</h2>
        </div>

        {items.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "48px 24px", 
            color: "var(--theme-text-muted)",
            transition: "color 0.3s ease"
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p style={{ 
              fontFamily: "Raleway, sans-serif", 
              fontSize: "1rem", 
              fontWeight: 600, 
              color: "var(--theme-text-secondary)", 
              marginBottom: "4px",
              transition: "color 0.3s ease"
            }}>
              Testimonials coming soon
            </p>
            <p style={{ 
              fontFamily: "Raleway, sans-serif", 
              fontSize: "0.85rem", 
              color: "var(--theme-text-muted)",
              transition: "color 0.3s ease"
            }}>
              We're collecting feedback from our early users.
            </p>
          </div>
        ) : (
        <div className="testimonials-grid">
          {items.map((item) => (
            <div key={item.id} className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="star-icon">★</span>
                ))}
              </div>

              <p className="testimonial-quote">"{item.quote}"</p>

              <div className="testimonial-profile">
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="avatar-circle"
                    style={{ objectFit: "cover", padding: 0 }}
                  />
                ) : (
                  <div className="avatar-circle">{getInitials(item.name)}</div>
                )}
                <div className="profile-info">
                  <h4 className="profile-name">{item.name}</h4>
                  <p className="profile-metadata">
                    {item.role}
                    {item.organization && (
                      <> • <span className="profile-location">{item.organization}</span></>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
