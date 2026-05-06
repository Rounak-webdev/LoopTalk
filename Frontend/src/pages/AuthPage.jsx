import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquareText,
  User,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppConfig } from "../components/useAppConfig";
import { useAuthStore } from "../store/useAuthStore";

const MotionDiv = motion.div;
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let googleScriptPromise;
let initializedGoogleClientId = "";
let latestGoogleCredentialHandler = () => {};

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

      if (existingScript) {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
};

const initializeGoogleSignIn = (clientId, onCredential) => {
  latestGoogleCredentialHandler = onCredential;

  if (initializedGoogleClientId === clientId) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => latestGoogleCredentialHandler(response),
    use_fedcm_for_prompt: true,
  });

  initializedGoogleClientId = clientId;
};

const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
const blockedDomains = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "fake.com",
  "invalid.com",
  "mailinator.com",
  "guerrillamail.com",
  "yopmail.com",
  "10minutemail.com",
  "temp-mail.org",
  "tempmail.com",
]);

const AuthPage = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get("mode") === "signup" ? "signup" : "login";
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const googleButtonRef = useRef(null);
  const { googleClientId, isGoogleReady } = useAppConfig();

  const {
    forgotPassword,
    googleAuth,
    isAuthWorking,
    isGoogleAuthLoading,
    isLoggingIn,
    isSendingResetEmail,
    isSigningUp,
    login,
    signup,
  } = useAuthStore();

  const isSignup = mode === "signup";
  const isBusy = isSigningUp || isLoggingIn || isAuthWorking;
  const googleButtonText = isSignup ? "signup_with" : "signin_with";

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    let isMounted = true;

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !window.google?.accounts?.id || !googleButtonRef.current) return;

        initializeGoogleSignIn(googleClientId, async ({ credential }) => {
          if (!credential) return;
          await googleAuth(credential);
        });

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "filled_black",
          shape: "pill",
          text: googleButtonText,
          width: 320,
        });
      })
      .catch(() => {
        if (isMounted) {
          toast.error("Unable to load Google Sign-In");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [googleButtonText, googleAuth, googleClientId]);

  const heading = useMemo(
    () =>
      isSignup
        ? {
            eyebrow: "Create account",
            title: "Join LoopTalk",
            description: "Create your account with a real email, a secure password, and a polished onboarding flow.",
          }
        : {
            eyebrow: "Welcome back",
            title: "Login to your workspace",
            description: "Pick up every conversation with verified identity, smooth motion, and startup-grade polish.",
          },
    [isSignup]
  );

  const switchMode = (nextMode) => {
    const next = new URLSearchParams(params);
    next.set("mode", nextMode);
    setParams(next);
    setShowPassword(false);
  };

  const validate = () => {
    if (isSignup && !formData.fullName.trim()) {
      toast.error("Name is required");
      return false;
    }

    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      toast.error("Enter a valid email address");
      return false;
    }

    const emailDomain = normalizedEmail.split("@")[1];
    if (blockedDomains.has(emailDomain)) {
      toast.error("Use a real email inbox you can access");
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const normalizedEmail = formData.email.trim().toLowerCase();

    if (isSignup) {
      const success = await signup({ ...formData, email: normalizedEmail });
      if (success) navigate("/app");
      return;
    }

    await login({
      email: normalizedEmail,
      password: formData.password,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-10 pt-28 sm:px-6">
      <div className="mesh-orb left-[-80px] top-12 size-72 bg-[var(--accent)]" />
      <div className="mesh-orb bottom-0 right-[-40px] size-80 bg-[var(--accent-strong)]" />

      <section className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-panel relative overflow-hidden rounded-[36px] p-8 sm:p-10">
          <div className="flex size-14 items-center justify-center rounded-[22px] bg-[var(--accent)]/14 text-[var(--accent)]">
            <MessageSquareText className="size-7" />
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">{heading.eyebrow}</p>
          <h1 className="section-title mt-3 text-4xl font-bold">{heading.title}</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--text-soft)]">{heading.description}</p>

          <div className="mt-8 inline-flex rounded-full border border-[var(--border)] bg-white/6 p-1">
            {[
              ["login", "Login"],
              ["signup", "Signup"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => switchMode(value)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  mode === value
                    ? "bg-[var(--accent)] text-slate-950"
                    : "text-[var(--text-soft)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <AnimatePresence initial={false}>
              {isSignup && (
                <MotionDiv
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">Name</label>
                  <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3">
                    <User className="size-5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
                      placeholder="Riya Sharma"
                      value={formData.fullName}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, fullName: event.target.value }))
                      }
                    />
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">Email</label>
              <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3">
                <Mail className="size-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, email: event.target.value.trimStart() }))
                  }
                />
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Use a real email inbox you can access for account recovery.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="text-sm font-medium text-[var(--text-soft)]">Password</label>
                {!isSignup && (
                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--accent)]"
                    onClick={() => setIsForgotOpen((value) => !value)}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3">
                <Lock className="size-5 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, password: event.target.value }))
                  }
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)}>
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
              disabled={isBusy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3.5 font-semibold text-slate-950 shadow-[0_18px_36px_rgba(34,211,238,0.22)] transition hover:scale-[1.01]"
            >
              {isBusy ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  {isSignup ? "Creating account..." : "Logging in..."}
                </>
              ) : (
                <>
                  <span>{isSignup ? "Create account" : "Login"}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="soft-divider flex-1" />
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">or continue with</span>
            <div className="soft-divider flex-1" />
          </div>

          {googleClientId ? (
            <div className="flex min-h-11 justify-center overflow-hidden rounded-2xl">
              <div ref={googleButtonRef} />
            </div>
          ) : !isGoogleReady ? (
            <div className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)]">
              Loading Google Sign-In...
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="w-full rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)]"
            >
              Add Google credentials in the backend env to enable Google Sign-In
            </button>
          )}

          {isGoogleAuthLoading && (
            <p className="mt-3 text-sm text-[var(--text-soft)]">Completing Google sign-in...</p>
          )}

          <AnimatePresence>
            {isForgotOpen && (
              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 rounded-[24px] border border-[var(--border)] bg-white/6 p-4"
              >
                <p className="font-semibold text-[var(--text-strong)]">Reset your password</p>
                <p className="mt-1 text-sm text-[var(--text-soft)]">
                  We’ll email you a secure reset link.
                </p>
                <div className="input-shell mt-4 flex items-center gap-3 rounded-2xl px-4 py-3">
                  <Mail className="size-5 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <button
                  type="button"
                  disabled={isSendingResetEmail}
                  onClick={() => forgotPassword(forgotEmail)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-strong)] transition hover:border-[var(--border-strong)]"
                >
                  {isSendingResetEmail ? <Loader2 className="size-4 animate-spin" /> : "Send reset link"}
                </button>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>

        <div className="glass-panel relative overflow-hidden rounded-[36px] p-6 sm:p-8">
          <div className="floating-grid absolute inset-0 opacity-40" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Preview</p>
            <h2 className="section-title mt-3 text-3xl font-bold">Production-grade conversations</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--text-soft)]">
              Premium onboarding flows, smooth transitions, and a chat preview that shows the product value before users even log in.
            </p>

            <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-[color:var(--sidebar)] p-4">
              <div className="space-y-3">
                <div className="flex justify-start">
                  <div className="max-w-[78%] rounded-[22px] border border-[var(--border)] bg-[var(--bubble-them)] px-4 py-3 text-sm text-[var(--text-strong)]">
                    We just simplified authentication to email, password, and Google sign-in.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div
                    className="max-w-[78%] rounded-[22px] px-4 py-3 text-sm text-slate-950"
                    style={{ background: "var(--bubble-me)" }}
                  >
                    Nice. Add the password reset flow and we’re investor-demo ready.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[78%] rounded-[22px] border border-[var(--border)] bg-[var(--bubble-them)] px-4 py-3 text-sm text-[var(--text-strong)]">
                    Uploading hero-animation.mp4...
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[78%] rounded-[22px] px-4 py-3 text-slate-950" style={{ background: "var(--bubble-me)" }}>
                    <div className="flex items-center gap-1">
                      <span className="size-2 animate-bounce rounded-full bg-slate-900/70 [animation-delay:-0.3s]" />
                      <span className="size-2 animate-bounce rounded-full bg-slate-900/70 [animation-delay:-0.15s]" />
                      <span className="size-2 animate-bounce rounded-full bg-slate-900/70" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-[var(--text-soft)]">
              Need help after setup? Head back to the <Link to="/" className="font-semibold text-[var(--accent)]">landing page</Link>.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
