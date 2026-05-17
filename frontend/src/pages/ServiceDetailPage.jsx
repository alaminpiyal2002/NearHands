import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getServiceById } from "../api/servicesApi";
import { createConversation } from "../api/chatApi";
import { useAuth } from "../contexts/useAuth";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [service, setService] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [isStartingChat, setIsStartingChat] = useState(false);
  const [chatError, setChatError] = useState("");

  function getCurrentUserId() {
    return user?.id || user?.user?.id || user?.profile?.user || null;
  }

  useEffect(() => {
    async function loadService() {
      try {
        setStatus("loading");
        setErrorMessage("");

        const data = await getServiceById(id);

        setService(data);
        setStatus("success");
      } catch (error) {
        console.error(error);
        setErrorMessage("Could not load this service.");
        setStatus("error");
      }
    }

    loadService();
  }, [id]);

  async function handleContactProvider() {
    setChatError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const providerId = service?.provider_id;
    const currentUserId = getCurrentUserId();

    if (!providerId) {
      setChatError("Provider information is missing for this service.");
      return;
    }

    if (String(providerId) === String(currentUserId)) {
      setChatError("You cannot start a conversation with yourself.");
      return;
    }

    try {
      setIsStartingChat(true);

      const conversation = await createConversation(providerId);

      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      console.error(error);
      setChatError("Could not start chat. Please try again.");
    } finally {
      setIsStartingChat(false);
    }
  }

  if (status === "loading") {
    return <LoadingState message="Loading service details..." />;
  }

  if (status === "error") {
    return (
      <section className="space-y-4">
        <ErrorState title="Service not available" message={errorMessage} />

        <Link
          to="/services"
          className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Back to services
        </Link>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="space-y-4">
        <ErrorState
          title="Service not found"
          message="This service could not be found."
        />

        <Link
          to="/services"
          className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Back to services
        </Link>
      </section>
    );
  }

  const priceText =
    service.pricing_type === "negotiable"
      ? "Negotiable"
      : service.price
        ? `৳${service.price}`
        : "Price not set";

  return (
    <section className="space-y-8">
      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-800"
      >
        <span>←</span>
        <span>Back to services</span>
      </Link>

      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                {service.category?.name ||
                  service.category_name ||
                  "Uncategorized"}
              </span>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium capitalize text-slate-600">
                {service.pricing_type || "Not specified"}
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              {service.title}
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Provided by{" "}
              {service.provider_id ? (
                <Link
                  to={`/profile/${service.provider_id}`}
                  className="font-semibold text-teal-700 transition hover:text-teal-800 hover:underline"
                >
                  {service.provider_name || "Unknown provider"}
                </Link>
              ) : (
                <span className="font-semibold text-slate-900">
                  {service.provider_name || "Unknown provider"}
                </span>
              )}
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Location
                </p>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                  {service.location || "Not specified"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Views
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {service.view_count || 0}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Enquiries
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {service.enquiry_count || 0}
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              Service overview
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm text-slate-300">Starting price</p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                {priceText}
              </p>

              <p className="mt-2 text-sm capitalize text-slate-300">
                {service.pricing_type || "Not specified"}
              </p>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">
                Interested in this service?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Start a direct conversation with the provider to discuss
                availability, pricing, and service details.
              </p>

              <button
                type="button"
                onClick={handleContactProvider}
                disabled={isStartingChat}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300"
              >
                {isStartingChat ? "Opening chat..." : "Contact Provider"}
              </button>

              {chatError && (
                <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
                  {chatError}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            About this service
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            Service description
          </h2>

          <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">
            {service.description || "No description provided."}
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            Details
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            Service tags
          </h2>

          {service.tags && service.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {service.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-slate-600">
              No additional tags were added for this service.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailPage;