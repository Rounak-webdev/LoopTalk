import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquareText, User } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 auth-page">
      <div className="flex items-center justify-center px-6 py-28 sm:px-10">
        <div className="glass-panel w-full max-w-md rounded-[32px] p-8 sm:p-10">
          <div className="mb-8">
            <div className="flex size-14 items-center justify-center rounded-[22px] bg-[var(--accent)]/14 text-[var(--accent)]">
              <MessageSquareText className="size-7" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Create account</p>
            <h1 className="section-title mt-3 text-4xl font-bold">Build your LoopTalk space</h1>
            <p className="mt-3 text-[15px] leading-7 text-[var(--text-soft)]">
              Set up your profile, unlock realtime conversations, and start sharing instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">Full Name</label>
              <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3">
                <User className="size-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

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
                    <EyeOff className="size-5 text-[var(--text-muted)]" />
                  ) : (
                    <Eye className="size-5 text-[var(--text-muted)]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3.5 font-semibold text-slate-950 shadow-[0_18px_36px_rgba(34,211,238,0.22)] transition hover:scale-[1.01]"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="soft-divider my-6" />

          <div className="flex items-center justify-between gap-3 text-sm text-[var(--text-soft)]">
            <span>Already have an account?</span>
            <Link to="/login" className="font-semibold text-[var(--accent)]">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Startup-grade onboarding"
        subtitle="The same premium visual language carries from sign-up to chat, making the product feel intentional from the first screen."
      />
    </div>
  );
};
export default SignUpPage;
