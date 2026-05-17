import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/authApi";
import { extractErrorMessage } from "../utils/authResponse";

function ResetGuideItem({ title, description }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-200">{description}</p>
    </div>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    try {
      setSubmitStatus("submitting");

      const responseData = await requestPasswordReset(email.trim());

      const successText =
        responseData?.detail ||
        responseData?.message ||
        "If an account exists for this email, a password reset link has been sent.";

      setSuccessMessage(successText);
      setEmail("");
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(
          error,
          "Could not request a password reset. Please try again."
        )
      );
    } finally {
      setSubmitStatus("idle");
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
      <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
        <div className="relative hidden min-h-[720px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(94,234,212,0.25),_transparent_30%),linear-gradient(145deg,_#0f172a,_#164e63_52%,_#0f766e)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 top-28 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
          <div className="absolute bottom-16 right-12 h-44 w-44 rounded-full border border-white/10 bg-teal-100/10" />

          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-teal-800">
                N
              </span>

              <span className="text-sm font-semibold text-teal-50">
                Account recovery
              </span>
            </div>

            <h2 className="mt-10 max-w-lg text-5xl font-black leading-[1.08] tracking-tight">
              Reset access without losing your NearHands account.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200">
              Enter the email connected to your account. NearHands will prepare
              a secure reset link so you can choose a new password.
            </p>
          </div>

          <div className="relative grid gap-4">
            <ResetGuideItem
              title="Step 1"
              description="Submit the email address used during registration."
            />

            <ResetGuideItem
              title="Step 2"
              description="Open the reset link delivered through the configured email flow."
            />

            <ResetGuideItem
              title="Step 3"
              description="Choose a new password and return safely to login."
            />
          </div>
        </div>

        <div className="relative px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-12">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-bl-[5rem] bg-cyan-50/80" />

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
              Forgot password
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Request a reset link
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              Enter your account email and we will start the password recovery
              process.
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                <p className="font-semibold text-red-800">
                  Reset request failed
                </p>

                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-700">
                <p className="font-semibold text-green-800">
                  Reset request sent
                </p>

                <p className="mt-1">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="password-reset-email"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Account email
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="password-reset-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    required
                    className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitStatus === "submitting"}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-teal-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
              >
                {submitStatus === "submitting"
                  ? "Sending reset link..."
                  : "Send reset link"}
              </button>
            </form>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm leading-6 text-slate-600">
                Remembered your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  Return to login
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

export default ForgotPasswordPage;