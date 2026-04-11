import { useEffect, useState } from "react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Check, LogOut, MoonStar, ShieldCheck, Sparkles, Volume2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const storageKeys = {
  syncContacts: "looptalk-sync-contacts",
  readReceipts: "looptalk-read-receipts",
  notificationTone: "looptalk-notification-tone",
};

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { logout } = useAuthStore();
  const [syncContacts, setSyncContacts] = useState(() => localStorage.getItem(storageKeys.syncContacts) !== "false");
  const [readReceipts, setReadReceipts] = useState(() => localStorage.getItem(storageKeys.readReceipts) !== "false");
  const [notificationTone, setNotificationTone] = useState(
    () => localStorage.getItem(storageKeys.notificationTone) || "Chime"
  );

  useEffect(() => {
    localStorage.setItem(storageKeys.syncContacts, String(syncContacts));
  }, [syncContacts]);

  useEffect(() => {
    localStorage.setItem(storageKeys.readReceipts, String(readReceipts));
  }, [readReceipts]);

  useEffect(() => {
    localStorage.setItem(storageKeys.notificationTone, notificationTone);
  }, [notificationTone]);

  return (
    <main className="min-h-screen px-4 pb-10 pt-28 sm:px-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="glass-panel rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Settings</p>
              <h1 className="section-title mt-3 text-4xl font-bold">Theme direction</h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--text-soft)]">
                The redesign narrows the interface to three curated modes instead of dozens of generic presets. Each one supports the same premium spacing and conversation-first hierarchy.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/6 px-4 py-2 text-sm text-[var(--text-soft)]">
              <MoonStar className="size-4 text-[var(--accent)]" />
              <span>{THEMES.find((item) => item.id === theme)?.name || "Theme selected"}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            {THEMES.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`text-left rounded-[28px] border p-5 transition ${
                  theme === option.id
                    ? "border-[var(--border-strong)] bg-[var(--surface)] shadow-xl"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                }`}
                onClick={() => setTheme(option.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="section-title text-2xl font-bold">{option.name}</p>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--text-soft)]">
                      {option.description}
                    </p>
                  </div>
                  {theme === option.id && (
                    <div className="rounded-full bg-[var(--accent)]/15 p-2 text-[var(--accent)]">
                      <Check className="size-4" />
                    </div>
                  )}
                </div>

                <div className="mt-5 flex gap-3">
                  {option.swatches.map((swatch) => (
                    <span
                      key={swatch}
                      className="h-12 w-full rounded-2xl border border-white/10"
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="surface-card rounded-[32px] p-6">
              <p className="section-title text-2xl font-bold">Quick controls</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-4">
                  <div>
                    <p className="font-semibold text-[var(--text-strong)]">Sync contacts</p>
                    <p className="text-sm text-[var(--text-soft)]">Show people already available on Loop Talk.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSyncContacts((value) => !value)}
                    className={`relative h-8 w-14 rounded-full transition ${syncContacts ? "bg-[var(--accent)]" : "bg-[var(--bg-muted)]"}`}
                    aria-pressed={syncContacts}
                  >
                    <span
                      className={`absolute top-1 size-6 rounded-full bg-white shadow transition ${syncContacts ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-4">
                  <div>
                    <p className="font-semibold text-[var(--text-strong)]">Read receipts</p>
                    <p className="text-sm text-[var(--text-soft)]">Let people know when you have seen their message.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReadReceipts((value) => !value)}
                    className={`relative h-8 w-14 rounded-full transition ${readReceipts ? "bg-[var(--accent)]" : "bg-[var(--bg-muted)]"}`}
                    aria-pressed={readReceipts}
                  >
                    <span
                      className={`absolute top-1 size-6 rounded-full bg-white shadow transition ${readReceipts ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <label className="flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-4">
                  <div>
                    <p className="font-semibold text-[var(--text-strong)]">Notification tone</p>
                    <p className="text-sm text-[var(--text-soft)]">Choose the alert sound that feels right.</p>
                  </div>
                  <select
                    value={notificationTone}
                    onChange={(event) => setNotificationTone(event.target.value)}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none"
                  >
                    {["Chime", "Ripple", "Echo", "Classic"].map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="surface-card rounded-[32px] p-6">
              <div className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
                <Sparkles className="size-4 text-[var(--accent)]" />
                Live preview
              </div>
              <div data-theme={theme} className="mt-5 rounded-[28px] border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="rounded-[24px] border border-[var(--border)] bg-[color:var(--bg-elevated)] p-4">
                  <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                    <div className="size-10 rounded-2xl bg-[var(--accent)]/16" />
                    <div>
                      <p className="font-semibold text-[var(--text-strong)]">Jordan Rivers</p>
                      <p className="text-xs text-[var(--text-soft)]">Typing a message...</p>
                    </div>
                  </div>

                  <div className="space-y-3 py-4">
                    <div className="max-w-[78%] rounded-[22px] border border-[var(--border)] bg-[var(--bubble-them)] px-4 py-3 text-sm text-[var(--text-strong)]">
                      This theme feels calm but still premium.
                    </div>
                    <div
                      className="ml-auto max-w-[78%] rounded-[22px] px-4 py-3 text-sm text-slate-950"
                      style={{ background: "var(--bubble-me)" }}
                    >
                      Perfect. The bubbles pop without overwhelming the layout.
                    </div>
                  </div>

                  <div className="rounded-full border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-3 text-sm text-[var(--text-muted)]">
                    Type a message...
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-card rounded-[32px] p-6">
              <p className="section-title text-2xl font-bold">Design notes</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-soft)]">
                <div className="flex items-start gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-3">
                  <ShieldCheck className="mt-1 size-4 text-[var(--accent)]" />
                  <p>OTP verification now relies on a real email inbox, so fake and obviously invalid domains are rejected earlier.</p>
                </div>
                <div className="flex items-start gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-3">
                  <Volume2 className="mt-1 size-4 text-[var(--accent)]" />
                  <p>Your tone, theme, contact sync, and read-receipt preferences stay available the next time you open the app.</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-2.5 font-semibold text-[var(--text-strong)] transition hover:border-[var(--danger)]/50"
                >
                  <LogOut className="size-4" />
                  Logout securely
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
export default SettingsPage;
