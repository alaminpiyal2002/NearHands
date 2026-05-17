import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPublicProfile } from "../api/authApi";
import { getServices } from "../api/servicesApi";
import { getReviews, createReview } from "../api/reviewsApi";
import { getPaginatedResults } from "../utils/pagination";
import { useAuth } from "../contexts/useAuth";
import ServiceCard from "../components/ServiceCard";
import StarRating from "../components/StarRating";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const initialReviewForm = {
  rating: 5,
  comment: "",
};

function extractReviewError(error) {
  const data = error.response?.data;

  if (!data) {
    return "Could not submit review. Please try again.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.non_field_errors)) {
    return data.non_field_errors[0];
  }

  if (Array.isArray(data.provider)) {
    return data.provider[0];
  }

  if (Array.isArray(data.rating)) {
    return data.rating[0];
  }

  if (Array.isArray(data.comment)) {
    return data.comment[0];
  }

  return "Could not submit review. Please check your form and try again.";
}

function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [reviewStatus, setReviewStatus] = useState("idle");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  function getCurrentUserId() {
    return user?.id || user?.user?.id || user?.profile?.user || null;
  }

  function getCurrentUserRole() {
    return user?.role || user?.profile?.role || "";
  }

  const loadProviderProfile = useCallback(async () => {
    try {
      setStatus("loading");
      setErrorMessage("");

      const [profileData, serviceData, reviewData] = await Promise.all([
        getPublicProfile(id),
        getServices({
          provider: id,
          page_size: 6,
          ordering: "-created_at",
        }),
        getReviews({
          provider: id,
          page_size: 6,
        }),
      ]);

      setProfile(profileData);
      setServices(getPaginatedResults(serviceData));
      setReviews(getPaginatedResults(reviewData));
      setStatus("success");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Could not load this provider profile. The provider may not exist."
      );
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadProviderProfile();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadProviderProfile]);

  function handleReviewCommentChange(event) {
    setReviewForm((currentForm) => ({
      ...currentForm,
      comment: event.target.value,
    }));
  }

  function handleReviewRatingChange(rating) {
    setReviewForm((currentForm) => ({
      ...currentForm,
      rating,
    }));
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    setReviewError("");
    setReviewSuccess("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (getCurrentUserRole() !== "customer") {
      setReviewError("Only customers can submit reviews.");
      return;
    }

    if (String(getCurrentUserId()) === String(id)) {
      setReviewError("You cannot review yourself.");
      return;
    }

    if (!reviewForm.rating) {
      setReviewError("Please choose a rating.");
      return;
    }

    try {
      setReviewStatus("submitting");

      await createReview({
        provider: Number(id),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });

      setReviewForm(initialReviewForm);
      setReviewSuccess("Review submitted successfully.");

      await loadProviderProfile();
    } catch (error) {
      console.error(error);
      setReviewError(extractReviewError(error));
    } finally {
      setReviewStatus("idle");
    }
  }

  if (status === "loading") {
    return <LoadingState message="Loading provider profile..." />;
  }

  if (status === "error") {
    return (
      <section className="space-y-4">
        <ErrorState title="Provider not available" message={errorMessage} />

        <Link
          to="/services"
          className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Back to services
        </Link>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="space-y-4">
        <ErrorState
          title="Provider not found"
          message="This provider profile could not be found."
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

  const profileInitial = (profile.display_name || profile.username || "P")
    .charAt(0)
    .toUpperCase();

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
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:p-10">
          <div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br from-teal-600 via-teal-700 to-slate-950 text-4xl font-black text-white shadow-xl shadow-teal-900/15">
                {profileInitial}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                    {profile.display_name || profile.username}
                  </h1>

                  {profile.is_verified && (
                    <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium capitalize text-slate-600">
                    {profile.role}
                  </span>

                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
                    {profile.location || "Location not specified"}
                  </span>
                </div>

                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
                  {profile.bio || "This provider has not added a bio yet."}
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              Reputation snapshot
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm text-slate-300">Average rating</p>

              <div className="mt-3">
                <StarRating
                  value={Math.round(Number(profile.average_rating || 0))}
                  readonly
                />
              </div>

              <p className="mt-4 text-4xl font-bold tracking-tight text-white">
                {profile.average_rating || "0.0"}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {profile.review_count || 0} reviews received
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Listed services
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {services.length}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Recent reviews
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {reviews.length}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Provider services
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Services by this provider
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Browse active listings and explore what this provider currently
            offers.
          </p>
        </div>

        <div className="p-5 sm:p-7">
          {services.length === 0 ? (
            <EmptyState
              title="No services yet"
              message="This provider does not have active service listings right now."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-7 sm:py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Leave feedback
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Review this provider
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Customers can share their experience and help strengthen trust in
              the marketplace.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {!isAuthenticated ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-sm leading-6 text-slate-700">
                  Please log in as a customer to leave a review.
                </p>

                <Link
                  to="/login"
                  className="mt-4 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Login to review
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                {reviewError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                    <p className="font-semibold text-red-800">
                      Review could not be submitted
                    </p>
                    <p className="mt-1">{reviewError}</p>
                  </div>
                )}

                {reviewSuccess && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-700">
                    <p className="font-semibold text-green-800">
                      Review submitted
                    </p>
                    <p className="mt-1">{reviewSuccess}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Rating
                  </label>

                  <div className="mt-3">
                    <StarRating
                      value={reviewForm.rating}
                      onChange={handleReviewRatingChange}
                      size="lg"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Comment
                  </label>

                  <div className="mt-2 rounded-[1.75rem] border border-slate-300 bg-slate-50/70 px-4 py-2 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                    <textarea
                      id="comment"
                      name="comment"
                      rows="5"
                      value={reviewForm.comment}
                      onChange={handleReviewCommentChange}
                      placeholder="Share your experience with this provider."
                      className="w-full resize-none bg-transparent py-2 text-sm leading-7 text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={reviewStatus === "submitting"}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 sm:w-auto"
                >
                  {reviewStatus === "submitting"
                    ? "Submitting review..."
                    : "Submit review"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-7 sm:py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Customer feedback
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Recent reviews
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              These reviews help customers understand reliability, quality, and
              response experience.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                message="This provider has not received any reviews yet."
              />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {review.customer_username || "Customer"}
                        </p>

                        <div className="mt-2">
                          <StarRating value={review.rating} readonly />
                        </div>
                      </div>

                      <p className="text-sm text-slate-500">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString()
                          : ""}
                      </p>
                    </div>

                    {review.comment && (
                      <p className="mt-4 text-sm leading-7 text-slate-700">
                        {review.comment}
                      </p>
                    )}

                    {review.response && (
                      <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-sm font-semibold text-slate-950">
                          Provider response
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {review.response}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProviderProfilePage;