import { CheckCheck, Download, FileText } from "lucide-react";

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const MessageBubble = ({ avatar, compact, message, participantName }) => {
  const isMine = message.sender === "me";

  return (
    <div className={`${compact ? "mt-1" : "mt-4"} flex ${isMine ? "justify-end" : "justify-start"} gap-3`}>
      {!isMine && (
        <div className={`${compact ? "opacity-0" : ""} shrink-0`}>
          <img src={avatar} alt={participantName} className="size-10 rounded-2xl object-cover" />
        </div>
      )}

      <div className={`flex max-w-[84%] flex-col ${isMine ? "items-end" : "items-start"} sm:max-w-[68%]`}>
        {!compact && (
          <div className={`mb-1 flex items-center gap-2 px-1 text-xs ${isMine ? "justify-end" : "justify-start"}`}>
            <span className="font-semibold text-[var(--text-soft)]">
              {isMine ? "You" : participantName}
            </span>
            <span className="text-[var(--text-muted)]">{formatTime(message.timestamp)}</span>
          </div>
        )}

        <div
          className={`overflow-hidden rounded-[24px] border px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.12)] ${
            isMine
              ? "border-transparent text-slate-950"
              : "border-[var(--border)] bg-[var(--bubble-them)] text-[var(--text-strong)]"
          }`}
          style={isMine ? { background: "var(--bubble-me)" } : undefined}
        >
          {message.image && (
            <div className="mb-3 overflow-hidden rounded-[18px] border border-black/10 bg-black/10">
              <img src={message.image} alt="Shared visual" className="max-h-72 w-full object-cover" />
            </div>
          )}

          {message.file && (
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-black/10 p-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/15">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{message.file.name}</p>
                <p className="text-xs opacity-80">{message.file.meta}</p>
              </div>
              <Download className="size-4" />
            </div>
          )}

          <p className="whitespace-pre-wrap break-words text-[15px] leading-6">{message.text}</p>

          <div className={`mt-2 flex items-center gap-1 text-[11px] ${isMine ? "text-slate-900/72" : "text-[var(--text-muted)]"}`}>
            <span>{formatTime(message.timestamp)}</span>
            {isMine && (
              <>
                <CheckCheck className="size-3.5" />
                <span>{message.state || "Delivered"}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
