import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function getLastMessagePreview(lastMessage) {
  if (!lastMessage) {
    return "No messages yet.";
  }

  return lastMessage.content || "Message unavailable.";
}

function getOtherParticipantName(conversation, currentUserId) {
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

export default function ConversationCard({ conversation }) {
  const { user } = useAuth();

  const otherParticipantName = getOtherParticipantName(
    conversation,
    user?.id
  );

  return (
    <Link
      to={`/messages/${conversation.id}`}
      className="group block rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-base font-bold text-teal-800">
            {otherParticipantName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-teal-700">
              Active conversation
            </p>

            <h2 className="mt-1 truncate text-lg font-bold text-slate-950 transition group-hover:text-teal-800">
              {otherParticipantName}
            </h2>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {getLastMessagePreview(conversation.last_message)}
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          Chat
        </span>
      </div>
    </Link>
  );
}