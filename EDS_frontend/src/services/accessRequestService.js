import apiClient from "../api/axios";

/* Requests from a company to unlock one expert's contact info + CV.
   Company users see only their own; admins see everyone's - the backend
   scopes the list automatically per ExpertRegistration.views.AccessRequestViewSet. */

export const listAccessRequests = (params = {}) =>
  apiClient.get("/api/v1/access-requests/", { params });

export const getAccessRequest = (id) =>
  apiClient.get(`/api/v1/access-requests/${id}/`);

export const createAccessRequest = (expertId) =>
  apiClient.post("/api/v1/access-requests/", { expert: expertId });

// Admin-only actions below - the backend rejects these for a company user.
export const priceAccessRequest = (id, price, adminNote = "") =>
  apiClient.post(`/api/v1/access-requests/${id}/price/`, {
    price,
    admin_note: adminNote,
  });

export const rejectAccessRequest = (id, adminNote = "") =>
  apiClient.post(`/api/v1/access-requests/${id}/reject/`, {
    admin_note: adminNote,
  });

export const markAccessRequestPaid = (id) =>
  apiClient.post(`/api/v1/access-requests/${id}/mark-paid/`);
