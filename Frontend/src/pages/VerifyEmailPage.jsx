import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState("");
  const {
    authUser,
    isRequestingAuthOtp,
    isResendingOtp,
    isVerifyingOtp,
    pendingOtpSession,
    pendingVerificationEmail,
    resendAuthOtp,
    resendOtp,
    verifyAuthOtp,
    verifyOtp,
  } = useAuthStore();

  const otpDestination = pendingOtpSession?.destination || pendingVerificationEmail || "your email";
  const isGenericOtpFlow = Boolean(pendingOtpSession);

  if (authUser) {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="min-h-screen px-4 pb-10 pt-28 sm:px-6">
      <section className="mx-auto max-w-xl">
        <div className="glass-panel rounded-[36px] p-8 sm:p-10">
          <div className="flex size-14 items-center justify-center rounded-[22px] bg-[var(--accent)]/14 text-[var(--accent)]">
            <ShieldCheck className="size-7" />
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            {isGenericOtpFlow ? "OTP verification" : "Email verification"}
          </p>
          <h1 className="section-title mt-3 text-4xl font-bold">Enter your OTP</h1>
          <p className="mt-3 text-[15px] leading-7 text-[var(--text-soft)]">
            We sent a six-digit verification code to <span className="font-semibold text-[var(--text-strong)]">{otpDestination}</span>.
          </p>

          <div className="input-shell mt-8 flex items-center rounded-3xl px-5 py-4">
            <input
              type="text"
              value={otp}
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full bg-transparent text-center text-3xl tracking-[0.8em] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>

          <button
            type="button"
            onClick={() => (isGenericOtpFlow ? verifyAuthOtp(otp) : verifyOtp(otp))}
            disabled={otp.length !== 6 || isVerifyingOtp}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3.5 font-semibold text-slate-950"
          >
            {isVerifyingOtp ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify email"
            )}
          </button>

          <button
            type="button"
            onClick={() => (isGenericOtpFlow ? resendAuthOtp() : resendOtp())}
            disabled={isResendingOtp || isRequestingAuthOtp}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-5 py-3.5 font-semibold text-[var(--text-strong)] transition hover:border-[var(--border-strong)]"
          >
            {isResendingOtp ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Sending a fresh OTP...
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                Generate a new OTP
              </>
            )}
          </button>

          <div className="mt-6 text-sm text-[var(--text-soft)]">
            Need to start over? <Link to="/auth?mode=signup" className="font-semibold text-[var(--accent)]">Create another account</Link>.
          </div>
        </div>
      </section>
    </main>
  );
};

export default VerifyEmailPage;
