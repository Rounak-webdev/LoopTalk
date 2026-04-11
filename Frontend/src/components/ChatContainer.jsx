import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useChatStore } from "../store/useChatStore";
import { formatConversationDate, isCompactMessageGroup, isSameDay } from "../lib/chat-ui";

const ChatContainer = ({ onOpenSidebar }) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          onOpenSidebar={onOpenSidebar}
        />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[color:var(--surface-strong)]">
      <div className="floating-grid absolute inset-0 opacity-40" />
      <ChatHeader
        onOpenSidebar={onOpenSidebar}
      />

      <div className="scrollbar-thin relative flex-1 overflow-y-auto bg-[color:var(--surface-strong)]/42 px-4 pb-4 pt-4 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex min-h-full items-center justify-center">
            <div className="max-w-sm rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-8 py-10 text-center">
              <p className="section-title text-2xl font-bold">Start the conversation</p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                Send a thoughtful hello, share an image, or drop a file card to kick off this chat.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pb-2">
            {messages.map((message, index) => {
              const previousMessage = messages[index - 1];
              const showDateDivider =
                !previousMessage || !isSameDay(message.createdAt, previousMessage.createdAt);

              return (
                <div key={message._id}>
                  {showDateDivider && (
                    <div className="sticky top-3 z-10 my-4 flex justify-center">
                      <span className="rounded-full border border-[var(--border)] bg-[color:var(--bg-elevated)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] backdrop-blur-xl">
                        {formatConversationDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <ChatMessage
                    message={message}
                    otherUser={selectedUser}
                    compact={isCompactMessageGroup(message, previousMessage)}
                    isLastMessage={index === messages.length - 1}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
