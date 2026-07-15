import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { getBlogPost } from "../../services/contentService";
import "../../styles/homepage.css";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getBlogPost(slug)
      .then((res) => setPost(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PublicLayout>
      <main style={{ flex: 1, maxWidth: "760px", margin: "0 auto", padding: "64px 24px", width: "100%" }}>
        {/* Back link */}
        <Link
          to="/blog"
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "6px", 
            fontFamily: "Raleway, sans-serif", 
            fontSize: "0.875rem", 
            fontWeight: 600, 
            color: "var(--theme-text-secondary)", 
            textDecoration: "none", 
            marginBottom: "40px",
            transition: "color 0.3s ease"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {loading && (
          <div style={{ 
            textAlign: "center", 
            padding: "64px 0", 
            color: "var(--theme-text-muted)", 
            fontFamily: "Raleway, sans-serif",
            transition: "color 0.3s ease"
          }}>
            Loading…
          </div>
        )}

        {notFound && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <p style={{ 
              fontFamily: "Raleway, sans-serif", 
              fontSize: "1.1rem", 
              fontWeight: 700, 
              color: "var(--theme-text-primary)",
              transition: "color 0.3s ease"
            }}>Post not found</p>
            <p style={{ 
              fontFamily: "Raleway, sans-serif", 
              fontSize: "0.875rem", 
              color: "var(--theme-text-muted)", 
              marginTop: "8px",
              transition: "color 0.3s ease"
            }}>
              This post may have been removed or the link is incorrect.
            </p>
            <button
              onClick={() => navigate("/blog")}
              style={{ 
                marginTop: "24px", 
                fontFamily: "Raleway, sans-serif", 
                fontSize: "0.875rem", 
                fontWeight: 600, 
                color: "var(--color-primary)", 
                background: "none", 
                border: "none", 
                cursor: "pointer" 
              }}
            >
              ← View all posts
            </button>
          </div>
        )}

        {!loading && post && (
          <article>
            {/* Cover image */}
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                style={{ width: "100%", maxHeight: "420px", objectFit: "cover", borderRadius: "16px", marginBottom: "40px" }}
              />
            )}

            {/* Meta */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
              <span style={{ 
                fontFamily: "Raleway, sans-serif", 
                fontSize: "0.8rem", 
                fontWeight: 600, 
                color: "var(--color-primary)", 
                background: "var(--color-primary-ultra-light)", 
                border: "1px solid var(--color-primary-light)", 
                borderRadius: "999px", 
                padding: "4px 12px",
                transition: "background-color 0.3s ease, border-color 0.3s ease"
              }}>
                AfriDATAi Blog
              </span>
              {post.published_at && (
                <span style={{ 
                  fontFamily: "Raleway, sans-serif", 
                  fontSize: "0.85rem", 
                  color: "var(--theme-text-muted)",
                  transition: "color 0.3s ease"
                }}>
                  {formatDate(post.published_at)}
                </span>
              )}
              {post.author_name && (
                <span style={{ 
                  fontFamily: "Raleway, sans-serif", 
                  fontSize: "0.85rem", 
                  color: "var(--theme-text-muted)",
                  transition: "color 0.3s ease"
                }}>
                  · {post.author_name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ 
              fontFamily: "Raleway, sans-serif", 
              fontSize: "2.2rem", 
              fontWeight: 800, 
              color: "var(--theme-text-primary)", 
              lineHeight: 1.2, 
              margin: "0 0 32px",
              transition: "color 0.3s ease"
            }}>
              {post.title}
            </h1>

            {/* Divider */}
            <hr style={{ 
              border: "none", 
              borderTop: "1px solid var(--theme-border-light)", 
              marginBottom: "32px",
              transition: "border-color 0.3s ease"
            }} />

            {/* Body */}
            <div style={{ 
              fontFamily: "Raleway, sans-serif", 
              fontSize: "1.05rem", 
              color: "var(--theme-text-secondary)", 
              lineHeight: 1.9, 
              whiteSpace: "pre-wrap",
              transition: "color 0.3s ease"
            }}>
              {post.body}
            </div>
          </article>
        )}
      </main>

    </PublicLayout>
  );
}
