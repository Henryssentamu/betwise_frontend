import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Users, LogOut, Menu, X, CreditCard, CalendarDays, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/this-week", label: "This week", icon: CalendarDays },
  { to: "/recommendations", label: "Recommendations", icon: TrendingUp },
  { to: "/bet-logs", label: "Bet log", icon: ClipboardList },
  { to: "/partners", label: "Partners", icon: Users },
  { to: "/pricing", label: "Plans", icon: CreditCard },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-hairline bg-ink-bg/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-tight text-ink-paper">
              Bet<span className="text-ticker">Wise</span>
            </span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-stub text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive
                        ? "text-ticker bg-ticker/10"
                        : "text-ink-muted hover:text-ink-paper"
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-sm text-ink-muted hover:text-ticker font-mono transition-colors"
                >
                  {user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-risk-high transition-colors px-3 py-2"
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-ink-muted hover:text-ink-paper transition-colors px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-ticker text-ink-bg px-4 py-2 rounded-stub hover:bg-ticker-glow transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-ink-paper"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-ink-hairline px-5 py-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-ticker font-mono py-1"
                >
                  {user?.username}
                </NavLink>
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm text-ink-muted hover:text-ink-paper py-1"
                  >
                    {item.label}
                  </NavLink>
                ))}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="text-sm text-risk-high text-left py-1"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-ink-muted py-1">
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-ticker py-1">
                  Get started
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink-hairline mt-16">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-ink-faint">
          <p>BetWise is an analytics and planning tool. We don't take bets — you decide where and how much to stake.</p>
          <p className="font-mono">Kampala, Uganda</p>
        </div>
      </footer>
    </div>
  );
}
