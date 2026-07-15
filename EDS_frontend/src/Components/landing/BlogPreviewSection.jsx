import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogPosts } from "../../services/contentService";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const BlogPreviewSection = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getBlogPosts()
      .then((res) => {
        const results = res.data.results ?? res.data;
        if (Array.isArray(results)) setPosts(results.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="blog-preview-section" data-aos="fade-up">
      <div className="blog-preview-container">
        <div className="blog-preview-header">
          <div>
            <span className="blog-preview-tag">From the Blog</span>
            <h2 className="blog-preview-title">Latest insights &amp; updates</h2>
            <p className="blog-preview-subtitle">
              Perspectives on expert management, research, and workforce development across Africa.
            </p>
          </div>
          <Link to="/blog" className="blog-preview-view-all">
            View all posts →
          </Link>
        </div>

        <div className="blog-preview-grid">
          {posts.map((post, index) => (
            <Link to={`/blog/${post.slug}`} key={post.id} className="blog-preview-card" data-aos="fade-up" data-aos-delay={index * 100}>
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title} className="blog-preview-card-img" />
              ) : (
                <div className="blog-preview-card-img blog-preview-card-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="blog-preview-card-body">
                <p className="blog-preview-card-meta">
                  {post.author_name && `${post.author_name} · `}
                  {post.published_at && formatDate(post.published_at)}
                </p>
                <h3 className="blog-preview-card-title">{post.title}</h3>
                <span className="blog-preview-card-link">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreviewSection;
