function EmptyState({
  title = "Nothing found",
  message = "There is no data to show right now.",
  action = null,
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-7 text-center shadow-sm backdrop-blur sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-teal-50 text-2xl font-black text-slate-500 shadow-inner">
        ∅
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
        {message}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;