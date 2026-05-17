import { Link } from "react-router-dom";

function HighlightCard({ title, description, accent = "teal" }) {
  const accentClasses =
    accent === "slate"
      ? "from-slate-900 to-slate-700"
      : accent === "cyan"
        ? "from-cyan-600 to-teal-700"
        : "from-teal-700 to-emerald-600";

  return (
    <div className="group rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-6">
      <div
        className={`h-2.5 w-16 rounded-full bg-gradient-to-r ${accentClasses}`}
      />

      <h3 className="mt-5 text-lg font-bold leading-snug text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function JourneyStep({ number, title, description }) {
  return (
    <div className="relative rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function HomePage() {
  return (
    <section className="space-y-10">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.38)]">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative grid gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">
              <span className="flex h-2.5 w-2.5 rounded-full bg-teal-600" />
              Built for nearby service connections
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Local help,
              <span className="block bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                organized better.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              NearHands brings service listings, customer requests, direct
              conversations, reviews, and real-time notifications into one
              focused local marketplace experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Explore services
              </Link>

              <Link
                to="/requests"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
              >
                Browse requests
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                Services
              </span>

              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                Requests
              </span>

              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                Real-time chat
              </span>

              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                Reviews
              </span>
            </div>
          </div>

          <div className="relative min-h-[420px]">
            <div className="absolute inset-0 rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 shadow-2xl shadow-slate-900/20" />

            <div className="absolute left-5 right-5 top-5 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
                Customer flow
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Need help nearby?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-200">
                Search providers or post a request, then continue with direct
                chat.
              </p>
            </div>

            <div className="absolute left-8 top-[210px] w-[78%] rounded-[1.5rem] border border-white/10 bg-white px-4 py-4 text-slate-900 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-teal-700">
                    Request board
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    Need emergency electrical repair
                  </p>
                </div>

                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Open
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-600">
                <span>Budget: ৳800 - ৳2000</span>
                <span>Responses: 3</span>
              </div>
            </div>

            <div className="absolute bottom-6 right-5 w-[76%] rounded-[1.5rem] border border-white/10 bg-white/95 px-4 py-4 text-slate-900 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  P
                </div>

                <div>
                  <p className="text-sm font-bold">Provider replied</p>
                  <p className="text-xs text-slate-500">
                    “I can help today. Let’s chat.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <HighlightCard
          title="Discover trusted local providers"
          description="Browse service listings with practical filters for location, pricing, and relevance."
        />

        <HighlightCard
          title="Post exactly what you need"
          description="Customers can publish service requests so nearby providers can respond directly."
          accent="cyan"
        />

        <HighlightCard
          title="Move from interest to conversation"
          description="Real-time chat, notifications, and reviews help both sides continue with confidence."
          accent="slate"
        />
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            How NearHands works
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            A marketplace flow that feels natural.
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-600">
            NearHands is built around a simple path: discover, connect, and
            complete the conversation with stronger trust signals.
          </p>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          <JourneyStep
            number="01"
            title="Find or request"
            description="Customers browse active services or publish a detailed request for nearby help."
          />

          <JourneyStep
            number="02"
            title="Respond and chat"
            description="Providers respond to requests, customers contact listings, and conversations open instantly."
          />

          <JourneyStep
            number="03"
            title="Build trust"
            description="Notifications, reviews, and profile signals help the platform feel reliable and complete."
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-[2rem] border border-slate-200/80 bg-slate-950 px-6 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
            Ready to explore?
          </p>

          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Start with the part of the marketplace that fits you.
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-teal-50"
          >
            Create account
          </Link>

          <Link
            to="/services"
            className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white/10"
          >
            View services
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomePage;