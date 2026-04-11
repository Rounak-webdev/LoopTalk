import { motion } from "framer-motion";
import { ChevronRight, ShieldCheck, UserRoundPlus } from "lucide-react";

const MotionAside = motion.aside;

const SidebarContacts = ({
  contacts,
  hasContactPermission,
  isExpanded,
  onAllowContacts,
  onDeniedContacts,
  onExpand,
  onCollapse,
  onSelectContact,
  onToggle,
  selectedContactId,
}) => {
  const widthClass = isExpanded ? "w-[280px]" : "w-[76px]";

  return (
    <MotionAside
      animate={{ width: isExpanded ? 280 : 76 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      onMouseEnter={onExpand}
      onMouseLeave={onCollapse}
      className={`${widthClass} shrink-0 border-r border-[var(--border)] bg-[color:var(--bg-elevated)]/92 p-3 backdrop-blur-xl`}
    >
      <div className="flex h-full flex-col">
        <div className="mb-3 flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-white/6 p-2">
          <button
            type="button"
            onClick={onToggle}
            className="flex size-10 items-center justify-center rounded-2xl bg-[var(--accent)]/14 text-[var(--accent)]"
          >
            <UserRoundPlus className="size-4" />
          </button>
          {isExpanded && (
            <div className="flex min-w-0 flex-1 items-center justify-between pl-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text-strong)]">Contacts</p>
                <p className="text-xs text-[var(--text-muted)]">Quick launch rail</p>
              </div>
              <ChevronRight className={`size-4 text-[var(--text-muted)] transition ${isExpanded ? "rotate-180" : ""}`} />
            </div>
          )}
        </div>

        {!hasContactPermission ? (
          <div className={`mt-2 rounded-[28px] border border-dashed border-[var(--border)] bg-white/6 p-4 ${isExpanded ? "" : "px-2 py-4 text-center"}`}>
            <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-[var(--accent)]/12 text-[var(--accent)]">
              <ShieldCheck className="size-5" />
            </div>
            {isExpanded && (
              <>
                <p className="mt-4 text-base font-semibold text-[var(--text-strong)]">
                  Allow contact access?
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                  LoopTalk can simulate your contacts so you can preview real chat switching.
                </p>
                <button
                  type="button"
                  onClick={onAllowContacts}
                  className="mt-4 w-full rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-slate-950"
                >
                  Allow Access
                </button>
                <button
                  type="button"
                  onClick={onDeniedContacts}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-soft)]"
                >
                  Maybe Later
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto pr-1">
            {contacts.map((contact) => {
              const isActive = selectedContactId === contact.id;

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => onSelectContact(contact.id)}
                  className={`flex w-full items-center gap-3 rounded-[24px] border px-2.5 py-2.5 text-left transition ${
                    isActive
                      ? "border-[var(--border-strong)] bg-white/10 shadow-[0_18px_35px_rgba(0,0,0,0.12)]"
                      : "border-transparent hover:border-[var(--border)] hover:bg-white/6"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="size-11 rounded-2xl object-cover"
                    />
                    <span
                      className={`status-dot absolute -bottom-1 -right-1 size-3 rounded-full ${
                        contact.online ? "bg-[var(--success)]" : "bg-slate-500"
                      }`}
                    />
                  </div>

                  {isExpanded && (
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-strong)]">
                        {contact.name}
                      </p>
                      <p className="truncate text-xs text-[var(--text-soft)]">
                        {contact.status}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </MotionAside>
  );
};

export default SidebarContacts;
