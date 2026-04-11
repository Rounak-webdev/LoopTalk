import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import CallOverlay from "../components/CallOverlay";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
  const { selectedUser, subscribeToCalls, unsubscribeFromCalls } = useChatStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    subscribeToCalls();
    return () => unsubscribeFromCalls();
  }, [subscribeToCalls, unsubscribeFromCalls]);

  return (
    <main className="relative h-screen overflow-hidden px-0 py-0">
      <div className="mesh-orb left-[-50px] top-28 size-44 bg-[var(--accent)]" />
      <div className="mesh-orb bottom-10 right-8 size-56 bg-[var(--accent-strong)]" />

      <section className="flex h-screen w-full overflow-hidden bg-[color:var(--bg-elevated)]">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="relative flex min-w-0 flex-1">
          <AnimatePresence>
            <CallOverlay />
          </AnimatePresence>

          {!selectedUser ? (
            <NoChatSelected onOpenSidebar={() => setIsSidebarOpen(true)} />
          ) : (
            <ChatContainer
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          )}

          {!selectedUser && (
            <button
              type="button"
              className="absolute left-4 top-4 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] shadow-lg md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              Open chats
            </button>
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
