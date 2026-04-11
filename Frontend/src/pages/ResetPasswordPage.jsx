import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { isResettingPassword, resetPassword } = useAuthStore();

  return (
    <main className="min-h-screen px-4 pb-10 pt-28 sm:px-6">
      <section className="mx-auto max-w-xl">
        <div className="glass-panel rounded-[36px] p-8 sm:p-10">
          <div className="flex size-14 items-center justify-center rounded-[22px] bg-[var(--accent)]/14 text-[var(--accent)]">
            <Lock className="size-7" />
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Reset password</p>
          <h1 className="section-title mt-3 text-4xl font-bold">Create a new password</h1>
          <p className="mt-3 text-[15px] leading-7 text-[var(--text-soft)]">
            Choose a strong password and you’ll be able to log back in immediately.
          </p>

          <div className="input-shell mt-8 flex items-center gap-3 rounded-2xl px-4 py-3">
            <Lock className="size-5 text-[var(--text-muted)]" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="New password"
              className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>

          <button
            type="button"
            disabled={isResettingPassword || password.length < 6}
            onClick={async () => {
              const success = await resetPassword(token, password);
              if (success) navigate("/auth?mode=login");
            }}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3.5 font-semibold text-slate-950"
          >
            {isResettingPassword ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update password"
            )}
          </button>

          <div className="mt-6 text-sm text-[var(--text-soft)]">
            Back to <Link to="/auth?mode=login" className="font-semibold text-[var(--accent)]">login</Link>.
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
