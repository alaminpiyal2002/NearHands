import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getConversationMessages,
  getConversations,
} from "../api/chatApi";
import { extractErrorMessage } from "../utils/authResponse";
import { getPaginatedResults } from "../utils/pagination";
import { buildChatWebSocketUrl } from "../utils/websocket";
import { useAuth } from "../contexts/useAuth";
import { useNotifications } from "../contexts/useNotifications";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import MessageBubble from "../components/MessageBubble";

function normalizeNotificationLink(link) {
  if (!link) return "";

  return link.replace(/\/+$/, "");
}

function getSocketStatusClasses(status) {
  if (status === "Connected") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "Connecting") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "Error" || status === "Connection failed") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function getOtherParticipantName(conversation, currentUserId) {
  if (!conversation) {
    return "";
  }

  const participantOneId = Number(conversation.participant_1_id);
  const participantTwoId = Number(conversation.participant_2_id);

  if (Number(currentUserId) === participantOneId) {
    return conversation.participant_2_username || "Other user";
  }

  if (Number(currentUserId) === participantTwoId) {
    return conversation.participant_1_username || "Other user";
  }

  return "Other user";
}

export default function ChatWindowPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { notifications, markRead } = useNotifications();

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const readReceiptSentIdsRef = useRef(new Set());
  const markedNotificationIdsRef = useRef(new Set());

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [socketStatus, setSocketStatus] = useState("Connecting");

  const markCurrentConversationNotificationsRead = useCallback(async () => {
    const currentConversationLink = `/messages/${id}`;

    const unreadCurrentConversationNotifications = notifications.filter(
      (notification) => {
        const notificationLink = normalizeNotificationLink(notification.link);

        return (
          !notification.is_read &&
          notificationLink === currentConversationLink &&
          !markedNotificationIdsRef.current.has(Number(notification.id))
        );
      }
    );

    for (const notification of unreadCurrentConversationNotifications) {
      markedNotificationIdsRef.current.add(Number(notification.id));
      await markRead(notification.id);
    }
  }, [id, notifications, markRead]);

  useEffect(() => {
    readReceiptSentIdsRef.current = new Set();
    markedNotificationIdsRef.current = new Set();
  }, [id]);

  useEffect(() => {
    async function loadConversationData() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [messageData, conversationData] = await Promise.all([
          getConversationMessages(id),
          getConversations(),
        ]);

        const loadedMessages = getPaginatedResults(messageData);
        const loadedConversations = getPaginatedResults(conversationData);

        const currentConversation = loadedConversations.find(
          (item) => Number(item.id) === Number(id)
        );

        setMessages(loadedMessages);
        setConversation(currentConversation || null);
      } catch (error) {
        setErrorMessage(
          extractErrorMessage(error, "Could not load this conversation.")
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadConversationData();
  }, [id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void markCurrentConversationNotificationsRead();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [markCurrentConversationNotificationsRead]);

  useEffect(() => {
    let socket;
    let websocketUrl;

    try {
      websocketUrl = buildChatWebSocketUrl(id);
    } catch (error) {
      setTimeout(() => {
        setSocketStatus("Connection failed");
        setErrorMessage(error.message);
      }, 0);

      return undefined;
    }

    socket = new WebSocket(websocketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setSocketStatus("Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connection_established") {
        return;
      }

      if (data.type === "chat_message") {
        const incomingMessage = {
          id: data.message_id || data.id,
          sender_id: data.sender_id,
          sender_username: data.sender_username || "",
          content: data.content || data.message || "",
          timestamp: data.timestamp,
          is_read: false,
        };

        setMessages((currentMessages) => [
          ...currentMessages,
          incomingMessage,
        ]);

        setIsOtherUserTyping(false);

        const messageIsFromOtherUser =
          Number(incomingMessage.sender_id) !== Number(user?.id);

        if (messageIsFromOtherUser) {
          sendMessageReadReceipt(incomingMessage.id);
        }
      }

      if (data.type === "message_read" || data.type === "read_receipt") {
        const readMessageId = data.message_id || data.id;

        setMessages((currentMessages) =>
          currentMessages.map((message) => {
            if (Number(message.id) !== Number(readMessageId)) {
              return message;
            }

            return {
              ...message,
              is_read: true,
            };
          })
        );
      }

      if (data.type === "typing") {
        const typingUserIsCurrentUser =
          Number(data.sender_id) === Number(user?.id);

        if (!typingUserIsCurrentUser) {
          setIsOtherUserTyping(true);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, 1500);
        }
      }

      if (data.type === "error") {
        setErrorMessage(data.detail || "WebSocket error.");
      }
    };

    socket.onerror = () => {
      setSocketStatus("Error");
    };

    socket.onclose = () => {
      setSocketStatus("Disconnected");
    };

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socket.close();
    };
  }, [id, user?.id]);

  useEffect(() => {
    if (socketStatus !== "Connected") {
      return;
    }

    if (!user?.id) {
      return;
    }

    messages.forEach((message) => {
      const messageIsFromOtherUser =
        Number(message.sender_id) !== Number(user.id);

      const messageIsUnread = !message.is_read;

      if (messageIsFromOtherUser && messageIsUnread) {
        sendMessageReadReceipt(message.id);
      }
    });
  }, [messages, socketStatus, user?.id]);

  function sendMessageReadReceipt(messageId) {
    if (!messageId) {
      return;
    }

    if (readReceiptSentIdsRef.current.has(Number(messageId))) {
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "message_read",
        message_id: messageId,
      })
    );

    readReceiptSentIdsRef.current.add(Number(messageId));
  }

  function sendTypingEvent() {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "typing",
      })
    );
  }

  function handleDraftChange(event) {
    setDraftMessage(event.target.value);
    sendTypingEvent();
  }

  function handleSendMessage(event) {
    event.preventDefault();

    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setErrorMessage("Chat connection is not open yet.");
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "chat_message",
        message: trimmedMessage,
      })
    );

    setDraftMessage("");

    void markCurrentConversationNotificationsRead();
  }

  if (isLoading) {
    return <LoadingState message="Loading messages..." />;
  }

  if (errorMessage) {
    return (
      <ErrorState title="Could not load messages" message={errorMessage} />
    );
  }

  const socketStatusClasses = getSocketStatusClasses(socketStatus);
  const otherParticipantName = getOtherParticipantName(conversation, user?.id);

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-teal-100/60 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to="/messages"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-800"
            >
              <span>←</span>
              <span>Back to conversations</span>
            </Link>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Live conversation
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {otherParticipantName
                ? `Chat with ${otherParticipantName}`
                : `Conversation #${id}`}
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Send and receive messages in real time. Read receipts and typing
              activity help the conversation feel responsive.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <span
              className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold ${socketStatusClasses}`}
            >
              {socketStatus}
            </span>

            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              {messages.length} messages
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Conversation stream
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Messages update instantly while the WebSocket connection is active.
              </p>
            </div>

            {isOtherUserTyping && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-600" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-600 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-600 [animation-delay:240ms]" />
                </span>
                The other user is typing
              </div>
            )}
          </div>
        </div>

        <div className="bg-[linear-gradient(to_bottom,_rgba(248,250,252,0.85),_rgba(241,245,249,0.95))] p-4 sm:p-6">
          {messages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              message="Send the first message in this conversation."
            />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-4 sm:p-6">
          <form
            onSubmit={handleSendMessage}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-3 shadow-sm sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="chat-message"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Message
                </label>

                <div className="rounded-2xl border border-slate-300 bg-white px-4 py-1 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="chat-message"
                    type="text"
                    value={draftMessage}
                    onChange={handleDraftChange}
                    className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="Type your message..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={socketStatus !== "Connected"}
                className="inline-flex min-w-32 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}