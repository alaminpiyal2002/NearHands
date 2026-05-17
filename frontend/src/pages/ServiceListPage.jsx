import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import { getServices } from "../api/servicesApi";
import { getPaginatedResults, getPaginationCount } from "../utils/pagination";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const initialFilters = {
  search: "",
  location: "",
  pricing_type: "",
  min_price: "",
  max_price: "",
  ordering: "-created_at",
};

function buildServiceParams(activeFilters) {
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

function ServiceListPage() {
  const [services, setServices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialServices() {
      try {
        const params = buildServiceParams(initialFilters);
        const data = await getServices(params);

        if (!isMounted) {
          return;
        }

        const results = getPaginatedResults(data);
        const count = getPaginationCount(data);

        setServices(results);
        setTotalCount(count);
        setStatus("success");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(error);
        setErrorMessage("Could not load services. Please check the backend.");
        setStatus("error");
      }
    }

    loadInitialServices();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadServices(activeFilters) {
    try {
      setStatus("loading");

      const params = buildServiceParams(activeFilters);
      const data = await getServices(params);

      const results = getPaginatedResults(data);
      const count = getPaginationCount(data);

      setServices(results);
      setTotalCount(count);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load services. Please check the backend.");
      setStatus("error");
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => {
      return {
        ...currentFilters,
        [name]: value,
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    loadServices(filters);
  }

  function handleClearFilters() {
    setFilters(initialFilters);
    loadServices(initialFilters);
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-16 h-48 w-48 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Explore services
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Discover local professionals ready to help.
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Browse active service listings, compare pricing approaches, and
              narrow down results by the needs that matter most.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Results found
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {totalCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Active service listings
            </p>
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
              Refine discovery
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Search and filters
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Filter by keyword, location, price range, and service type.
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
            Showing marketplace-ready listings
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
                placeholder="electrician, tutor, design..."
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-slate-800"
            >
              Location
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <input
                id="location"
                name="location"
                type="text"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="Dhaka"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="pricing_type"
              className="block text-sm font-semibold text-slate-800"
            >
              Pricing type
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <select
                id="pricing_type"
                name="pricing_type"
                value={filters.pricing_type}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none"
              >
                <option value="">Any pricing type</option>
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="min_price"
              className="block text-sm font-semibold text-slate-800"
            >
              Minimum price
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <input
                id="min_price"
                name="min_price"
                type="number"
                min="0"
                value={filters.min_price}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="max_price"
              className="block text-sm font-semibold text-slate-800"
            >
              Maximum price
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <input
                id="max_price"
                name="max_price"
                type="number"
                min="0"
                value={filters.max_price}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="3000"
              />
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
                <option value="price">Price low to high</option>
                <option value="-price">Price high to low</option>
                <option value="-view_count">Most viewed</option>
                <option value="-provider__profile__average_rating">
                  Highest rated
                </option>
              </select>
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
        <LoadingState message="Loading services..." />
      )}

      {status === "error" && <ErrorState message={errorMessage} />}

      {status === "success" && services.length === 0 && (
        <EmptyState
          title="No services found"
          message="Try changing your search or filter values."
        />
      )}

      {status === "success" && services.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ServiceListPage;