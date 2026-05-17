import api from "./axiosInstance";

export async function getServiceRequests(params = {}) {
  const response = await api.get("/requests/", { params });

  return response.data;
}

export async function getServiceRequestById(id) {
  const response = await api.get(`/requests/${id}/`);

  return response.data;
}

export async function createServiceRequest(requestData) {
  const response = await api.post("/requests/", requestData);

  return response.data;
}

export async function respondToServiceRequest(id) {
  const response = await api.post(`/requests/${id}/respond/`);

  return response.data;
}