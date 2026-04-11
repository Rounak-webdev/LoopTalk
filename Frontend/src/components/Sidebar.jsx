import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { LogOut, Search, Settings, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionButton = motion.button;

const Sidebar = ({ isOpen, onClose }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { logout, onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return users.filter((user) => {
      const matchesPresence = showOnlineOnly ? onlineUsers.includes(user._id) : true;
      const matchesSearch = query
        ? `${user.fullName} ${user.email} ${user.phoneNumber || ""}`.toLowerCase().includes(query)
        : true;

      return matchesPresence && matchesSearch;
    });
  }, [deferredSearch, onlineUsers, showOnlineOnly, users]);

  const panelClassName = `absolute inset-y-0 left-0 z-30 w-full max-w-[320px] border-r border-[var(--border)] bg-[color:var(--sidebar)] p-3 transition md:static md:z-auto md:max-w-none md:translate-x-0 ${
    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  }`;

  if (isUsersLoading) {
    return <SidebarSkeleton isCollapsed={false} isOpen={isOpen} onClose={onClose} />;
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="absolute inset-0 z-20 bg-slate-950/45 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <motion.aside
        animate={{ width: 320 }}
        transition={{ type: "spring", stiffness: 250, damping: 28 }}
        className={`shrink-0 md:w-[22%] md:min-w-[280px] md:max-w-[340px] ${panelClassName}`}
      >
        <div className="flex h-full flex-col rounded-none md:rounded-r-[24px] bg-[color:var(--sidebar)]">
          <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[color:var(--sidebar)] pb-3">
            <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-2 md:hidden">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Friends</p>
                <h2 className="section-title mt-1 text-xl font-bold">Chats</h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-[var(--border)] p-2 text-[var(--text-soft)]"
                onClick={onClose}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3">
              <Search className="size-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search friends..."
                aria-label="Search contacts"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-semibold text-[var(--text-strong)]">Friends</p>
                <p className="text-xs text-[var(--text-muted)]">{filteredUsers.length} chats</p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-soft)]">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                onChange={(event) => setShowOnlineOnly(event.target.checked)}
                aria-label="Show only online contacts"
                className="size-4 rounded border-[var(--border)] bg-transparent text-[var(--accent)]"
              />
                Online
              </label>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden pt-3">
            <div className="scrollbar-thin flex h-full flex-col gap-2.5 overflow-y-auto pr-1">
              {filteredUsers.map((user, index) => {
                const isSelected = selectedUser?._id === user._id;
                const isOnline = onlineUsers.includes(user._id);

                return (
                  <MotionButton
                    key={user._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      setSelectedUser(user);
                      onClose?.();
                    }}
                    className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3.5 text-left transition ${
                      isSelected
                        ? "border-[var(--border-strong)] bg-white/10 shadow-[0_12px_24px_rgba(0,0,0,0.14)]"
                        : "border-transparent hover:border-[var(--border)] hover:bg-white/6"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="size-12 rounded-2xl object-cover"
                      />
                      <span
                        className={`status-dot absolute -bottom-1 -right-1 size-3 rounded-full ${
                          isOnline ? "bg-[var(--success)]" : "bg-slate-500"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-[var(--text-strong)]">{user.fullName}</p>
                        <span className={`text-[11px] ${isOnline ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <p className="line-clamp-1 mt-1 text-sm text-[var(--text-soft)]">
                        {user.phoneNumber || user.email}
                      </p>
                    </div>
                  </MotionButton>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] px-6 text-center">
                  <p className="section-title text-lg font-bold">No matches found</p>
                  <p className="mt-2 text-sm text-[var(--text-soft)]">
                    Try a broader search or switch off the online filter.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-[var(--border)] pt-3">
            <div className="grid gap-2">
              <Link
                to="/settings"
                className="inline-flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-medium text-[var(--text-soft)] transition hover:border-[var(--border)] hover:bg-white/6 hover:text-[var(--text-strong)]"
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-medium text-[var(--text-soft)] transition hover:border-[var(--danger)]/30 hover:bg-[var(--danger)]/10 hover:text-[var(--text-strong)]"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
