import { Menu, Phone, Search, Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = ({ onOpenSidebar }) => {
  const { activeCall, draftMessage, incomingCall, selectedUser, setSelectedUser, startCall } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isCallingThisUser = activeCall?.userId === selectedUser._id;
  const statusLabel = draftMessage.trim()
    ? "Typing a message..."
    : incomingCall?.from?._id === selectedUser._id
      ? incomingCall.callType === "video"
        ? "Incoming video call"
        : "Incoming voice call"
    : isCallingThisUser
      ? activeCall.callType === "video"
        ? "In video call"
        : "In voice call"
      : isOnline
      ? "Active now"
      : "Last seen recently";

  return (
    <div className="relative z-10 border-b border-[var(--border)] bg-[color:var(--bg-elevated)]/96 px-4 py-3.5 backdrop-blur-xl sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-[var(--border)] p-2 text-[var(--text-soft)] md:hidden"
            onClick={onOpenSidebar}
            aria-label="Open contact sidebar"
          >
            <Menu className="size-4" />
          </button>

          <div className="relative">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="size-11 rounded-2xl object-cover"
            />
            <span
              className={`status-dot absolute -bottom-1 -right-1 size-3 rounded-full ${
                isOnline ? "bg-[var(--success)]" : "bg-slate-500"
              }`}
            />
          </div>

          <div>
            <h3 className="section-title text-lg font-bold">{selectedUser.fullName}</h3>
            <p className="text-[13px] text-[var(--text-soft)]">
              {statusLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[Phone, Video].map((Icon) => (
            <button
              key={Icon.displayName || Icon.name}
              type="button"
              onClick={() => {
                if (Icon === Phone) startCall("audio");
                if (Icon === Video) startCall("video");
              }}
              disabled={Boolean(activeCall)}
              className="rounded-full border border-[var(--border)] bg-white/6 p-2.5 text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
              aria-label={Icon === Phone ? "Start audio call" : "Start video call"}
            >
              <Icon className="size-4" />
            </button>
          ))}
          <button
            type="button"
            className="hidden rounded-full border border-[var(--border)] bg-white/6 p-2.5 text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-strong)] sm:inline-flex"
            aria-label="Search inside conversation"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedUser(null)}
            className="rounded-full border border-[var(--border)] p-2.5 text-[var(--text-soft)] transition hover:border-[var(--danger)]/40 hover:bg-[var(--danger)]/10 hover:text-[var(--text-strong)]"
            aria-label="Close current conversation"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
