import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createService,
  deleteService,
  getCategories,
  getMyServices,
  updateService,
} from "../api/servicesApi";
import { getPaginatedResults } from "../utils/pagination";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const initialFormData = {
  title: "",
  description: "",
  category_id: "",
  pricing_type: "fixed",
  price: "",
  location: "",
};

function ProviderDashboardPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState(initialFormData);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadDashboardData() {
    try {
      setStatus("loading");
      setErrorMessage("");

      const [serviceData, categoryData] = await Promise.all([
        getMyServices(),
        getCategories(),
      ]);

      setServices(getPaginatedResults(serviceData));
      setCategories(getPaginatedResults(categoryData));
      setStatus("success");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load your dashboard data.");
      setStatus("error");
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDashboardData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function buildServicePayload() {
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category_id: Number(formData.category_id),
      pricing_type: formData.pricing_type,
      location: formData.location.trim(),
    };

    if (formData.pricing_type === "negotiable") {
      payload.price = null;
    } else {
      payload.price = formData.price;
    }

    return payload;
  }

  function extractFormError(error) {
    const data = error.response?.data;

    if (!data) {
      return "Could not create service. Please try again.";
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }

    const firstField = Object.keys(data)[0];

    if (firstField && Array.isArray(data[firstField])) {
      return data[firstField][0];
    }

    return "Could not create service. Please check your form and try again.";
  }

  async function handleCreateService(event) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!formData.title.trim()) {
      setFormError("Service title is required.");
      return;
    }

    if (!formData.description.trim()) {
      setFormError("Service description is required.");
      return;
    }

    if (!formData.category_id) {
      setFormError("Please choose a category.");
      return;
    }

    if (formData.pricing_type !== "negotiable" && !formData.price) {
      setFormError("Price is required for fixed or hourly services.");
      return;
    }

    try {
      setSubmitStatus("submitting");

      await createService(buildServicePayload());

      setFormData(initialFormData);
      setSuccessMessage("Service created successfully.");

      await loadDashboardData();
    } catch (error) {
      console.error(error);
      setFormError(extractFormError(error));
    } finally {
      setSubmitStatus("idle");
    }
  }

  async function handleToggleActive(service) {
    try {
      await updateService(service.id, {
        is_active: !service.is_active,
      });

      await loadDashboardData();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not update service status.");
      setStatus("error");
    }
  }

  async function handleDeleteService(serviceId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteService(serviceId);
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not delete this service.");
      setStatus("error");
    }
  }

  const activeServiceCount = services.filter(
    (service) => service.is_active
  ).length;

  const inactiveServiceCount = services.filter(
    (service) => !service.is_active
  ).length;

  const totalViews = services.reduce((sum, service) => {
    return sum + Number(service.view_count || 0);
  }, 0);

  if (status === "loading") {
    return <LoadingState message="Loading provider dashboard..." />;
  }

  if (status === "error") {
    return (
      <section className="space-y-4">
        <ErrorState title="Dashboard unavailable" message={errorMessage} />

        <button
          type="button"
          onClick={loadDashboardData}
          className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Provider workspace
            </p>

            <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Manage your services from one focused dashboard.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Create new listings, monitor visibility, and control whether each
              service is actively shown to customers.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Listings
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {services.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Total created
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Active
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-teal-700">
                {activeServiceCount}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Visible now
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Views
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {totalViews}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Across services
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCreateService}
        className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-sm"
      >
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Add a listing
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Create a new service
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Publish a clear service listing so customers can discover and
            contact you with confidence.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          {formError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
              <p className="font-semibold text-red-800">
                Service could not be created
              </p>

              <p className="mt-1">{formError}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-700">
              <p className="font-semibold text-green-800">
                Service created
              </p>

              <p className="mt-1">{successMessage}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-slate-800"
              >
                Service title
              </label>

              <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Emergency home electrical repair"
                  className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-semibold text-slate-800"
              >
                Category
              </label>

              <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none"
                >
                  <option value="">Choose a category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-800"
            >
              Description
            </label>

            <div className="mt-2 rounded-[1.75rem] border border-slate-300 bg-slate-50/70 px-4 py-2 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what you offer, your experience, and what customers can expect."
                className="w-full resize-none bg-transparent py-2 text-sm leading-7 text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                  Pricing and location
                </p>

                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  Service availability details
                </h3>
              </div>

              <p className="text-sm text-slate-500">
                These values shape how your service appears publicly.
              </p>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label
                  htmlFor="pricing_type"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Pricing type
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-white px-4 py-1 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
                  <select
                    id="pricing_type"
                    name="pricing_type"
                    value={formData.pricing_type}
                    onChange={handleChange}
                    className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Price
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-white px-4 py-1 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={formData.pricing_type === "negotiable"}
                    placeholder="1500"
                    className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
                  />
                </div>
              </div>

              <div className="md:col-span-2 xl:col-span-1">
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Location
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-white px-4 py-1 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Dhaka"
                    className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              New services appear in your dashboard immediately and can be
              managed from the listings section below.
            </p>

            <button
              type="submit"
              disabled={submitStatus === "submitting"}
              className="inline-flex min-w-48 items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
            >
              {submitStatus === "submitting"
                ? "Creating service..."
                : "Create service"}
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                Listing management
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                My service listings
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review active and inactive services, then update visibility as
                needed.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-3 text-center shadow-sm">
              <div className="px-2">
                <p className="text-lg font-bold text-slate-950">
                  {services.length}
                </p>
                <p className="text-xs text-slate-500">Total</p>
              </div>

              <div className="border-x border-slate-200 px-2">
                <p className="text-lg font-bold text-teal-700">
                  {activeServiceCount}
                </p>
                <p className="text-xs text-slate-500">Active</p>
              </div>

              <div className="px-2">
                <p className="text-lg font-bold text-slate-700">
                  {inactiveServiceCount}
                </p>
                <p className="text-xs text-slate-500">Paused</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {services.length === 0 ? (
            <EmptyState
              title="No services yet"
              message="Create your first service listing using the form above."
            />
          ) : (
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200">
              <div className="hidden grid-cols-6 gap-4 bg-slate-950 px-5 py-4 text-sm font-semibold text-white md:grid">
                <span className="col-span-2">Service</span>
                <span>Price</span>
                <span>Status</span>
                <span>Views</span>
                <span>Actions</span>
              </div>

              <div className="divide-y divide-slate-200 bg-white">
                {services.map((service) => {
                  const priceText =
                    service.pricing_type === "negotiable"
                      ? "Negotiable"
                      : service.price
                        ? `৳${service.price}`
                        : "Not set";

                  return (
                    <article
                      key={service.id}
                      className="grid gap-4 px-4 py-5 transition hover:bg-slate-50/80 md:grid-cols-6 md:items-center md:px-5"
                    >
                      <div className="md:col-span-2">
                        <Link
                          to={`/services/${service.id}`}
                          className="text-base font-semibold text-slate-950 transition hover:text-teal-700"
                        >
                          {service.title}
                        </Link>

                        <p className="mt-1 text-sm text-slate-500">
                          {service.category?.name ||
                            service.category_name ||
                            "Uncategorized"}
                        </p>
                      </div>

                      <div className="text-sm font-medium text-slate-800">
                        <span className="md:hidden font-semibold text-slate-500">
                          Price:{" "}
                        </span>
                        {priceText}
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            service.is_active
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {service.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-slate-800">
                        <span className="md:hidden font-semibold text-slate-500">
                          Views:{" "}
                        </span>
                        {service.view_count || 0}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(service)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                        >
                          {service.is_active ? "Pause" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteService(service.id)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProviderDashboardPage;