import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";
import { CheckCheck, Download, FileText, Video } from "lucide-react";
import { formatAttachmentSize, formatMessageTime, getInitials } from "../lib/chat-ui";

const MotionDiv = motion.div;

const getAttachmentKind = (message) => {
  const source = `${message.fileType || ""} ${message.fileName || ""} ${message.fileUrl || ""}`.toLowerCase();

  if (source.includes("video/") || /\.(mp4|webm|ogg|mov|m4v)(\?|$)/.test(source)) {
    return "video";
  }

  if (source.includes("image/") || /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?|$)/.test(source)) {
    return "image";
  }

  return "file";
};

const ChatMessage = ({ message, otherUser, compact, isLastMessage }) => {
  const { authUser } = useAuthStore();
  const isMine = message.senderId === authUser?._id;
  const hasImage = Boolean(message.image);
  const fileName = message.fileName || null;
  const fileUrl = message.fileUrl || null;
  const attachmentKind = getAttachmentKind(message);
  const hasAttachmentImage = Boolean(fileUrl && attachmentKind === "image");
  const hasVideo = Boolean(fileUrl && attachmentKind === "video");
  const fileMeta =
    message.fileType ||
    message.fileSizeLabel ||
    formatAttachmentSize(message.fileSize) ||
    "Shared file";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex gap-3 ${isMine ? "justify-end" : "justify-start"} ${compact ? "mt-1" : "mt-4"}`}
    >
      {!isMine && (
        <div className={`shrink-0 ${compact ? "opacity-0" : ""}`}>
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {otherUser?.profilePic ? (
              <img src={otherUser.profilePic} alt={otherUser.fullName} className="size-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-[var(--text-soft)]">
                {getInitials(otherUser?.fullName)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className={`flex max-w-[88%] flex-col sm:max-w-[72%] ${isMine ? "items-end" : "items-start"}`}>
        {(!compact || hasImage || fileName) && (
          <div className={`mb-1 flex items-center gap-2 px-1 text-xs ${isMine ? "justify-end" : "justify-start"}`}>
            <span className={`font-semibold ${isMine ? "text-[var(--text-soft)]" : "text-[var(--text-soft)]"}`}>
              {isMine ? "You" : otherUser?.fullName}
            </span>
            <span className="text-[var(--text-muted)]">{formatMessageTime(message.createdAt)}</span>
          </div>
        )}

        <div
          className={`overflow-hidden rounded-[22px] border px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.1)] ${
            isMine
              ? "border-transparent text-white"
              : "border-[var(--border)] bg-[var(--bubble-them)] text-[var(--text-strong)]"
          }`}
          style={isMine ? { background: "var(--bubble-me)" } : undefined}
        >
          {hasImage && (
            <div className="mb-3 overflow-hidden rounded-[18px] border border-black/8 bg-black/10">
              <img src={message.image} alt="Attachment" loading="lazy" className="max-h-80 w-full object-cover" />
            </div>
          )}

          {hasAttachmentImage && !hasImage && (
            <div className="mb-3 overflow-hidden rounded-[18px] border border-black/8 bg-black/10">
              <img src={fileUrl} alt={fileName || "Shared image"} loading="lazy" className="max-h-80 w-full object-cover" />
            </div>
          )}

          {hasVideo && (
            <div className="mb-3 overflow-hidden rounded-[18px] border border-black/8 bg-black/10">
              <video
                src={fileUrl}
                controls
                preload="metadata"
                className="max-h-80 w-full rounded-[18px] bg-black object-cover"
              />
            </div>
          )}

          {fileName && !hasVideo && !hasAttachmentImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-3 flex items-center gap-3 rounded-2xl bg-black/10 p-3 no-underline"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/15">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{fileName}</p>
                <p className="text-xs opacity-80">{fileMeta}</p>
              </div>
              <Download className="size-4" />
            </a>
          )}

          {fileName && hasVideo && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-3 flex items-center gap-3 rounded-2xl bg-black/10 p-3 no-underline"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/15">
                <Video className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{fileName}</p>
                <p className="text-xs opacity-80">{fileMeta}</p>
              </div>
              <Download className="size-4" />
            </a>
          )}

          {message.text && (
            <p className="whitespace-pre-wrap break-words text-sm leading-6 sm:text-[15px]">
              {message.text}
            </p>
          )}

          <div className={`mt-2 flex items-center gap-1 text-[11px] ${isMine ? "justify-end text-white/75" : "justify-end text-[var(--text-muted)]"}`}>
            <span>{formatMessageTime(message.createdAt)}</span>
            {isMine && (
              <>
                <CheckCheck className="size-3.5" />
                <span>{isLastMessage ? "Delivered" : "Sent"}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default ChatMessage;
