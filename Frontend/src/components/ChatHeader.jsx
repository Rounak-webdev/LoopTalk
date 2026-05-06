import { Menu, MoreVertical, Phone, Search, Trash2, UserMinus, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = ({ onOpenSidebar }) => {
  const {
    activeCall,
    deleteChat,
    draftMessage,
    incomingCall,
    removeFriend,
    selectedUser,
    setSelectedUser,
    startCall,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
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

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [isMenuOpen]);

  const handleDeleteChat = async () => {
    const confirmed = window.confirm(`Delete your chat with ${selectedUser.fullName}?`);
    if (!confirmed) return;

    setIsMenuOpen(false);
    await deleteChat(selectedUser._id);
  };

  const handleRemoveFriend = async () => {
    const confirmed = window.confirm(`Remove ${selectedUser.fullName} from your friends?`);
    if (!confirmed) return;

    setIsMenuOpen(false);
    await removeFriend(selectedUser._id);
  };

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
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
              className="rounded-full border border-[var(--border)] bg-white/6 p-2.5 text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
              aria-label="Open chat actions"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="size-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-2xl border border-[var(--border)] bg-[color:var(--bg-elevated)] p-1.5 shadow-[0_22px_55px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={handleDeleteChat}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--text-soft)] transition hover:bg-white/6 hover:text-[var(--text-strong)]"
                >
                  <Trash2 className="size-4" />
                  <span>Delete chat</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveFriend}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/10"
                >
                  <UserMinus className="size-4" />
                  <span>Remove friend</span>
                </button>
              </div>
            )}
          </div>
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
