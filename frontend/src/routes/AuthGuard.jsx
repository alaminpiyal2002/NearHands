import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function AuthGuard({ children, roles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="relative mx-auto flex min-h-[55vh] max-w-3xl items-center justify-center overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 px-5 py-10 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-teal-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-cyan-100/70 blur-3xl" />

        <div className="relative w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/90 p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-teal-50">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-700" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            Authentication
          </p>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Checking your access
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
            NearHands is confirming your session before opening this protected
            area.
          </p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || user?.profile?.role;

  if (roles.length > 0 && !roles.includes(userRole)) {
    return (
      <section className="relative mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 px-5 py-10 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-red-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />

        <div className="relative grid w-full gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="flex justify-center lg:justify-start">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-[3rem] border border-red-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/20 sm:h-72 sm:w-72">
              <div className="absolute inset-5 rounded-[2.4rem] border border-white/10 bg-white/5" />

              <div className="relative text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-200">
                  Restricted
                </p>

                <p className="mt-4 text-6xl font-black leading-none tracking-tight sm:text-7xl">
                  403
                </p>

                <p className="mt-3 text-sm font-medium text-slate-300">
                  Access denied
                </p>
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-700">
              Permission required
            </p>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              This section is not available for your current role.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 lg:mx-0">
              NearHands protects role-specific workflows so customers and
              providers only access the tools intended for them.
            </p>

            <div className="mt-7 grid gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 text-left sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Required role
                </p>

                <p className="mt-2 text-base font-bold capitalize text-slate-950">
                  {roles.join(" or ")}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Your role
                </p>

                <p className="mt-2 text-base font-bold capitalize text-slate-950">
                  {userRole || "unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return children;
}

export default AuthGuard;