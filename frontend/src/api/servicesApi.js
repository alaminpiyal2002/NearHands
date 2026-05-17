import api from "./axiosInstance";

export async function getServices(params = {}) {
  const response = await api.get("/services/", { params });

  return response.data;
}

export async function getServiceById(id) {
  const response = await api.get(`/services/${id}/`);

  return response.data;
}

export async function getCategories() {
  const response = await api.get("/categories/");

  return response.data;
}

export async function getTags() {
  const response = await api.get("/tags/");

  return response.data;
}

export async function getMyServices() {
  const response = await api.get("/services/my/");

  return response.data;
}

export async function createService(serviceData) {
  const response = await api.post("/services/", serviceData);

  return response.data;
}

export async function updateService(serviceId, serviceData) {
  const response = await api.patch(`/services/${serviceId}/`, serviceData);

  return response.data;
}

export async function deleteService(serviceId) {
  const response = await api.delete(`/services/${serviceId}/`);

  return response.data;
}