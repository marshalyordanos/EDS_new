import protectedApiClient, { publicApiClient } from "../api/axios";
// const BASE_URL = "https://eds-backend-2.onrender.com";
// const BASE_URL2 = "http://127.0.0.1:8000";
export const loginUser = async (email, password) => {
  try {
    const response = await publicApiClient.post("/api/auth/login/", {
      email: email,
      password: password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const refreshToken = async () => {
  const savedRefreshToken = localStorage.getItem("refreshToken");

  if (!savedRefreshToken) {
    return Promise.reject(new Error("No refresh token available."));
  }

  try {
    const response = await publicApiClient.post("/api/token/refresh/", {
      refresh: savedRefreshToken,
    });
    const { access } = response.data;

    if (access) {
      localStorage.setItem("accessToken", access);
    }
    return access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await publicApiClient.post("/api/password_reset/", {
      email: email,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Request Password Reset error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const confirmPasswordReset = async (uid, token, newPassword) => {
  try {
    const response = await publicApiClient.post(
      "/api/password_reset/confirm/",
      {
        uid: uid,
        token: token,
        new_password: newPassword,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Confirm Password Reset error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await protectedApiClient.post("/api/v1/changepassword/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Change Password error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
