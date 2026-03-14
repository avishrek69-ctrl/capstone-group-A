import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sun,
  CloudSun,
  Wind,
  Thermometer,
  CalendarDays,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Sun,
    title: "Golden Hour Timing",
    description:
      "Know exactly when golden and blue hour windows open for your location — the most critical factor for stunning outdoor portraits.",
  },
  {
    icon: CloudSun,
    title: "Suitability Score",
    description:
      "A single 0-100 score combining cloud cover, rain probability, wind, temperature, and golden hour alignment so you can decide at a glance.",
  },
  {
    icon: CalendarDays,
    title: "7-Day Planner",
    description:
      "Browse an entire week of scored days to find the best shooting window — perfect for scheduling maternity, newborn, and family sessions.",
  },
  {
    icon: Wind,
    title: "Wind & Comfort",
    description:
      "Wind affects hair, fabric, and newborn comfort outdoors. We track it so you never get surprised on shoot day.",
  },
  {
    icon: Thermometer,
    title: "Temperature Awareness",
    description:
      "Especially critical for newborn shoots — see temperature comfort ratings before committing to an outdoor session.",
  },
  {
    icon: MapPin,
    title: "Saved Locations",
    description:
      "Save your favourite parks, gardens, and shooting spots for quick one-tap condition checks whenever you need them.",
  },
];

const ratings = [
  { label: "Excellent", colour: "bg-green-500", range: "85-100" },
  { label: "Good", colour: "bg-blue-500", range: "65-84" },
  { label: "Acceptable", colour: "bg-amber-500", range: "45-64" },
  { label: "Poor", colour: "bg-orange-500", range: "25-44" },
  { label: "Unsuitable", colour: "bg-red-500", range: "0-24" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-semibold tracking-tight">
              Alisia Mason Photography
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/*  Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Star className="h-3 w-3 text-amber-500" />
          Built for professional photographers
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight">
          Plan shoots around{" "}
          <span className="text-amber-500">perfect light</span>,{" "}
          not guesswork
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          The Photography Planner aggregates real-time weather, sun position, and
          atmospheric data into a single suitability score — so you know before
          you leave whether the light will be worth it.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register" className="flex items-center gap-2">
              Start planning for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Log in to your account</Link>
          </Button>
        </div>
      </section>

      {/* Score legend */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Suitability ratings
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {ratings.map(({ label, colour, range }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${colour}`} />
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight">
          Everything a photographer needs to decide
        </h2>
        <p className="mb-16 text-center text-muted-foreground">
          Five weighted factors combine into one number. No more cross-referencing
          multiple weather apps. No more guesswork.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <Icon className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="mb-2 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to shoot in the best light?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Create your free account and check today&apos;s suitability score for any
            location in seconds.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/register" className="flex items-center gap-2">
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            Alisia Mason Photography
          </div>
          <p>Photography Planner — PROG709 Capstone</p>
        </div>
      </footer>

    </div>
  );
}
