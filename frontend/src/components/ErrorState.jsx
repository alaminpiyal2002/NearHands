function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
}) {
  return (
    <div className="rounded-[1.75rem] border border-red-200 bg-red-50/90 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-xl font-black text-red-700">
          !
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-700">
            Attention
          </p>

          <h2 className="mt-1 text-xl font-bold text-red-950">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-red-800 sm:text-base">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ErrorState;