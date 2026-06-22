import { Outlet, NavLink } from "react-router-dom";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/health", label: "Health" },
  { to: "/deen", label: "Deen" },
  { to: "/ideas", label: "Ideas" },
  { to: "/performance", label: "Perf" },
  { to: "/parked", label: "Parked" },
];

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
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
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <nav className="hidden lg:flex flex-col gap-1 w-48 shrink-0 border-r border-border p-4 pt-8 fixed h-screen">
        <span className="text-accent font-mono text-sm mb-6 tracking-wider">MBAYE</span>
        {NAV.map((n) => (
          <NavItem key={n.to} {...n} />
        ))}
      </nav>
      <main className="flex-1 lg:ml-48 pb-20 lg:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg border-t border-border flex justify-around py-2 z-50">
        {NAV.map((n) => (
          <NavItem key={n.to} {...n} />
        ))}
      </nav>
    </div>
  );
}
