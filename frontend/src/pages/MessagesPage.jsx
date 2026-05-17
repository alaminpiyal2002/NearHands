import { useEffect, useState } from "react";
import ConversationCard from "../components/ConversationCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { getConversations } from "../api/chatApi";
import { extractErrorMessage } from "../utils/authResponse";
import { getPaginatedResults } from "../utils/pagination";

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadConversations() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getConversations();
        setConversations(getPaginatedResults(data));
      } catch (error) {
        setErrorMessage(
          extractErrorMessage(error, "Could not load your conversations.")
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading conversations..." />;
  }

  if (errorMessage) {
    return (
      <ErrorState
        title="Could not load conversations"
        message={errorMessage}
      />
    );
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Messages
            </p>

            <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Your live conversations, all in one place.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Open a conversation to continue customer-provider discussions,
              check recent messages, and stay connected through NearHands chat.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              Inbox snapshot
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm text-slate-300">Available conversations</p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-white">
                {conversations.length}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Conversations become available when users connect through a
                service or request flow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          message="When you start chatting with a provider or customer, conversations will appear here."
        />
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      )}
    </section>
  );
}