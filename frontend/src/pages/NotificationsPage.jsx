import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { useNotifications } from "../contexts/useNotifications";

function formatNotificationTime(timestamp) {
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleString();
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

function getNotificationAccentClasses(isRead) {
  return isRead
    ? "border-slate-200 bg-white hover:border-slate-300"
    : "border-teal-200 bg-gradient-to-br from-teal-50 to-white hover:border-teal-300";
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoadingNotifications,
    notificationError,
    notificationSocketStatus,
    markRead,
    markAllRead,
  } = useNotifications();

  if (isLoadingNotifications) {
    return <LoadingState message="Loading notifications..." />;
  }

  if (notificationError) {
    return (
      <ErrorState
        title="Could not load notifications"
        message={notificationError}
      />
    );
  }

  const socketStatusClasses = getSocketStatusClasses(
    notificationSocketStatus
  );

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Notifications
            </p>

            <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Stay updated with every important NearHands activity.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Messages, request responses, and other account activity appear
              here so you can follow what matters without missing context.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              Activity snapshot
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-sm text-slate-300">Unread notifications</p>

                <p className="mt-2 text-4xl font-bold tracking-tight text-white">
                  {unreadCount}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-sm text-slate-300">Live status</p>

                <span
                  className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${socketStatusClasses}`}
                >
                  {notificationSocketStatus}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300"
            >
              Mark all read
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                Notification center
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Recent activity
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review the latest updates and mark important items as read once
                handled.
              </p>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              {notifications.length} total
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {notifications.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              message="Messages, reviews, and request responses will appear here."
            />
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`rounded-[1.75rem] border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${getNotificationAccentClasses(
                    notification.is_read
                  )}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                          {notification.type}
                        </p>

                        {!notification.is_read && (
                          <span className="rounded-full bg-teal-700 px-3 py-1 text-xs font-semibold text-white">
                            New
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-lg font-bold leading-snug text-slate-950 sm:text-xl">
                        {notification.title}
                      </h3>

                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
                        {notification.body}
                      </p>

                      <p className="mt-4 text-xs font-medium text-slate-500">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() => markRead(notification.id)}
                        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-teal-700 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:text-white"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}