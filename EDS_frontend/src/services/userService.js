import apiClient from "../api/axios";

export const getUsers = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/v1/users/", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch users:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getUserStats = async () => {
  try {
    const response = await apiClient.get("/api/v1/users/stats/");
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch user stats:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const createUser = async (payload) => {
  try {
    const response = await apiClient.post("/api/v1/users/", payload);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to create user:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const updateUser = async (userId, payload) => {
  try {
    const response = await apiClient.patch(`/api/v1/users/${userId}/`, payload);
    return response.data;
  } catch (error) {
    console.error(
      `Failed to update user ${userId}:`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/api/v1/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete user ${userId}:`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const resetUserPassword = async (userId) => {
  try {
    const response = await apiClient.post(`/api/v1/users/${userId}/reset-password/`);
    return response.data;
  } catch (error) {
    console.error(
      `Failed to reset password for user ${userId}:`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const toggleUserActive = async (userId) => {
  try {
    const response = await apiClient.post(`/api/v1/users/${userId}/toggle-active/`);
    return response.data;
  } catch (error) {
    console.error(
      `Failed to toggle active status for user ${userId}:`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getCompanyNames = async () => {
  try {
    const response = await apiClient.get("/api/v1/users/company-names/");
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch company names:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
