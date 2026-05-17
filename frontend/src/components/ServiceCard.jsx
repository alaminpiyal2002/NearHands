import { Link } from "react-router-dom";

function ServiceCard({ service }) {
  const priceText =
    service.pricing_type === "negotiable"
      ? "Negotiable"
      : service.price
        ? `৳${service.price}`
        : "Price not set";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {service.category?.name ||
              service.category_name ||
              "Uncategorized"}
          </p>

          <h2 className="mt-4 line-clamp-2 text-lg font-bold leading-snug text-slate-950 transition group-hover:text-teal-800 sm:text-xl">
            {service.title || "Untitled service"}
          </h2>
        </div>

        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium capitalize text-slate-600">
          {service.pricing_type || "service"}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {service.description || "No description provided."}
      </p>

      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-slate-500">Location</p>

          <p className="mt-1 truncate font-semibold text-slate-900">
            {service.location || "Not specified"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">Price</p>

          <p className="mt-1 font-semibold text-slate-900">{priceText}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-5">
        <p className="text-sm text-slate-500">
          Views{" "}
          <span className="font-semibold text-slate-800">
            {service.view_count || 0}
          </span>
        </p>

        <Link
          to={`/services/${service.id}`}
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export default ServiceCard;