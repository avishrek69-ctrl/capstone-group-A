"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sun, LayoutDashboard, CalendarDays, Camera, MapPin, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/planner",    label: "Planner",     icon: CalendarDays },
  { href: "/shoots",     label: "Shoots",      icon: Camera },
  { href: "/locations",  label: "Locations",   icon: MapPin },
];

const photographerNavLinks = [
  { href: "/photographer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/photographer/bookings", label: "Booked Sessions", icon: Camera },
];

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPhotographerPortal = pathname.startsWith("/photographer");

  const publicPages = ["/", "/login", "/register", "/photographer/login"];
  if (publicPages.includes(pathname)) return null;

  const activeNavLinks = isPhotographerPortal ? photographerNavLinks : navLinks;
  const homeHref = isPhotographerPortal ? "/photographer/dashboard" : "/dashboard";

  const handleLogout = async () => {
    await logout();
    router.push(isPhotographerPortal ? "/photographer/login" : "/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <Link href={homeHref} className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-500" />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            {isPhotographerPortal ? "Photographer Portal" : "Photography Planner"}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {activeNavLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.name}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden gap-1.5 md:flex"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-6 pb-4 md:hidden">
          <nav className="mt-3 flex flex-col gap-1">
            {activeNavLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
