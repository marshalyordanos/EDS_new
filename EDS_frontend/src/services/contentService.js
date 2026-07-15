import apiClient, { publicApiClient } from "../api/axios";

// Blog Posts
export const getBlogPosts = (allPosts = false) =>
  allPosts
    ? apiClient.get("/content/blog/")
    : publicApiClient.get("/content/blog/");

export const getBlogPost = (slug) =>
  publicApiClient.get(`/content/blog/${slug}/`);

export const createBlogPost = (data) =>
  apiClient.post("/content/blog/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateBlogPost = (slug, data) =>
  apiClient.patch(`/content/blog/${slug}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBlogPost = (slug) =>
  apiClient.delete(`/content/blog/${slug}/`);

export const publishBlogPost = (slug) =>
  apiClient.post(`/content/blog/${slug}/publish/`);

export const unpublishBlogPost = (slug) =>
  apiClient.post(`/content/blog/${slug}/unpublish/`);

// Testimonials
export const getTestimonials = (allTestimonials = false) =>
  allTestimonials
    ? apiClient.get("/content/testimonials/")
    : publicApiClient.get("/content/testimonials/");

export const createTestimonial = (data) =>
  apiClient.post("/content/testimonials/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateTestimonial = (id, data) =>
  apiClient.patch(`/content/testimonials/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteTestimonial = (id) =>
  apiClient.delete(`/content/testimonials/${id}/`);

// Contact form
export const submitContactForm = (data) =>
  publicApiClient.post("/content/contact/", data);
