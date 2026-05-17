import api from "./axiosInstance";

export async function loginUser(credentials) {
  const response = await api.post("/auth/login/", credentials);

  return response.data;
}

export async function registerUser(userData) {
  const response = await api.post("/auth/register/", userData);

  return response.data;
}

export async function getMyProfile() {
  const response = await api.get("/auth/profile/");

  return response.data;
}

export async function updateMyProfile(profileData) {
  const response = await api.patch("/auth/profile/", profileData);

  return response.data;
}

export async function logoutUser(refreshToken) {
  const response = await api.post("/auth/logout/", {
    refresh: refreshToken,
  });

  return response.data;
}

export async function refreshAccessToken(refreshToken) {
  const response = await api.post("/auth/token/refresh/", {
    refresh: refreshToken,
  });

  return response.data;
}

export async function getPublicProfile(userId) {
  const response = await api.get(`/auth/profiles/${userId}/`);

  return response.data;
}

export async function requestPasswordReset(email) {
  const response = await api.post("/auth/password-reset/", {
    email,
  });

  return response.data;
}

export async function confirmPasswordReset(resetData) {
  const response = await api.post(
    "/auth/password-reset/confirm/",
    resetData
  );

  return response.data;
}