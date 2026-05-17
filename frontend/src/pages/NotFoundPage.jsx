import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="relative mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 px-5 py-10 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-100/80 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />

      <div className="relative grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="flex justify-center lg:justify-start">
          <div className="relative flex h-64 w-64 items-center justify-center rounded-[3rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/20 sm:h-72 sm:w-72">
            <div className="absolute inset-5 rounded-[2.4rem] border border-white/10 bg-white/5" />

            <div className="relative text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-200">
                Error
              </p>

              <p className="mt-4 text-7xl font-black leading-none tracking-tight sm:text-8xl">
                404
              </p>

              <p className="mt-3 text-sm font-medium text-slate-300">
                Page not found
              </p>
            </div>
          </div>
        </div>

        <div className="text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            Lost in NearHands?
          </p>

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            This page wandered away from the marketplace.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 lg:mx-0">
            The route you opened does not exist, may have changed, or may have
            been entered incorrectly. Head back to the homepage and continue
            exploring NearHands.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Go home
            </Link>

            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
            >
              Browse services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
