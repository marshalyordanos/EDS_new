import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { getBlogPosts } from "../../services/contentService";
import "../../styles/homepage.css";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts()
      .then((res) => setPosts(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <main style={{ flex: 1, maxWidth: "1100px", margin: "0 auto", padding: "64px 24px", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <span className="hero-badge" style={{ marginBottom: "16px", display: "inline-flex" }}>
            AfriDATAi Blog
          </span>
          <h1 style={{ 
            fontFamily: "Raleway, sans-serif", 
            fontSize: "2.8rem", 
            fontWeight: 800, 
            color: "var(--theme-text-primary)", 
            lineHeight: 1.15, 
            margin: 0,
            transition: "color 0.3s ease"
          }}>
            Insights, updates & stories
          </h1>
          <p style={{ 
            fontFamily: "Raleway, sans-serif", 
            fontSize: "1.05rem", 
            color: "var(--theme-text-secondary)", 
            marginTop: "12px", 
            maxWidth: "560px",
            transition: "color 0.3s ease"
          }}>
            Perspectives on expert management, research, and workforce development across Africa.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ 
            textAlign: "center", 
            padding: "64px 0", 
            color: "var(--theme-text-muted)", 
            fontFamily: "Raleway, sans-serif",
            transition: "color 0.3s ease"
          }}>
            Loading posts…
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <p style={{ 
              fontFamily: "Raleway, sans-serif", 
              fontSize: "1rem", 
              color: "var(--theme-text-secondary)", 
              fontWeight: 600,
              transition: "color 0.3s ease"
            }}>No posts yet</p>
            <p style={{ 
              fontFamily: "Raleway, sans-serif", 
              fontSize: "0.875rem", 
              color: "var(--theme-text-muted)", 
              marginTop: "4px",
              transition: "color 0.3s ease"
            }}>Check back soon.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && posts.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
            {posts.map((post) => (
              <Link to={`/blog/${post.slug}`} key={post.id} style={{ textDecoration: "none" }}>
                <article style={{
                  backgroundColor: "var(--theme-bg-secondary)",
                  border: "1px solid var(--theme-border-light)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, transform 0.2s, background-color 0.3s ease, border-color 0.3s ease",
                  cursor: "pointer",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "200px", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div style={{ padding: "24px" }}>
                    <h2 style={{ 
                      fontFamily: "Raleway, sans-serif", 
                      fontSize: "1.15rem", 
                      fontWeight: 700, 
                      color: "var(--theme-text-primary)", 
                      margin: "0 0 8px", 
                      lineHeight: 1.4,
                      transition: "color 0.3s ease"
                    }}>
                      {post.title}
                    </h2>
                    <p style={{ 
                      fontFamily: "Raleway, sans-serif", 
                      fontSize: "0.85rem", 
                      color: "var(--theme-text-muted)", 
                      margin: "0 0 16px",
                      transition: "color 0.3s ease"
                    }}>
                      {post.author_name && `${post.author_name} · `}{post.published_at && formatDate(post.published_at)}
                    </p>
                    <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-primary)" }}>
                      Read more →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
