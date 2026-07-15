import apiClient from "../api/axios";

export const getAllExperts = async (page = 1) => {
  try {
    const response = await apiClient.get("/api/v1/experts/", {
      params: {
        page: page,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch experts:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getExpertsRegisteredThisWeek = async (page = 1) => {
  try {
    const response = await apiClient.get("/api/v1/experts/this-week/", {
      params: {
        page: page,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch experts registered this week:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getExpertsRegisteredThisMonth = async (page = 1) => {
  try {
    const response = await apiClient.get("/api/v1/experts/this-month", {
      params: {
        page: page,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch experts registered this month:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getExpertsWithOutdatedCVs = async () => {
  try {
    const response = await apiClient.get("/api/v1/experts/outdated-cvs");
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch experts with outdated CVs:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const searchExperts = async (params) => {
  try {
    const response = await apiClient.get("/api/v1/experts/", { params });
    return response.data.results;
  } catch (error) {
    console.error(
      "Failed to search for experts:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const createExpert = async (personalInfo) => {
  try {
    const response = await apiClient.post("/api/v1/experts/", personalInfo);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to create expert:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const uploadCv = async (cvFormData) => {
  try {
    const response = await apiClient.post(
      `/api/v1/experts/upload_cv/`,
      cvFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to upload :`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
export const buildExpertCv = async (expertId, cvData) => {
  try {
    const response = await apiClient.post(
      `/api/v1/experts/${expertId}/build-cv/`,
      cvData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to build CV for expert ${expertId}:`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

//  Single Expert Management (Read, Update, Delete main object)

export const getExpertDetails = async (expertId) => {
  try {
    const response = await apiClient.get(`/api/v1/experts/${expertId}/`);
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch details for expert ${expertId}:`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const updateExpert = async (expertId, expertData) => {
  try {
    const response = await apiClient.patch(
      `/api/v1/experts/${expertId}/`,
      expertData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to update expert ${expertId}:`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
export const deleteExpert = async (expertId) => {
  try {
    const response = await apiClient.delete(`/api/v1/experts/${expertId}/`);
    return response;
  } catch (error) {
    console.error(
      `Failed to delete expert ${expertId}:`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

//  Functions for Nested Resources (Personal Detail, Education, etc.)

export const getNestedResourceList = async (expertId, resourceName) => {
  try {
    const response = await apiClient.get(
      `/api/v1/experts/${expertId}/${resourceName}/`
    );
    return response.data.results;
  } catch (error) {
    console.error(
      `Failed to fetch ${resourceName} for expert ${expertId}:`,
      error
    );
    throw error;
  }
};

//  to CREATE any new nested resource item
export const createNestedResource = async (expertId, resourceName, data) => {
  try {
    const response = await apiClient.post(
      `/api/v1/experts/${expertId}/${resourceName}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to create ${resourceName} for expert ${expertId}:`,
      error
    );
    throw error;
  }
};

//  to UPDATE any specific nested resource item
export const updateNestedResource = async (
  expertId,
  resourceName,
  itemId,
  data
) => {
  try {
    const response = await apiClient.patch(
      `/api/v1/experts/${expertId}/${resourceName}/${itemId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to update ${resourceName} item ${itemId} for expert ${expertId}:`,
      error
    );
    throw error;
  }
};

export const deleteNestedResource = async (expertId, resourceName, itemId) => {
  try {
    const response = await apiClient.delete(
      `/api/v1/experts/${expertId}/${resourceName}/${itemId}/`
    );
    return response;
  } catch (error) {
    console.error(
      `Failed to delete ${resourceName} item ${itemId} for expert ${expertId}:`,
      error
    );
    throw error;
  }
};
