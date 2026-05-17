import { getAccessToken } from "./tokenStorage";

export function buildChatWebSocketUrl(conversationId) {
  const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL;
  const token = getAccessToken();

  if (!wsBaseUrl) {
    throw new Error("VITE_WS_BASE_URL is not configured.");
  }

  if (!token) {
    throw new Error("No access token found for WebSocket connection.");
  }

  return `${wsBaseUrl}/ws/chat/${conversationId}/?token=${token}`;
}

export function buildNotificationWebSocketUrl() {
  const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL;
  const token = getAccessToken();

  if (!wsBaseUrl) {
    throw new Error("VITE_WS_BASE_URL is not configured.");
  }

  if (!token) {
    throw new Error("No access token found for notification WebSocket.");
  }

  return `${wsBaseUrl}/ws/notifications/?token=${token}`;
}