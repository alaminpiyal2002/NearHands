import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getServiceRequestById,
  respondToServiceRequest,
} from "../api/requestsApi";
import { createConversation } from "../api/chatApi";
import { useAuth } from "../contexts/useAuth";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [isResponding, setIsResponding] = useState(false);
  const [respondError, setRespondError] = useState("");

  function getCurrentUserId() {
    return user?.id || user?.user?.id || user?.profile?.user || null;
  }

  function getCurrentUserRole() {
    return user?.role || user?.profile?.role || "";
  }

  useEffect(() => {
    async function loadRequest() {
      try {
        setStatus("loading");
        setErrorMessage("");

        const data = await getServiceRequestById(id);

        setRequest(data);
        setStatus("success");
      } catch (error) {
        console.error(error);
        setErrorMessage("Could not load this service request.");
        setStatus("error");
      }
    }

    loadRequest();
  }, [id]);

  async function handleRespondToRequest() {
    setRespondError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const currentUserRole = getCurrentUserRole();
    const currentUserId = getCurrentUserId();
    const customerId = request?.customer_id;

    if (currentUserRole !== "provider") {
      setRespondError("Only providers can respond to service requests.");
      return;
    }

    if (!customerId) {
      setRespondError("Customer information is missing for this request.");
      return;
    }

    if (String(customerId) === String(currentUserId)) {
      setRespondError("You cannot respond to your own request.");
      return;
    }

    try {
      setIsResponding(true);

      await respondToServiceRequest(request.id);

      const conversation = await createConversation(customerId);

      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      console.error(error);
      setRespondError("Could not respond to this request. Please try again.");
    } finally {
      setIsResponding(false);
    }
  }

  if (status === "loading") {
    return <LoadingState message="Loading request details..." />;
  }

  if (status === "error") {
    return (
      <section className="space-y-4">
        <ErrorState title="Request not available" message={errorMessage} />

        <Link
          to="/requests"
          className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Back to requests
        </Link>
      </section>
    );
  }

  if (!request) {
    return (
      <section className="space-y-4">
        <ErrorState
          title="Request not found"
          message="This service request could not be found."
        />

        <Link
          to="/requests"
          className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Back to requests
        </Link>
      </section>
    );
  }

  const budgetText =
    request.budget_min && request.budget_max
      ? `৳${request.budget_min} - ৳${request.budget_max}`
      : request.budget_min
        ? `From ৳${request.budget_min}`
        : request.budget_max
          ? `Up to ৳${request.budget_max}`
          : "Budget not specified";

  return (
    <section className="space-y-8">
      <Link
        to="/requests"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-800"
      >
        <span>←</span>
        <span>Back to requests</span>
      </Link>

      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-teal-100/60 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                {request.category_name ||
                  request.category?.name ||
                  "Uncategorized"}
              </span>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium capitalize text-slate-600">
                {request.status || "open"}
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              {request.title}
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Posted by{" "}
              <span className="font-semibold text-slate-950">
                {request.customer_name || "Unknown customer"}
              </span>
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Deadline
                </p>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                  {request.deadline || "Not specified"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Responses
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {request.response_count || 0}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Created
                </p>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                  {request.created_at
                    ? new Date(request.created_at).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              Request overview
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm text-slate-300">Estimated budget</p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                {budgetText}
              </p>

              <p className="mt-2 text-sm capitalize text-slate-300">
                Current status: {request.status || "open"}
              </p>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">
                Can you help with this request?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Providers can respond and open a direct conversation with the
                customer.
              </p>

              <button
                type="button"
                onClick={handleRespondToRequest}
                disabled={isResponding}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300"
              >
                {isResponding ? "Opening chat..." : "Respond and chat"}
              </button>

              {respondError && (
                <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
                  {respondError}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
          Request details
        </p>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
          Description
        </h2>

        <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">
          {request.description || "No description provided."}
        </p>
      </div>
    </section>
  );
}

export default RequestDetailPage;