import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  LockKeyhole,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Smartphone,
  SunMedium,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useThemeStore } from "../store/useThemeStore";

const MotionDiv = motion.div;

const contacts = [
  {
    id: "alina",
    name: "Alina",
    avatar: "A",
    online: true,
    lastSeen: "online",
    action: "Chat",
    accent: "from-[#25D366] to-[#6ee7b7]",
  },
  {
    id: "rohan",
    name: "Rohan",
    avatar: "R",
    online: true,
    lastSeen: "typing...",
    action: "Chat",
    accent: "from-[#128C7E] to-[#25D366]",
  },
  {
    id: "meera",
    name: "Meera",
    avatar: "M",
    online: false,
    lastSeen: "Invite to Loop Talk",
    action: "Invite",
    accent: "from-[#0f766e] to-[#14b8a6]",
  },
  {
    id: "kabir",
    name: "Kabir",
    avatar: "K",
    online: true,
    lastSeen: "last seen 5m ago",
    action: "Chat",
    accent: "from-[#22c55e] to-[#16a34a]",
  },
];

const conversation = [
  {
    id: "m1",
    sender: "them",
    label: "Alina",
    text: "Contacts synced perfectly. I can already see three friends on Loop Talk.",
    time: "09:18",
  },
  {
    id: "m2",
    sender: "me",
    label: "You",
    text: "Nice. The privacy copy should feel reassuring, not scary.",
    time: "09:19",
    status: "Delivered",
  },
  {
    id: "m3",
    sender: "them",
    label: "Alina",
    text: "Done. I also attached the launch poster for the invite flow.",
    time: "09:20",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "m4",
    sender: "them",
    label: "Alina",
    text: "And here is the onboarding document.",
    time: "09:21",
    file: { name: "looptalk-onboarding.pdf", meta: "1.8 MB" },
  },
  {
    id: "m5",
    sender: "me",
    label: "You",
    text: "Perfect. Shipping the full-screen interface now.",
    time: "09:23",
    status: "Seen",
  },
];

const screenTabs = [
  { id: "onboarding", label: "Onboarding", icon: Smartphone },
  { id: "permission", label: "Permission", icon: LockKeyhole },
  { id: "sync", label: "Sync", icon: Users },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "invite", label: "Invite", icon: Share2 },
  { id: "settings", label: "Settings", icon: Settings },
];

const featureCards = [
  {
    title: "Private by default",
    copy: "Clear permission language, visible sync controls, and a settings surface that keeps contact access transparent.",
    icon: ShieldCheck,
  },
  {
    title: "Contact-first messaging",
    copy: "Find who is already on Loop Talk, start conversations instantly, and invite everyone else in the same flow.",
    icon: Users,
  },
  {
    title: "Built for motion",
    copy: "Premium transitions, soft depth, and familiar message patterns that feel native on both Android and iOS.",
    icon: ArrowRight,
  },
];

const screenCardClass =
  "relative overflow-hidden rounded-[28px] border border-white/10 bg-[color:var(--surface)]/85 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-2xl transition duration-300 ease-out hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[0_30px_90px_rgba(0,0,0,0.22)]";

const PhoneFrame = ({ children, className = "" }) => (
  <div className={`relative mx-auto aspect-[9/16] w-full max-w-[300px] max-h-[560px] rounded-[36px] border border-white/12 bg-[color:var(--surface-contrast)]/95 p-2.5 shadow-[0_34px_110px_rgba(0,0,0,0.34),0_0_0_1px_rgba(255,255,255,0.04)_inset] transition duration-300 ease-out ${className}`}>
    <div className="absolute left-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[color:var(--bg)]/80 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]" />
    <div className="h-full overflow-hidden rounded-[28px] bg-[var(--surface-strong)] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">{children}</div>
  </div>
);

const SectionHeader = ({ eyebrow, title, copy }) => (
  <div className="space-y-4">
    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--text-muted)]">{eyebrow}</p>
    <h2 className="section-title text-2xl font-bold leading-tight text-[var(--text-strong)] sm:text-3xl">{title}</h2>
    <p className="max-w-2xl text-sm leading-7 text-[var(--text-soft)] sm:text-base">{copy}</p>
  </div>
);

const OnboardingScreen = () => (
  <PhoneFrame>
    <div className="relative min-h-[580px] bg-[linear-gradient(180deg,rgba(37,211,102,0.18),transparent_36%),linear-gradient(180deg,var(--surface-strong),var(--surface))] px-5 pb-6 pt-14">
      <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.22),transparent_68%)]">
        <div className="grid grid-cols-2 gap-3">
          {["A", "K", "N", "S"].map((avatar) => (
            <div
              key={avatar}
              className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-[color:var(--bg-soft)] text-2xl font-semibold text-[var(--text-strong)]"
            >
              {avatar}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 space-y-4 text-center">
        <p className="section-title text-4xl font-bold">Welcome to Loop Talk</p>
        <p className="mx-auto max-w-xs text-sm leading-6 text-[var(--text-soft)]">
          Chat with friends instantly, keep your contacts private, and start conversations with zero friction.
        </p>
      </div>
      <button
        type="button"
        className="mt-10 flex w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#34d399,#25D366_48%,#16a34a)] px-5 py-4 font-semibold text-[#08130b] shadow-[0_18px_46px_rgba(37,211,102,0.32)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_58px_rgba(37,211,102,0.42)] active:translate-y-0"
      >
        <span>Get Started</span>
        <ArrowRight className="size-4" />
      </button>
    </div>
  </PhoneFrame>
);

const PermissionScreen = () => (
  <PhoneFrame>
    <div className="min-h-[580px] bg-[linear-gradient(180deg,rgba(18,140,126,0.14),transparent_26%),linear-gradient(180deg,var(--surface-strong),var(--surface))] px-5 pb-6 pt-14">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-[rgba(37,211,102,0.24)] bg-[rgba(37,211,102,0.14)] text-[#25D366]">
        <LockKeyhole className="size-10" />
      </div>
      <div className="mt-8 text-center">
        <p className="section-title text-3xl font-bold">Find Your Friends</p>
        <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
          We use your contacts to help you connect with people you already know. Your data stays private and you can turn syncing off anytime.
        </p>
      </div>
      <div className="mt-10 rounded-[28px] border border-[var(--border)] bg-[color:var(--bg-soft)] p-5">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(37,211,102,0.15)] text-[#25D366]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-strong)]">Private contact matching</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
              Only the people already on Loop Talk appear as ready to chat.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        <button
          type="button"
          className="w-full rounded-[20px] bg-[linear-gradient(135deg,#34d399,#25D366_48%,#16a34a)] px-5 py-4 font-semibold text-[#08130b] shadow-[0_18px_46px_rgba(37,211,102,0.32)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_58px_rgba(37,211,102,0.42)] active:translate-y-0"
        >
          Allow Access
        </button>
        <button
          type="button"
          className="w-full rounded-[20px] border border-[var(--border)] bg-[color:var(--surface)]/80 px-5 py-4 font-medium text-[var(--text-strong)] transition duration-300 ease-out hover:border-[var(--border-strong)] hover:bg-[color:var(--surface)] active:scale-[0.99]"
        >
          Not Now
        </button>
      </div>
    </div>
  </PhoneFrame>
);

const SyncScreen = () => (
  <PhoneFrame>
    <div className="flex min-h-[580px] flex-col items-center justify-center bg-[linear-gradient(180deg,rgba(37,211,102,0.12),transparent_28%),linear-gradient(180deg,var(--surface-strong),var(--surface))] px-5">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[rgba(37,211,102,0.2)] bg-[rgba(37,211,102,0.08)]">
        <motion.div
          className="absolute inset-0 rounded-full border border-[#25D366]/40"
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.12, 0.5] }}
          transition={{ duration: 2.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <Users className="size-10 text-[#25D366]" />
      </div>
      <p className="section-title mt-10 text-3xl font-bold">Syncing your contacts...</p>
      <p className="mt-3 max-w-xs text-center text-sm leading-6 text-[var(--text-soft)]">
        We are matching your phonebook securely and preparing your chat list.
      </p>
      <div className="mt-8 w-full rounded-full bg-[color:var(--bg-soft)] p-1">
        <motion.div
          className="h-3 rounded-full bg-[linear-gradient(90deg,#128C7E,#25D366)]"
          initial={{ width: "18%" }}
          animate={{ width: ["18%", "76%", "100%"] }}
          transition={{ duration: 3.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Encrypted contact check</p>
    </div>
  </PhoneFrame>
);

const ContactsScreen = ({ activeContactId, onSelectContact }) => (
  <PhoneFrame>
    <div className="relative min-h-[580px] bg-[linear-gradient(180deg,rgba(37,211,102,0.11),transparent_20%),linear-gradient(180deg,var(--surface-strong),var(--surface))]">
      <div className="px-5 pb-4 pt-14">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-title text-3xl font-bold">Contacts</p>
            <p className="mt-1 text-sm text-[var(--text-soft)]">Find who is already on Loop Talk</p>
          </div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[color:var(--bg-soft)] text-[var(--text-strong)]"
          >
            <Search className="size-5" />
          </button>
        </div>
        <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[color:var(--bg-soft)] px-4 py-3 text-sm text-[var(--text-muted)]">
          Search by name or number
        </div>
      </div>
      <div className="px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">On Loop Talk</p>
        <div className="mt-4 space-y-3">
          {contacts.map((contact) => {
            const isActive = contact.id === activeContactId;
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => onSelectContact(contact.id)}
                className={`flex w-full items-center gap-3 rounded-[22px] border p-4 text-left shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition duration-300 ease-out hover:-translate-y-0.5 ${
                  isActive
                    ? "border-[#25D366]/45 bg-[rgba(37,211,102,0.14)]"
                    : "border-[var(--border)] bg-[color:var(--surface)]/90 hover:border-[#25D366]/35 hover:bg-[color:var(--surface)]"
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-semibold text-white ${contact.accent}`}>
                  {contact.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--text-strong)]">{contact.name}</p>
                  <p className="truncate text-sm text-[var(--text-soft)]">{contact.lastSeen}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    contact.action === "Chat"
                      ? "bg-[rgba(37,211,102,0.14)] text-[#25D366]"
                      : "bg-[color:var(--bg-soft)] text-[var(--text-soft)]"
                  }`}
                >
                  {contact.action}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Invite Friends</p>
          <div className="mt-4 rounded-[24px] border border-dashed border-[var(--border)] bg-[color:var(--bg-soft)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(18,140,126,0.18)] text-[#25D366]">
                <UserPlus className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-strong)]">Bring your inner circle in</p>
                <p className="text-sm text-[var(--text-soft)]">Share an invite link in one tap.</p>
              </div>
              <Share2 className="size-4 text-[var(--text-muted)]" />
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#34d399,#25D366_48%,#16a34a)] text-[#07110b] shadow-[0_18px_46px_rgba(37,211,102,0.38)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(37,211,102,0.48)] active:translate-y-0"
      >
        <MessageCircle className="size-6" />
      </button>
    </div>
  </PhoneFrame>
);

const ChatScreen = ({ activeContact }) => (
  <PhoneFrame className="max-w-[312px]">
    <div className="flex min-h-[580px] flex-col bg-[linear-gradient(180deg,rgba(37,211,102,0.08),transparent_18%),linear-gradient(180deg,var(--surface-strong),var(--surface))]">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-5 pt-14">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-semibold text-white ${activeContact.accent}`}>
          {activeContact.avatar}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[var(--text-strong)]">{activeContact.name}</p>
          <p className="text-sm font-medium text-[#25D366] drop-shadow-[0_0_10px_rgba(37,211,102,0.28)]">{activeContact.online ? "Online now" : activeContact.lastSeen}</p>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--bg-soft)] text-[var(--text-soft)]"
        >
          <Search className="size-4" />
        </button>
      </div>
      <div className="flex-1 space-y-4 px-4 py-5">
        <p className="mx-auto w-fit rounded-full bg-[color:var(--bg-soft)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
          Today
        </p>
        {conversation.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[84%] rounded-[24px] px-4 py-3 shadow-[0_14px_38px_rgba(0,0,0,0.12)] ring-1 ring-white/5 ${
                message.sender === "me"
                  ? "rounded-br-md bg-[linear-gradient(135deg,#34d399,#25D366_52%,#16a34a)] text-[#07110b]"
                  : "rounded-bl-md bg-[color:var(--bg-soft)]/95 text-[var(--text-strong)] backdrop-blur"
              }`}
            >
              <p className={`text-xs font-semibold ${message.sender === "me" ? "text-[#07110b]/70" : "text-[var(--text-muted)]"}`}>
                {message.label}
              </p>
              {message.text && <p className="mt-1 text-sm leading-6">{message.text}</p>}
              {message.image && (
                <img
                  src={message.image}
                  alt="Shared preview"
                  className="mt-3 h-40 w-full rounded-2xl object-cover"
                />
              )}
              {message.file && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-black/10 px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/25">
                    <Paperclip className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{message.file.name}</p>
                    <p className="text-xs opacity-70">{message.file.meta}</p>
                  </div>
                </div>
              )}
              <div className={`mt-2 flex items-center justify-end gap-2 text-[11px] ${message.sender === "me" ? "text-[#07110b]/60" : "text-[var(--text-muted)]"}`}>
                <span>{message.time}</span>
                {message.status && (
                  <span className="inline-flex items-center gap-1">
                    <Check className="size-3" />
                    {message.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 px-2 text-sm text-[var(--text-muted)]">
          <span className="h-2 w-2 rounded-full bg-[#25D366] shadow-[0_0_0_4px_rgba(37,211,102,0.12),0_0_18px_rgba(37,211,102,0.72)]" />
          Alina is typing...
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-4">
        <div className="flex items-center gap-3 rounded-[22px] border border-[var(--border)] bg-[color:var(--bg-soft)] px-3 py-3">
          <button type="button" className="text-[var(--text-muted)]">
            <SunMedium className="size-5" />
          </button>
          <input
            readOnly
            value="Type a message"
            className="flex-1 bg-transparent text-sm text-[var(--text-muted)] outline-none"
          />
          <button type="button" className="text-[var(--text-muted)]">
            <Paperclip className="size-5" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#34d399,#25D366_48%,#16a34a)] text-[#07110b] shadow-[0_10px_26px_rgba(37,211,102,0.28)] transition duration-300 ease-out hover:scale-105 active:scale-95"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  </PhoneFrame>
);

const InviteScreen = () => (
  <PhoneFrame>
    <div className="min-h-[580px] bg-[linear-gradient(180deg,rgba(18,140,126,0.11),transparent_24%),linear-gradient(180deg,var(--surface-strong),var(--surface))] px-5 pb-6 pt-14">
      <p className="section-title text-3xl font-bold">Invite Friends</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
        Share your link across the apps your friends already use.
      </p>
      <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-[color:var(--bg-soft)] p-5">
        <p className="text-sm text-[var(--text-muted)]">Share link</p>
        <p className="mt-2 rounded-2xl bg-[color:var(--surface)] px-4 py-3 text-sm font-medium text-[var(--text-strong)]">
          looptalk.app/invite/AB24F
        </p>
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#34d399,#25D366_48%,#16a34a)] px-5 py-4 font-semibold text-[#08130b] shadow-[0_18px_46px_rgba(37,211,102,0.3)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_58px_rgba(37,211,102,0.4)] active:translate-y-0"
        >
          <Share2 className="size-4" />
          Share Invite Link
        </button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {["WhatsApp", "SMS", "Copy Link", "More"].map((channel) => (
          <div key={channel} className="rounded-[24px] border border-[var(--border)] bg-[color:var(--surface)] px-4 py-5 text-center text-sm font-semibold text-[var(--text-strong)]">
            {channel}
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {["Meera", "Disha", "Vikram"].map((friend) => (
          <div key={friend} className="flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-[color:var(--surface)] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,211,102,0.14)] font-semibold text-[#25D366]">
                {friend[0]}
              </div>
              <span className="font-medium text-[var(--text-strong)]">{friend}</span>
            </div>
            <button
              type="button"
              className="rounded-full bg-[rgba(37,211,102,0.14)] px-3 py-1 text-xs font-semibold text-[#25D366]"
            >
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  </PhoneFrame>
);

const SettingsScreen = () => (
  <PhoneFrame>
    <div className="min-h-[580px] bg-[linear-gradient(180deg,rgba(37,211,102,0.09),transparent_20%),linear-gradient(180deg,var(--surface-strong),var(--surface))] px-5 pb-6 pt-14">
      <div className="flex items-center gap-4 rounded-[28px] border border-[var(--border)] bg-[color:var(--surface)] p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#128C7E,#25D366)] text-xl font-semibold text-white">
          C
        </div>
        <div>
          <p className="section-title text-2xl font-bold">Loop Talk</p>
          <p className="text-sm text-[var(--text-soft)]">Safety-first messaging</p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {[
          ["Sync Contacts", "On"],
          ["Privacy Settings", "Manage"],
          ["Notification Tone", "Default"],
          ["Theme", "Light / Dark"],
          ["Logout", "Secure"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-[color:var(--surface)] px-4 py-4">
            <div>
              <p className="font-medium text-[var(--text-strong)]">{label}</p>
              <p className="text-sm text-[var(--text-soft)]">{value}</p>
            </div>
            <ChevronRight className="size-4 text-[var(--text-muted)]" />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-[24px] border border-[rgba(37,211,102,0.24)] bg-[rgba(37,211,102,0.1)] p-4">
        <p className="font-semibold text-[var(--text-strong)]">Privacy promise</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
          Your contact syncing is optional, reversible, and explained in plain language inside settings.
        </p>
      </div>
    </div>
  </PhoneFrame>
);

const LandingPage = () => {
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState("chat");
  const [activeContactId, setActiveContactId] = useState(contacts[0].id);

  const activeContact = useMemo(
    () => contacts.find((contact) => contact.id === activeContactId) || contacts[0],
    [activeContactId]
  );

  const screenPreview = useMemo(() => {
    switch (activeTab) {
      case "onboarding":
        return <OnboardingScreen />;
      case "permission":
        return <PermissionScreen />;
      case "sync":
        return <SyncScreen />;
      case "contacts":
        return <ContactsScreen activeContactId={activeContactId} onSelectContact={setActiveContactId} />;
      case "chat":
        return <ChatScreen activeContact={activeContact} />;
      case "invite":
        return <InviteScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <ChatScreen activeContact={activeContact} />;
    }
  }, [activeContact, activeContactId, activeTab]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_-8%,rgba(37,211,102,0.22),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(59,130,246,0.16),transparent_30%),linear-gradient(180deg,color-mix(in_srgb,var(--bg)_94%,black_6%),var(--bg))] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="mesh-orb left-[-160px] top-[-110px] size-[420px] bg-[#25D366]" />
      <div className="mesh-orb bottom-[-150px] right-[-90px] size-[430px] bg-[#128C7E]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col">
        <div className="sticky top-4 z-30 flex items-center justify-between rounded-[24px] border border-white/10 bg-[color:var(--bg-elevated)]/82 px-3 py-2.5 shadow-[0_18px_54px_rgba(0,0,0,0.16)] backdrop-blur-2xl sm:px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[rgba(37,211,102,0.16)] text-[#25D366] shadow-[0_0_0_1px_rgba(37,211,102,0.12)_inset]">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <p className="section-title text-lg font-bold">Loop Talk</p>
              <p className="text-sm text-[var(--text-soft)]">Connect. Chat. Share instantly.</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle binary />
            <Link
              to="/auth?mode=login"
              className="hidden rounded-full border border-[var(--border)] bg-white/[0.03] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-white/[0.07] active:translate-y-0 sm:inline-flex"
            >
              Login
            </Link>
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#34d399,#25D366_48%,#16a34a)] px-4 py-2 text-sm font-semibold text-[#08130b] shadow-[0_12px_34px_rgba(37,211,102,0.28)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(37,211,102,0.38)] active:translate-y-0"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <section className="grid flex-1 gap-8 pb-8 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="grid gap-6 lg:pr-5"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--text-muted)]">
                Full-screen mobile-first experience
              </p>
              <h1 className="hero-display mt-4 max-w-3xl text-[2.6rem] font-semibold leading-[0.98] text-[var(--text-strong)] sm:text-[4rem] xl:text-[4.65rem]">
                A messaging interface that feels trusted before the first chat begins.
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[var(--text-soft)] sm:text-[1.05rem]">
                Loop Talk turns the landing page into a real product preview: onboarding, permission design, contact syncing, invite loops, and a polished chat surface built for Android and iOS.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#34d399,#25D366_48%,#16a34a)] px-6 py-3.5 font-semibold text-[#08130b] shadow-[0_18px_46px_rgba(37,211,102,0.32)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(37,211,102,0.44)] active:translate-y-0"
              >
                Start Messaging
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/auth?mode=login"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[color:var(--surface)]/75 px-6 py-3.5 font-medium text-[var(--text-strong)] shadow-[0_12px_34px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-1 hover:border-[var(--border-strong)] hover:bg-[color:var(--surface)] active:translate-y-0"
              >
                View Login Flow
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {featureCards.map((card) => (
                <MotionDiv
                  key={card.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`${screenCardClass} flex min-h-[176px] flex-col`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(37,211,102,0.12)] text-[#25D366] shadow-[0_0_0_1px_rgba(37,211,102,0.14)_inset]">
                    <card.icon className="size-5" />
                  </div>
                  <p className="mt-5 text-lg font-semibold text-[var(--text-strong)]">{card.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">{card.copy}</p>
                </MotionDiv>
              ))}
            </div>

            <div className={`${screenCardClass} grid gap-6 sm:grid-cols-3`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Design system</p>
                <p className="mt-3 text-base font-semibold text-[var(--text-strong)]">Inter / SF Pro inspired typography</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">8px spacing rhythm, soft shadows, 12 to 20px radii, and clear green accents for trust.</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Primary colors</p>
                <div className="mt-3 flex gap-3">
                  {[
                    ["#25D366", "Primary"],
                    ["#128C7E", "Secondary"],
                    [theme === "looptalk-light" ? "#F7F7F7" : "#121212", "Surface"],
                  ].map(([color, label]) => (
                    <div key={label} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-3 py-2">
                      <span className="h-5 w-5 rounded-full border border-black/5" style={{ background: color }} />
                      <span className="text-sm text-[var(--text-soft)]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Ready for build</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                  Every screen is set up as a reusable mobile pattern for auth, sync, invite, and real chat states.
                </p>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
            className="grid gap-5"
          >
            <div className={`${screenCardClass} p-4`}>
              <div className="flex flex-wrap gap-2">
                {screenTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-300 ease-out active:scale-[0.98] ${
                        isActive
                          ? "bg-[linear-gradient(135deg,#34d399,#25D366_48%,#16a34a)] text-[#08130b] shadow-[0_10px_26px_rgba(37,211,102,0.26)]"
                          : "bg-[color:var(--bg-soft)] text-[var(--text-soft)] hover:-translate-y-0.5 hover:bg-[color:var(--surface)] hover:text-[var(--text-strong)]"
                      }`}
                    >
                      <Icon className="size-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <MotionDiv
              key={activeTab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`${screenCardClass} min-h-[600px] p-5 sm:p-6`}
            >
              {screenPreview}
            </MotionDiv>
          </MotionDiv>
        </section>

        <section className="grid gap-6 py-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div className={screenCardClass}>
            <SectionHeader
              eyebrow="Trust Layer"
              title="Permission UX that explains itself"
              copy="The copy is friendly, direct, and calm. Instead of asking users to trust the app blindly, the interface shows why contacts help and reminds them the choice stays reversible."
            />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              "Sync contacts only when the user understands the value.",
              "Separate people already on Loop Talk from invite candidates.",
              "Keep chat, invite, and settings visually related so the journey feels coherent.",
            ].map((item) => (
              <div key={item} className={screenCardClass}>
                <p className="text-sm leading-7 text-[var(--text-soft)]">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default LandingPage;
