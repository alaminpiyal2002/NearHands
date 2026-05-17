import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "../api/authApi";
import { extractErrorMessage } from "../utils/authResponse";

function SecurityNote({ title, description }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-200">{description}</p>
    </div>
  );
}

function ResetPasswordConfirmPage() {
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });

  const [submitStatus, setSubmitStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hasValidResetQuery = Boolean(uid && token);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!hasValidResetQuery) {
      setErrorMessage(
        "This password reset link is missing required information. Please request a new reset link."
      );
      return;
    }

    if (!formData.new_password.trim()) {
      setErrorMessage("Please enter a new password.");
      return;
    }

    if (formData.new_password.length < 8) {
      setErrorMessage("Your new password must be at least 8 characters long.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setErrorMessage("The password confirmation does not match.");
      return;
    }

    try {
      setSubmitStatus("submitting");

      const responseData = await confirmPasswordReset({
        uid,
        token,
        new_password: formData.new_password,
      });

      const successText =
        responseData?.detail ||
        responseData?.message ||
        "Your password has been reset successfully. You can now log in with your new password.";

      setSuccessMessage(successText);
      setFormData({
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(
          error,
          "Could not reset your password. The link may be invalid or expired."
        )
      );
    } finally {
      setSubmitStatus("idle");
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
      <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
        <div className="relative hidden min-h-[760px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(94,234,212,0.25),_transparent_30%),linear-gradient(145deg,_#0f172a,_#164e63_52%,_#0f766e)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 top-28 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
          <div className="absolute bottom-16 right-12 h-44 w-44 rounded-full border border-white/10 bg-teal-100/10" />

          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-teal-800">
                N
              </span>

              <span className="text-sm font-semibold text-teal-50">
                Secure password reset
              </span>
            </div>

            <h2 className="mt-10 max-w-lg text-5xl font-black leading-[1.08] tracking-tight">
              Choose a fresh password and return safely to NearHands.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200">
              This reset page uses the secure token from your email link. Once
              updated, your old password will no longer work.
            </p>
          </div>

          <div className="relative grid gap-4">
            <SecurityNote
              title="Use a strong password"
              description="Choose something memorable to you but difficult for others to guess."
            />

            <SecurityNote
              title="Reset links expire"
              description="If this link is invalid or expired, request a fresh reset email."
            />

            <SecurityNote
              title="Return to login"
              description="After the reset succeeds, sign in again using your new password."
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
              Reset password
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Set a new password
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              Enter and confirm your new password to restore access to your
              account.
            </p>

            {!hasValidResetQuery && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
                <p className="font-semibold text-amber-900">
                  Reset link incomplete
                </p>

                <p className="mt-1">
                  This page is missing the required reset token or user
                  identifier. Please request a new password reset email.
                </p>

                <Link
                  to="/password-reset"
                  className="mt-3 inline-flex font-semibold text-amber-900 underline decoration-amber-400 underline-offset-4 hover:text-amber-950"
                >
                  Request a new reset link
                </Link>
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                <p className="font-semibold text-red-800">
                  Password reset failed
                </p>

                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-700">
                <p className="font-semibold text-green-800">
                  Password updated
                </p>

                <p className="mt-1">{successMessage}</p>

                <Link
                  to="/login"
                  className="mt-3 inline-flex font-semibold text-green-800 underline decoration-green-400 underline-offset-4 hover:text-green-900"
                >
                  Continue to login
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="new_password"
                  className="block text-sm font-semibold text-slate-800"
                >
                  New password
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={formData.new_password}
                    onChange={handleChange}
                    minLength={8}
                    required
                    disabled={!hasValidResetQuery || submitStatus === "submitting"}
                    className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Confirm new password
                </label>

                <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    minLength={8}
                    required
                    disabled={!hasValidResetQuery || submitStatus === "submitting"}
                    className="w-full bg-transparent py-3 text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
                    placeholder="Re-enter your new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  !hasValidResetQuery || submitStatus === "submitting"
                }
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-teal-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
              >
                {submitStatus === "submitting"
                  ? "Resetting password..."
                  : "Reset password"}
              </button>
            </form>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm leading-6 text-slate-600">
                Need another reset email?{" "}
                <Link
                  to="/password-reset"
                  className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  Request a new link
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

export default ResetPasswordConfirmPage;