import { Link } from "react-router-dom";

function formatBudget(request) {
  if (request.budget_min && request.budget_max) {
    return `৳${request.budget_min} - ৳${request.budget_max}`;
  }

  if (request.budget_min) {
    return `From ৳${request.budget_min}`;
  }

  if (request.budget_max) {
    return `Up to ৳${request.budget_max}`;
  }

  return "Budget not specified";
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not specified";
  }

  return new Date(dateValue).toLocaleDateString();
}

function getStatusClasses(status) {
  if (status === "fulfilled") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "expired") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-teal-200 bg-teal-50 text-teal-700";
}

function RequestCard({ request }) {
  const budgetText = formatBudget(request);
  const statusClasses = getStatusClasses(request.status);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {request.category_name ||
              request.category?.name ||
              "Uncategorized"}
          </p>

          <h2 className="mt-4 line-clamp-2 text-lg font-bold leading-snug text-slate-950 transition group-hover:text-teal-800 sm:text-xl">
            {request.title || "Untitled request"}
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusClasses}`}
        >
          {request.status || "open"}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {request.description || "No description provided."}
      </p>

      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-slate-500">Budget</span>
          <span className="text-right font-semibold text-slate-900">
            {budgetText}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-slate-500">Deadline</span>
          <span className="text-right font-semibold text-slate-900">
            {formatDate(request.deadline)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-slate-500">Responses</span>
          <span className="text-right font-semibold text-slate-900">
            {request.response_count || 0}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Link
          to={`/requests/${request.id}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export default RequestCard;