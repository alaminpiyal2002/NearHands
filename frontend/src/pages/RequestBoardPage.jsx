import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RequestCard from "../components/RequestCard";
import { getCategories } from "../api/servicesApi";
import { getServiceRequests } from "../api/requestsApi";
import { getPaginatedResults, getPaginationCount } from "../utils/pagination";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const initialFilters = {
  search: "",
  category: "",
  min_budget: "",
  max_budget: "",
  deadline_before: "",
  deadline_after: "",
  ordering: "-created_at",
};

function buildRequestParams(activeFilters) {
  const params = {
    page_size: 12,
  };

  Object.entries(activeFilters).forEach(([key, value]) => {
    if (value !== "") {
      params[key] = value;
    }
  });

  return params;
}

function RequestBoardPage() {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setStatus("loading");
        setErrorMessage("");

        const [requestData, categoryData] = await Promise.all([
          getServiceRequests(buildRequestParams(initialFilters)),
          getCategories(),
        ]);

        if (!isMounted) {
          return;
        }

        const requestResults = getPaginatedResults(requestData);
        const requestCount = getPaginationCount(requestData);
        const categoryResults = getPaginatedResults(categoryData);

        setRequests(requestResults);
        setTotalCount(requestCount);
        setCategories(categoryResults);
        setStatus("success");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(error);
        setErrorMessage(
          "Could not load service requests. Please check the backend."
        );
        setStatus("error");
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadRequests(activeFilters) {
    try {
      setStatus("loading");
      setErrorMessage("");

      const params = buildRequestParams(activeFilters);
      const data = await getServiceRequests(params);

      const results = getPaginatedResults(data);
      const count = getPaginationCount(data);

      setRequests(results);
      setTotalCount(count);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Could not load service requests. Please check the backend."
      );
      setStatus("error");
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadRequests(filters);
  }

  function handleClearFilters() {
    setFilters(initialFilters);
    loadRequests(initialFilters);
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-16 h-48 w-48 rounded-full bg-teal-100/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Request board
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              See what customers nearby need right now.
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Browse open service requests, understand real local demand, and
              respond where your skills fit best.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Open requests
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                {totalCount}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Matching marketplace posts
              </p>
            </div>

            <Link
              to="/requests/new"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              Post a request
            </Link>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm sm:p-7"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Search demand
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Filter customer requests
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Narrow results by category, budget, deadline, and relevance.
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
            Built for provider discovery
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-semibold text-slate-800"
            >
              Search keyword
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <input
                id="search"
                name="search"
                type="text"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="plumber, repair, tutor..."
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
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none"
              >
                <option value="">Any category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="ordering"
              className="block text-sm font-semibold text-slate-800"
            >
              Sort by
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <select
                id="ordering"
                name="ordering"
                value={filters.ordering}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none"
              >
                <option value="-created_at">Newest first</option>
                <option value="created_at">Oldest first</option>
                <option value="budget_min">Budget low to high</option>
                <option value="-budget_max">Budget high to low</option>
                <option value="deadline">Deadline soonest</option>
                <option value="-response_count">Most responses</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="min_budget"
              className="block text-sm font-semibold text-slate-800"
            >
              Minimum budget
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <input
                id="min_budget"
                name="min_budget"
                type="number"
                min="0"
                value={filters.min_budget}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="max_budget"
              className="block text-sm font-semibold text-slate-800"
            >
              Maximum budget
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <input
                id="max_budget"
                name="max_budget"
                type="number"
                min="0"
                value={filters.max_budget}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="3000"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="deadline_before"
              className="block text-sm font-semibold text-slate-800"
            >
              Deadline before
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <input
                id="deadline_before"
                name="deadline_before"
                type="date"
                value={filters.deadline_before}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="deadline_after"
              className="block text-sm font-semibold text-slate-800"
            >
              Deadline after
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <input
                id="deadline_after"
                name="deadline_after"
                type="date"
                value={filters.deadline_after}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
          >
            Apply filters
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
          >
            Clear filters
          </button>
        </div>
      </form>

      {status === "loading" && (
        <LoadingState message="Loading service requests..." />
      )}

      {status === "error" && <ErrorState message={errorMessage} />}

      {status === "success" && requests.length === 0 && (
        <EmptyState
          title="No open requests found"
          message="Try changing your search or filter values, or post a new request."
        />
      )}

      {status === "success" && requests.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </section>
  );
}

export default RequestBoardPage;