import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function RegisterFeature({ title, description }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-200">{description}</p>
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role: "customer",
    display_name: "",
    location: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => {
      return {
        ...currentData,
        [name]: value,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const result = await register(formData);

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    setErrorMessage(result.message);
  }

  if (isAuthenticated) {
    return (
      <section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.18),_transparent_32%),linear-gradient(135deg,_#0f172a,_#134e4a)] px-8 py-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
            Account session active
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            You are already logged in
          </h1>

          <p className="mt-3 max-w-xl leading-7 text-slate-200">
            Logout first if you want to create another NearHands account.
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
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden min-h-[900px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(94,234,212,0.26),_transparent_28%),linear-gradient(145deg,_#0f172a,_#164e63_52%,_#0f766e)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 top-28 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
          <div className="absolute bottom-16 right-12 h-44 w-44 rounded-full border border-white/10 bg-teal-100/10" />

          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-teal-800">
                N
              </span>
              <span className="text-sm font-semibold text-teal-50">
                Join NearHands
              </span>
            </div>

            <h2 className="mt-10 max-w-lg text-5xl font-black leading-[1.08] tracking-tight">
              Build your place in a trusted local marketplace.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200">
              Create an account as a customer or provider and unlock requests,
              listings, real-time conversations, notifications, and reviews.
            </p>
          </div>

          <div className="relative grid gap-4">
            <RegisterFeature
              title="Customer account"
              description="Post service needs, chat with providers, and leave reviews."
            />

            <RegisterFeature
              title="Provider account"
              description="Publish listings, respond to requests, and build local credibility."
            />
          </div>
        </div>

        <div className="relative px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-12">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-bl-[5rem] bg-cyan-50/80" />

          <div className="relative mx-auto max-w-2xl">
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
              Create account
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Start your NearHands journey
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-slate-600">
              Register once and choose how you want to participate in the
              marketplace.
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                <p className="font-semibold text-red-800">
                  Registration failed
                </p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-700">
                <p className="font-semibold text-green-800">Account created</p>
                <p className="mt-1">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Email
                  </label>

                  <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400"
                      placeholder="fatema@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Username
                  </label>

                  <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400"
                      placeholder="fatema_customer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Account type
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-transparent py-3 text-slate-950 outline-none"
                  >
                    <option value="customer">
                      Customer — I want to hire local help
                    </option>
                    <option value="provider">
                      Provider — I want to offer services
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="display_name"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Display name
                  </label>

                  <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                    <input
                      id="display_name"
                      name="display_name"
                      type="text"
                      value={formData.display_name}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400"
                      placeholder="Fatema Customer"
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

                  <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400"
                      placeholder="Dhaka"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-teal-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
              >
                <span>
                  {isSubmitting ? "Creating account..." : "Create account"}
                </span>
                {!isSubmitting && (
                  <span className="transition group-hover:translate-x-1">→</span>
                )}
              </button>
            </form>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm leading-6 text-slate-600">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  Login here
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;