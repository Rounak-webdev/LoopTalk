import { Users } from "lucide-react";

const SidebarSkeleton = ({ isCollapsed, isOpen, onClose }) => {
  const skeletonContacts = Array(8).fill(null);

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
      <aside
        className={`absolute inset-y-0 left-0 z-30 w-full max-w-[360px] border-r border-[var(--border)] bg-[color:var(--sidebar)] p-4 backdrop-blur-xl transition md:static md:z-auto md:max-w-none md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ width: isCollapsed ? 88 : 340 }}
      >
        <div className="flex h-full flex-col gap-4">
          <div className="glass-panel rounded-[28px] p-4">
            <div className="flex items-center gap-2 text-[var(--text-soft)]">
              <Users className="size-5" />
              <span className="font-semibold">Loading chats</span>
            </div>
            {!isCollapsed && (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-2xl bg-white/8" />
                  <div className="h-20 rounded-2xl bg-white/8" />
                </div>
                <div className="mt-4 h-12 rounded-2xl bg-white/8" />
                <div className="mt-4 h-12 rounded-2xl bg-white/8" />
              </>
            )}
          </div>

          <div className="flex-1 rounded-[28px] border border-[var(--border)] bg-[color:var(--surface)] p-3">
            {!isCollapsed && <div className="mb-3 h-4 w-32 rounded-full bg-white/10" />}
            <div className="scrollbar-thin space-y-2 overflow-y-auto">
              {skeletonContacts.map((_, idx) => (
                <div key={idx} className={`flex items-center ${isCollapsed ? "justify-center px-1" : "gap-3 px-3"} rounded-2xl py-3`}>
                  <div className="size-12 rounded-2xl bg-white/10" />
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-28 rounded-full bg-white/10" />
                      <div className="mt-2 h-3 w-20 rounded-full bg-white/10" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarSkeleton;
