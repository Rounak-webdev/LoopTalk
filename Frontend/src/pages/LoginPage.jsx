import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquareText } from "lucide-react";
import toast from "react-hot-toast";
import AuthImagePattern from "../components/AuthImagePattern";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      login(formData);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 auth-page">
      <div className="flex items-center justify-center px-6 py-28 sm:px-10">
        <div className="glass-panel w-full max-w-md rounded-[32px] p-8 sm:p-10">
          <div className="mb-8">
            <div className="flex size-14 items-center justify-center rounded-[22px] bg-[var(--accent)]/14 text-[var(--accent)]">
              <MessageSquareText className="size-7" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Welcome back</p>
            <h1 className="section-title mt-3 text-4xl font-bold">Sign in to LoopTalk</h1>
            <p className="mt-3 text-[15px] leading-7 text-[var(--text-soft)]">
              Jump back into your conversations with a cleaner, calmer workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">Email</label>
              <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3">
                <Mail className="size-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">Password</label>
              <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3">
                <Lock className="size-5 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <Eye className="size-5 text-[var(--text-muted)]" />
                  ) : (
                     <EyeOff className="size-5 text-[var(--text-muted)]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3.5 font-semibold text-slate-950 shadow-[0_18px_36px_rgba(34,211,238,0.22)] transition hover:scale-[1.01]"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Enter workspace"
              )}
            </button>
          </form>

          <div className="soft-divider my-6" />

          <div className="flex items-center justify-between gap-3 text-sm text-[var(--text-soft)]">
            <span>New here?</span>
            <Link to="/signup" className="font-semibold text-[var(--accent)]">
              Create your account
            </Link>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Conversation-first login"
        subtitle="A modern editorial look, soft gradients, and glass surfaces make onboarding feel premium without losing clarity."
      />
    </div>
  );
};

export default LoginPage;
