import api from "./axiosInstance";

export async function getReviews(params = {}) {
  const response = await api.get("/reviews/", { params });

  return response.data;
}

export async function createReview(reviewData) {
  const response = await api.post("/reviews/", reviewData);

  return response.data;
}

export async function respondToReview(reviewId, responseText) {
  const response = await api.patch(`/reviews/${reviewId}/respond/`, {
    response: responseText,
  });

  return response.data;
}