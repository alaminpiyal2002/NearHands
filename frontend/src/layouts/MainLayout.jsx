import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { getUserDisplayName } from "../utils/authResponse";
import NotificationBell from "../components/NotificationBell";

function getDesktopNavLinkClass({ isActive }) {
  return [
    "rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200",
    isActive
      ? "bg-teal-700 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-100 hover:text-teal-700",
  ].join(" ");
}

function getMobileNavLinkClass({ isActive }) {
  return [
    "rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200",
    isActive
      ? "bg-teal-700 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-100 hover:text-teal-700",
  ].join(" ");
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M12 2C6.477 2 2 6.486 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.093.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.346-3.369-1.346-.455-1.159-1.11-1.468-1.11-1.468-.908-.622.069-.609.069-.609 1.004.071 1.532 1.033 1.532 1.033.892 1.533 2.341 1.091 2.91.834.091-.647.35-1.091.636-1.342-2.221-.253-4.555-1.113-4.555-4.953 0-1.094.39-1.989 1.029-2.689-.103-.254-.446-1.274.098-2.656 0 0 .84-.269 2.75 1.027A9.54 9.54 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.296 2.748-1.027 2.748-1.027.546 1.382.202 2.402.1 2.656.64.7 1.028 1.595 1.028 2.689 0 3.849-2.338 4.697-4.566 4.944.359.31.678.921.678 1.856 0 1.34-.012 2.422-.012 2.752 0 .268.18.58.688.482A10.023 10.023 0 0 0 22 12.021C22 6.486 17.523 2 12 2Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.849-3.037-1.851 0-2.134 1.445-2.134 2.939v5.667H9.356V9h3.414v1.561h.049c.476-.9 1.637-1.849 3.37-1.849 3.605 0 4.27 2.374 4.27 5.461v6.279ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.114 20.452H3.56V9h3.554v11.452Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16v12H4z" />
      <path d="m22 7-10 7L2 7" />
    </svg>
  );
}

function MainLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  async function handleLogout() {
    await logout();
    closeMobileMenu();
  }

  function getUserRole() {
    return user?.role || user?.profile?.role || "";
  }

  const isProvider = getUserRole() === "provider";
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.10),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#f1f5f9)] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/90 shadow-[0_10px_40px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <nav className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[7.5rem] items-center justify-between gap-4">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="group flex shrink-0 items-center"
              aria-label="NearHands home"
            >
              <img
                src="/NearHands.svg"
                alt="NearHands"
                className="h-[4.6rem] w-auto max-w-[300px] object-contain transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.01] sm:h-[5rem] sm:max-w-[330px] lg:h-[5.25rem] lg:max-w-[350px]"
              />
            </Link>

            <div className="hidden items-center rounded-full border border-slate-200/80 bg-white/80 p-1.5 shadow-sm lg:flex">
              <NavLink to="/" end className={getDesktopNavLinkClass}>
                Home
              </NavLink>

              <NavLink to="/services" className={getDesktopNavLinkClass}>
                Services
              </NavLink>

              <NavLink to="/requests" className={getDesktopNavLinkClass}>
                Requests
              </NavLink>
            </div>

            <div className="hidden items-center gap-2.5 lg:flex">
              {isLoading ? (
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm">
                  Checking...
                </div>
              ) : isAuthenticated ? (
                <>
                  {isProvider && (
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        [
                          "rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200",
                          isActive
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                        ].join(" ")
                      }
                    >
                      Dashboard
                    </NavLink>
                  )}

                  <NavLink
                    to="/messages"
                    className={({ isActive }) =>
                      [
                        "rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200",
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                      ].join(" ")
                    }
                  >
                    Messages
                  </NavLink>

                  <NotificationBell />

                  <Link
                    to="/profile/me"
                    title={getUserDisplayName(user)}
                    className="group flex max-w-60 items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 hover:shadow-md"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                      {getUserDisplayName(user).charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800 group-hover:text-teal-800">
                        {getUserDisplayName(user)}
                      </p>

                      <p className="truncate text-xs capitalize text-slate-500">
                        {getUserRole() || "member"}
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 hover:shadow-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-100 hover:text-teal-700"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-full bg-gradient-to-r from-teal-700 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition duration-200 hover:-translate-y-0.5 hover:from-teal-800 hover:to-teal-700 hover:shadow-xl"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-800 shadow-sm transition duration-200 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="text-2xl leading-none">
                {isMobileMenuOpen ? "×" : "☰"}
              </span>
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="pb-5 lg:hidden">
              <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur">
                <div className="grid gap-2">
                  <NavLink
                    to="/"
                    end
                    onClick={closeMobileMenu}
                    className={getMobileNavLinkClass}
                  >
                    Home
                  </NavLink>

                  <NavLink
                    to="/services"
                    onClick={closeMobileMenu}
                    className={getMobileNavLinkClass}
                  >
                    Services
                  </NavLink>

                  <NavLink
                    to="/requests"
                    onClick={closeMobileMenu}
                    className={getMobileNavLinkClass}
                  >
                    Requests
                  </NavLink>
                </div>

                <div className="my-4 h-px bg-slate-200" />

                {isLoading ? (
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
                    Checking...
                  </div>
                ) : isAuthenticated ? (
                  <div className="grid gap-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-base font-bold text-teal-800">
                          {getUserDisplayName(user).charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {getUserDisplayName(user)}
                          </p>

                          <p className="truncate text-xs capitalize text-slate-500">
                            {getUserRole() || "member"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isProvider && (
                      <NavLink
                        to="/dashboard"
                        onClick={closeMobileMenu}
                        className={getMobileNavLinkClass}
                      >
                        Dashboard
                      </NavLink>
                    )}

                    <NavLink
                      to="/messages"
                      onClick={closeMobileMenu}
                      className={getMobileNavLinkClass}
                    >
                      Messages
                    </NavLink>

                    <NavLink
                      to="/notifications"
                      onClick={closeMobileMenu}
                      className={getMobileNavLinkClass}
                    >
                      Notifications
                    </NavLink>

                    <NavLink
                      to="/profile/me"
                      onClick={closeMobileMenu}
                      className={getMobileNavLinkClass}
                    >
                      My Profile
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-100"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-100 hover:text-teal-700"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition duration-200 hover:from-teal-800 hover:to-teal-700"
                    >
                      Create account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-300">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link
                to="/"
                className="inline-flex items-center"
                aria-label="NearHands home"
              >
                <img
                  src="/NearHands.svg"
                  alt="NearHands"
                  className="h-[5.75rem] w-auto max-w-[380px] object-contain sm:h-[6.25rem]"
                />
              </Link>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                NearHands connects customers and service providers through
                listings, service requests, real-time chat, notifications, and
                reviews in one streamlined platform.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-200">
                Quick Links
              </h2>

              <div className="mt-5 grid gap-3 text-sm">
                <Link
                  to="/"
                  className="w-fit transition hover:text-teal-300"
                >
                  Home
                </Link>

                <Link
                  to="/services"
                  className="w-fit transition hover:text-teal-300"
                >
                  Services
                </Link>

                <Link
                  to="/requests"
                  className="w-fit transition hover:text-teal-300"
                >
                  Requests
                </Link>

                <Link
                  to="/register"
                  className="w-fit transition hover:text-teal-300"
                >
                  Create Account
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-200">
                Connect
              </h2>

              <div className="mt-5 grid gap-3">
                <a
                  href="https://github.com/alaminpiyal2002"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex w-fit items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-teal-700 hover:text-teal-300"
                >
                  <GitHubIcon />
                  GitHub
                </a>

                <a
                  href="https://www.linkedin.com/in/alaminpiyal"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex w-fit items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-teal-700 hover:text-teal-300"
                >
                  <LinkedInIcon />
                  LinkedIn
                </a>

                <a
                  href="mailto:alamin876123@gmail.com"
                  className="group inline-flex w-fit items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-teal-700 hover:text-teal-300"
                >
                  <MailIcon />
                  <span className="break-all">alamin876123@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>© {currentYear} NearHands. All rights reserved.</p>

            <p>
              Designed and developed by{" "}
              <span className="font-semibold text-slate-300">Al Amin</span>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;