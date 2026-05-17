function LoadingState({ message = "Loading..." }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-700" />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Please wait
          </p>

          <p className="mt-1 text-base font-medium text-slate-700">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingState;