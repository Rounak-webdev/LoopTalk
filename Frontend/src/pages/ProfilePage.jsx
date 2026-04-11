import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, Sparkles, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <main className="min-h-screen px-4 pb-10 pt-28 sm:px-6">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[32px] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Profile</p>
          <h1 className="section-title mt-3 text-4xl font-bold">Your LoopTalk identity</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--text-soft)]">
            A polished presence card with editable avatar, clear account details, and enough breathing room to feel premium.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] px-6 py-8 text-center">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-[32px] object-cover shadow-lg"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute -bottom-2 -right-2 rounded-2xl border border-[var(--border)] bg-[var(--accent)] p-3 text-slate-950 transition hover:scale-105 ${
                  isUpdatingProfile ? "pointer-events-none animate-pulse" : ""
                }`}
              >
                <Camera className="size-5" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <div>
              <p className="section-title text-2xl font-bold">{authUser?.fullName}</p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">{authUser?.email}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                {isUpdatingProfile ? "Uploading avatar..." : "Tap the camera to refresh your look"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="surface-card rounded-[24px] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm text-[var(--text-soft)]">
                <User className="size-4 text-[var(--accent)]" />
                Full name
              </div>
              <p className="text-lg font-semibold text-[var(--text-strong)]">{authUser?.fullName}</p>
            </div>
            <div className="surface-card rounded-[24px] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm text-[var(--text-soft)]">
                <Mail className="size-4 text-[var(--accent)]" />
                Email
              </div>
              <p className="text-lg font-semibold text-[var(--text-strong)]">{authUser?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-[32px] p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
              <Sparkles className="size-4 text-[var(--accent)]" />
              Account health
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-[var(--bg-soft)] px-4 py-4">
                <span className="text-[var(--text-soft)]">Member since</span>
                <span className="font-semibold text-[var(--text-strong)]">
                  {authUser.createdAt?.split("T")[0]}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[var(--bg-soft)] px-4 py-4">
                <span className="text-[var(--text-soft)]">Status</span>
                <span className="rounded-full bg-[var(--success)]/14 px-3 py-1 text-sm font-semibold text-[var(--success)]">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[var(--bg-soft)] px-4 py-4">
                <span className="text-[var(--text-soft)]">Default theme</span>
                <span className="font-semibold text-[var(--text-strong)]">Premium chat modes</span>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-[32px] p-6 sm:p-8">
            <p className="section-title text-2xl font-bold">What changed in the redesign</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-soft)]">
              <li>Avatar presentation is larger and more polished to strengthen identity.</li>
              <li>Account metadata now lives in calm, scannable cards instead of dense blocks.</li>
              <li>The profile page matches the chat product language with glass panels and depth.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};
export default ProfilePage;
