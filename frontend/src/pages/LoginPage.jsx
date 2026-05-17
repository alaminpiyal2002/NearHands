import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function FeatureMark({ children }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-200">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-teal-200">
        ✓
      </span>
      <span>{children}</span>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => {
      return {
        ...currentData,
        [name]: value,
      };
    });

    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await login(formData);

    setIsSubmitting(false);

    if (result.success) {
      navigate("/");
      return;
    }

    setErrorMessage(result.message);
  }

  if (isAuthenticated) {
    return (
      <section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.18),_transparent_32%),linear-gradient(135deg,_#0f172a,_#134e4a)] px-8 py-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
            Welcome back
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            You are already logged in
          </h1>

          <p className="mt-3 max-w-xl leading-7 text-slate-200">
            Your NearHands session is active. Continue exploring services,
            requests, conversations, and notifications.
          </p>

          <Link
            to="/"
            className="mt-7 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-50"
          >
            Go home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[720px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.28),_transparent_30%),linear-gradient(145deg,_#0f172a,_#115e59_58%,_#0f766e)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-16 top-24 h-52 w-52 rounded-full border border-white/10 bg-white/5 blur-[1px]" />
          <div className="absolute bottom-16 right-10 h-40 w-40 rounded-full border border-white/10 bg-teal-200/10" />

          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-teal-800">
                N
              </span>
              <span className="text-sm font-semibold text-teal-50">
                NearHands Access
              </span>
            </div>

            <h2 className="mt-10 max-w-lg text-5xl font-black leading-[1.08] tracking-tight">
              Step back into your local service network.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200">
              Continue conversations, manage requests, track notifications,
              and stay connected with trusted nearby providers and customers.
            </p>
          </div>

          <div className="relative space-y-4">
            <FeatureMark>Email or username login</FeatureMark>
            <FeatureMark>Protected profile and dashboard access</FeatureMark>
            <FeatureMark>Real-time chat and notification continuity</FeatureMark>
          </div>
        </div>

        <div className="relative px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-12">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[4rem] bg-teal-50/80" />

          <div className="relative mx-auto max-w-md">
            <div className="lg:hidden">
              <div className="inline-flex items-center gap-3 rounded-full border border-teal-100 bg-teal-50 px-4 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-black text-white">
                  N
                </span>
                <span className="text-sm font-semibold text-teal-800">
                  NearHands
                </span>
              </div>
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-teal-700 lg:mt-0">
              Login
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              Use your email or username to continue where you left off.
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                <p className="font-semibold text-red-800">Login failed</p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Email or username
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="provider1@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>

                  <Link
                    to="/password-reset"
                    className="text-sm font-semibold text-teal-700 transition hover:text-teal-800 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="Your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-teal-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
              >
                <span>{isSubmitting ? "Logging in..." : "Login"}</span>
                {!isSubmitting && (
                  <span className="transition group-hover:translate-x-1">→</span>
                )}
              </button>
            </form>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm leading-6 text-slate-600">
                New to NearHands?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  Create your account
                </Link>{" "}
                and join the local marketplace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;