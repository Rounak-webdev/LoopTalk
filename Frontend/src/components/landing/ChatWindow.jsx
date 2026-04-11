import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, Search, Video } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const MotionDiv = motion.div;

const ChatWindow = ({ conversation, hasContactPermission, onSendMessage, onSidebarToggle }) => {
  const bottomRef = useRef(null);

  const groupedMessages = useMemo(() => {
    if (!conversation) return [];

    return conversation.messages.map((message, index) => ({
      ...message,
      compact:
        index > 0 &&
        conversation.messages[index - 1].sender === message.sender &&
        Math.abs(
          new Date(message.timestamp).getTime() -
            new Date(conversation.messages[index - 1].timestamp).getTime()
        ) <
          5 * 60 * 1000,
    }));
  }, [conversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupedMessages]);

  if (!hasContactPermission || !conversation) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <p className="section-title text-3xl font-bold">Grant access and pick a contact</p>
          <p className="mt-4 text-base leading-7 text-[var(--text-soft)]">
            The landing page becomes a live chat playground once contacts are enabled. You’ll be able to switch people instantly, preview typing states, and send demo messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-[color:var(--surface)]">
      <div className="floating-grid absolute inset-0 opacity-35" />

      <div className="relative z-10 flex items-center justify-between border-b border-[var(--border)] bg-[color:var(--bg-elevated)]/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSidebarToggle}
            className="flex size-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/6 text-[var(--text-soft)]"
          >
            <Menu className="size-4" />
          </button>
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="size-12 rounded-2xl object-cover"
          />
          <div>
            <p className="section-title text-xl font-bold">{conversation.name}</p>
            <p className="text-sm text-[var(--text-soft)]">
              {conversation.typing ? "Typing now..." : conversation.status}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {[Phone, Video, Search].map((Icon) => (
            <button
              key={Icon.name}
              type="button"
              className="flex size-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/6 text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="scrollbar-thin relative flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <AnimatePresence initial={false}>
          {groupedMessages.map((message) => (
            <MotionDiv
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <MessageBubble
                avatar={conversation.avatar}
                compact={message.compact}
                message={message}
                participantName={conversation.name}
              />
            </MotionDiv>
          ))}
        </AnimatePresence>

        {conversation.typing && (
          <div className="mt-4 flex justify-start">
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bubble-them)] px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="size-2 animate-bounce rounded-full bg-[var(--text-soft)] [animation-delay:-0.3s]" />
                <span className="size-2 animate-bounce rounded-full bg-[var(--text-soft)] [animation-delay:-0.15s]" />
                <span className="size-2 animate-bounce rounded-full bg-[var(--text-soft)]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatWindow;
