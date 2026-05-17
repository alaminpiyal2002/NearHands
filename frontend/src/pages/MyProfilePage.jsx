import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { extractErrorMessage, getUserDisplayName } from "../utils/authResponse";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function buildProfileForm(user) {
  return {
    display_name: user?.display_name || user?.profile?.display_name || "",
    location: user?.location || user?.profile?.location || "",
    bio: user?.bio || user?.profile?.bio || "",
    role: user?.role || user?.profile?.role || "customer",
  };
}

export default function MyProfilePage() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState(() => buildProfileForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateProfile(formData);

      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(error, "Could not update your profile.")
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) {
    return <LoadingState message="Loading your profile..." />;
  }

  const profileInitial = getUserDisplayName(user).charAt(0).toUpperCase();
  const currentRole = user?.role || user?.profile?.role || "customer";

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br from-teal-600 via-teal-700 to-slate-950 text-4xl font-black text-white shadow-xl shadow-teal-900/15">
              {profileInitial}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
                My profile
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {getUserDisplayName(user)}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Manage the identity customers and providers see across
                NearHands, including your role, location, and public bio.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              Account snapshot
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Username
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-white">
                  {user.username || "Not available"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Email
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-white">
                  {user.email || "Not available"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Current role
                </p>

                <p className="mt-2 text-lg font-bold capitalize text-white">
                  {currentRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <ErrorState title="Profile update failed" message={errorMessage} />
      )}

      {successMessage && (
        <div className="rounded-[1.75rem] border border-green-200 bg-green-50 px-5 py-4 text-sm leading-6 text-green-700 shadow-sm">
          <p className="font-semibold text-green-800">Profile saved</p>
          <p className="mt-1">{successMessage}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-sm"
      >
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Edit profile
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Update your public information
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Keep your profile clear and current so other users understand who
            you are and how you participate on NearHands.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label
                htmlFor="display_name"
                className="block text-sm font-semibold text-slate-800"
              >
                Display name
              </label>

              <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                <input
                  id="display_name"
                  name="display_name"
                  type="text"
                  value={formData.display_name}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                  placeholder="Example: Rahim Electrician"
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

              <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                  placeholder="Example: Dhaka"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-slate-800"
            >
              Role
            </label>

            <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50/70 px-4 py-1 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-transparent py-3 text-sm text-slate-950 outline-none"
              >
                <option value="customer">Customer</option>
                <option value="provider">Provider</option>
              </select>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Role controls what actions you can perform, such as posting
              requests or creating service listings.
            </p>
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-semibold text-slate-800"
            >
              Bio
            </label>

            <div className="mt-2 rounded-[1.75rem] border border-slate-300 bg-slate-50/70 px-4 py-2 transition focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
              <textarea
                id="bio"
                name="bio"
                rows="6"
                value={formData.bio}
                onChange={handleChange}
                className="w-full resize-none bg-transparent py-2 text-sm leading-7 text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="Write a short introduction..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Profile changes are saved through the backend profile API and
              reflected throughout the app.
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-w-44 items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}