import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import TimerBanner from "./TimerBanner";

const MAIN_NAV = [
  { to: "/", label: "Home" },
  { to: "/calendar", label: "Calendar" },
  { to: "/health", label: "Health" },
  { to: "/deen", label: "Deen" },
];

const MORE_NAV = [
  { to: "/ideas", label: "Ideas" },
  { to: "/performance", label: "Performance" },
  { to: "/review", label: "Review" },
  { to: "/parked", label: "Parked" },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        `px-3 py-2 text-xs tracking-wide uppercase transition-colors ${
          isActive ? "text-accent" : "text-muted hover:text-text"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const [moreTray, setMoreTray] = useState(false);
  const timer = useQuery(api.timer.getActive);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <nav className="hidden lg:flex flex-col gap-1 w-48 shrink-0 border-r border-border p-4 pt-8 fixed h-screen">
        <span className="text-accent font-mono text-sm mb-6 tracking-wider">MBAYE</span>
        {MAIN_NAV.map((n) => (
          <NavItem key={n.to} {...n} />
        ))}
        <div className="mt-4 mb-1 text-[10px] text-muted uppercase tracking-widest px-3">More</div>
        {MORE_NAV.map((n) => (
          <NavItem key={n.to} {...n} />
        ))}
      </nav>

      <main className="flex-1 lg:ml-48 pb-20 lg:pb-8">
        {timer && <TimerBanner timer={timer} />}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {moreTray && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMoreTray(false)}
        >
          <div
            className="absolute bottom-14 left-0 right-0 bg-card border-t border-border p-4 flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {MORE_NAV.map((n) => (
              <NavItem key={n.to} {...n} onClick={() => setMoreTray(false)} />
            ))}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg border-t border-border flex justify-around py-2 z-50">
        {MAIN_NAV.map((n) => (
          <NavItem key={n.to} {...n} />
        ))}
        <button
          type="button"
          onClick={() => setMoreTray(!moreTray)}
          className={`px-3 py-2 text-xs tracking-wide uppercase transition-colors ${
            moreTray ? "text-accent" : "text-muted"
          }`}
        >
          More
        </button>
      </nav>
    </div>
  );
}
