import { useAuthStore } from "../store/useAuthStore";

const ChatMessage = ({ message, otherUser }) => {
  const { authUser } = useAuthStore();
  const isMine = message.senderId === authUser?._id;

  return (
    <div className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
      <div className="chat-image avatar">
        <div className="size-10 rounded-full border border-base-300">
          <img
            src={isMine ? authUser?.profilePic || "/avatar.png" : otherUser?.profilePic || "/avatar.png"}
            alt={isMine ? authUser?.fullName : otherUser?.fullName}
          />
        </div>
      </div>

      <div className="chat-header mb-1 text-xs opacity-60">
        {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>

      <div className={`chat-bubble ${isMine ? "chat-bubble-primary" : "chat-bubble-secondary"} shadow-sm`}>
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="mb-2 rounded-md max-w-[220px] border border-base-300"
          />
        )}
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;
