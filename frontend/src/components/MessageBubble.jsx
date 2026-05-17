import { useAuth } from "../contexts/useAuth";
import { getUserDisplayName } from "../utils/authResponse";

function formatMessageTime(timestamp) {
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleString();
}

export default function MessageBubble({ message }) {
  const { user } = useAuth();

  const isMine = Number(message.sender_id) === Number(user?.id);

  const senderName = isMine
    ? getUserDisplayName(user)
    : message.sender_username || "Other user";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 shadow-sm sm:max-w-[75%] sm:px-5 sm:py-4 ${
          isMine
            ? "rounded-br-md bg-slate-950 text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6 sm:text-[15px]">
          {message.content}
        </p>

        <div
          className={`mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${
            isMine ? "text-slate-300" : "text-slate-500"
          }`}
        >
          <span className="font-medium">{senderName}</span>
          <span>•</span>
          <span>{formatMessageTime(message.timestamp)}</span>

          {isMine && (
            <>
              <span>•</span>
              <span className={message.is_read ? "text-teal-200" : ""}>
                {message.is_read ? "Read" : "Sent"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}