import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { NotificationContext } from "./notificationContextObject";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationsApi";
import { getPaginatedResults } from "../utils/pagination";
import { buildNotificationWebSocketUrl } from "../utils/websocket";

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const socketRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [notificationSocketStatus, setNotificationSocketStatus] =
    useState("Disconnected");

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.is_read).length;
  }, [notifications]);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    try {
      setIsLoadingNotifications(true);
      setNotificationError("");

      const data = await getNotifications();
      setNotifications(getPaginatedResults(data));
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotificationError("Could not load notifications.");
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadNotifications();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      const timeoutId = setTimeout(() => {
        setNotificationSocketStatus("Disconnected");
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }

    let socket;
    let websocketUrl;

    try {
      websocketUrl = buildNotificationWebSocketUrl();
    } catch (error) {
      console.error("Notification WebSocket URL error:", error);

      const timeoutId = setTimeout(() => {
        setNotificationSocketStatus("Connection failed");
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }

    socket = new WebSocket(websocketUrl);
    socketRef.current = socket;

    const connectingTimeoutId = setTimeout(() => {
      setNotificationSocketStatus("Connecting");
    }, 0);

    socket.onopen = () => {
      setNotificationSocketStatus("Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connection_established") {
        return;
      }

      if (data.type === "notification" && data.notification) {
        setNotifications((currentNotifications) => [
          data.notification,
          ...currentNotifications,
        ]);
      }
    };

    socket.onerror = () => {
      setNotificationSocketStatus("Error");
    };

    socket.onclose = () => {
      setNotificationSocketStatus("Disconnected");
    };

    return () => {
      clearTimeout(connectingTimeoutId);
      socket.close();
    };
  }, [isAuthenticated, user?.id]);

  async function markRead(notificationId) {
    await markNotificationAsRead(notificationId);

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => {
        if (Number(notification.id) !== Number(notificationId)) {
          return notification;
        }

        return {
          ...notification,
          is_read: true,
        };
      })
    );
  }

  async function markAllRead() {
    await markAllNotificationsAsRead();

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  const value = {
    notifications,
    unreadCount,
    isLoadingNotifications,
    notificationError,
    notificationSocketStatus,
    loadNotifications,
    markRead,
    markAllRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}