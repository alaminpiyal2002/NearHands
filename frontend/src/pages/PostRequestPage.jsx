import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../api/servicesApi";
import { createServiceRequest } from "../api/requestsApi";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const initialFormData = {
  title: "",
  description: "",
  category: "",
  budget_min: "",
  budget_max: "",
  deadline: "",
};

function PostRequestPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        setStatus("loading");
        setErrorMessage("");

        const data = await getCategories();

        const categoryList = Array.isArray(data) ? data : data.results || [];

        setCategories(categoryList);
        setStatus("success");
      } catch (error) {
        console.error(error);
        setErrorMessage("Could not load categories.");
        setStatus("error");
      }
    }

    loadCategories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function buildPayload() {
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: Number(formData.category),
      budget_min: formData.budget_min || null,
      budget_max: formData.budget_max || null,
      deadline: formData.deadline || null,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");

    if (!formData.title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage("Description is required.");
      return;
    }

    if (!formData.category) {
      setErrorMessage("Please choose a category.");
      return;
    }

    try {
      setSubmitStatus("submitting");

      const createdRequest = await createServiceRequest(buildPayload());

      navigate(`/requests/${createdRequest.id}`);
    } catch (error) {
      console.error(error);

      const detail =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        "Could not create service request. Please check your form and try again.";

      setErrorMessage(detail);
      setSubmitStatus("idle");
    }
  }

  if (status === "loading") {
    return <LoadingState message="Loading request form..." />;
  }

  if (status === "error") {
    return (
      <section className="space-y-4">
        <ErrorState title="Form unavailable" message={errorMessage} />

        <Link
          to="/requests"
          className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Back to requests
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <Link
        to="/requests"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-800"
      >
        <span>←</span>
        <span>Back to requests</span>
      </Link>

      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-teal-100/60 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Create request
            </p>

            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Tell local providers exactly what you need.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              A strong request helps providers understand the work, estimate the
              effort, and respond with confidence.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              Writing guide
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold text-white">
                  Be specific
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Describe the problem, timing, and expected help clearly.
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold text-white">
                  Add a realistic budget
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Optional budget fields help providers assess fit faster.
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold text-white">
                  Include a deadline
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  A date gives nearby providers a better response context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-sm"
      >
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Request details
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Build your service request
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Fill in the core details below. Required fields help keep the
            request clear and actionable.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
              <p className="font-semibold text-red-800">
                Request could not be posted
              </p>

              <p className="mt-1">{errorMessage}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-slate-800"
              >
                Request title
              </label>

              <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Need a plumber for bathroom leakage"
                  className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-slate-800"
              >
                Category
              </label>

              <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
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
                rows="7"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain the problem, location details, timing, and anything providers should know."
                className="w-full resize-none bg-transparent py-2 text-sm leading-7 text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                  Budget and timing
                </p>

                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  Optional request context
                </h3>
              </div>

              <p className="text-sm text-slate-500">
                These fields help providers respond faster.
              </p>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label
                  htmlFor="budget_min"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Minimum budget
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-white px-4 py-1 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="budget_min"
                    name="budget_min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget_min}
                    onChange={handleChange}
                    placeholder="800"
                    className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="budget_max"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Maximum budget
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-white px-4 py-1 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="budget_max"
                    name="budget_max"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget_max}
                    onChange={handleChange}
                    placeholder="2000"
                    className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="md:col-span-2 xl:col-span-1">
                <label
                  htmlFor="deadline"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Deadline
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-white px-4 py-1 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Once submitted, your request becomes visible on the public request
              board for providers to review and respond.
            </p>

            <button
              type="submit"
              disabled={submitStatus === "submitting"}
              className="inline-flex min-w-48 items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
            >
              {submitStatus === "submitting"
                ? "Posting request..."
                : "Post request"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default PostRequestPage;