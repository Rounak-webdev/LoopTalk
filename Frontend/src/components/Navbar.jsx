import { LogOut, MessageSquareText, Settings, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/app") {
    return null;
  }

  const navLinkClass = (active) =>
    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
      active
        ? "border border-[var(--border-strong)] bg-white/10 text-[var(--text-strong)]"
        : "border border-transparent text-[var(--text-soft)] hover:border-[var(--border)] hover:bg-white/6 hover:text-[var(--text-strong)]"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between rounded-full border border-white/8 bg-[color:var(--bg-elevated)] px-3 py-2 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3 rounded-full px-3 py-2 transition hover:bg-white/6">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[color:var(--accent)]/16 text-[var(--accent)]">
              <MessageSquareText className="size-5" />
            </div>
            <div className="hidden sm:block">
              <p className="section-title text-base font-bold">LoopTalk</p>
              <p className="text-xs text-[var(--text-muted)]">Realtime chat, shaped for focus</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle compact />

          {authUser ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link to="/app" className={navLinkClass(location.pathname === "/app")}>
                <MessageSquareText className="size-4" />
                <span>Inbox</span>
              </Link>
              <Link to="/settings" className={navLinkClass(location.pathname === "/settings")}>
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/auth?mode=login" className={navLinkClass(location.pathname === "/auth")}>
                Login
              </Link>
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Get Started
              </Link>
            </div>
          )}

          {authUser && (
            <>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/6 px-3 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--border-strong)] hover:bg-white/10"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-[color:var(--accent)]/15">
                  <UserRound className="size-4" />
                </div>
                <span className="hidden sm:inline">{authUser.fullName?.split(" ")[0] || "Profile"}</span>
              </Link>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-soft)] transition hover:border-[var(--danger)]/40 hover:bg-[var(--danger)]/10 hover:text-[var(--text-strong)]"
                onClick={logout}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
