import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme !== "looptalk-light");
    root.dataset.theme = theme;
  }, [theme]);

  if (isCheckingAuth && !authUser) {
    return (
      <div
        className="app-shell flex min-h-screen items-center justify-center px-6"
      >
        <div className="glass-panel relative overflow-hidden rounded-[32px] px-10 py-8 text-center">
          <div className="mesh-orb left-[-30px] top-[-30px] size-28 bg-[var(--accent)]" />
          <div className="mesh-orb bottom-[-34px] right-[-20px] size-24 bg-[var(--accent-strong)]" />
          <div className="relative">
            <LoaderCircle className="mx-auto size-10 animate-spin text-[var(--accent)]" />
            <p className="section-title mt-4 text-xl font-bold">Loading LoopTalk</p>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Syncing your workspace and conversations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={!authUser ? <AuthPage /> : <Navigate to="/app" />} />
        <Route path="/verify-email" element={<Navigate to="/auth?mode=login" replace />} />
        <Route path="/verify-otp" element={<Navigate to="/auth?mode=login" replace />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/app" element={authUser ? <HomePage /> : <Navigate to="/auth?mode=login" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/auth?mode=login" />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2800,
          style: {
            borderRadius: "18px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-strong)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
          },
        }}
      />
    </div>
  );
};

export default App;
