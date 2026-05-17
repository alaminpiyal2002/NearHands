import api from "./axiosInstance";

export async function getConversations() {
  const response = await api.get("/conversations/");

  return response.data;
}

export async function getConversationMessages(conversationId) {
  const response = await api.get(`/conversations/${conversationId}/messages/`);

  return response.data;
}

export async function createConversation(participantId) {
  const response = await api.post("/conversations/", {
    participant_id: participantId,
  });

  return response.data;
}

export async function markMessageAsRead(messageId) {
  const response = await api.patch(`/messages/${messageId}/read/`);

  return response.data;
}