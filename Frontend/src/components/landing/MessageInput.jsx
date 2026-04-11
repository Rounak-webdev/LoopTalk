import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Paperclip, SendHorizontal, SmilePlus, X } from "lucide-react";

const MotionDiv = motion.div;

const EMOJIS = ["😀", "🔥", "✨", "💬", "❤️", "🚀", "👏", "🎉"];

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const imageRef = useRef(null);
  const fileRef = useRef(null);

  const canSend = useMemo(() => Boolean(text.trim() || attachment), [attachment, text]);

  const loadFile = (file) => {
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          kind: "image",
          name: file.name,
          preview: reader.result,
          meta: `${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB`,
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    setAttachment({
      kind: "file",
      name: file.name,
      meta: `${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB`,
    });
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!canSend) return;

    onSendMessage({
      text: text.trim() || (attachment?.kind === "file" ? `Shared ${attachment.name}` : ""),
      image: attachment?.kind === "image" ? attachment.preview : "",
      file:
        attachment?.kind === "file"
          ? { name: attachment.name, meta: attachment.meta }
          : null,
    });

    setText("");
    setAttachment(null);
    setShowEmoji(false);
    if (imageRef.current) imageRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="relative z-10 border-t border-[var(--border)] bg-[color:var(--bg-elevated)]/94 px-4 py-4 backdrop-blur-xl sm:px-6">
      {attachment && (
        <MotionDiv
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center gap-3 rounded-[24px] border border-[var(--border)] bg-white/6 p-3"
        >
          {attachment.kind === "image" ? (
            <img src={attachment.preview} alt={attachment.name} className="size-16 rounded-2xl object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--accent)]/12 text-[var(--accent)]">
              <Paperclip className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--text-strong)]">{attachment.name}</p>
            <p className="text-xs text-[var(--text-soft)]">{attachment.meta}</p>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="flex size-9 items-center justify-center rounded-2xl border border-[var(--border)] text-[var(--text-soft)]"
          >
            <X className="size-4" />
          </button>
        </MotionDiv>
      )}

      <form onSubmit={handleSend} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-3">
        <div className="relative">
          <textarea
            rows={1}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type a message to preview the conversation..."
            className="min-h-[60px] w-full resize-none rounded-[24px] border border-transparent bg-[var(--bg-soft)] px-5 py-4 text-[15px] text-[var(--text-strong)] outline-none placeholder:text-[var(--text-muted)]"
          />

          {showEmoji && (
            <div className="absolute bottom-[calc(100%+12px)] left-0 grid grid-cols-4 gap-2 rounded-[24px] border border-[var(--border)] bg-[color:var(--bg-elevated)] p-3 shadow-2xl">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-2xl bg-white/6 px-3 py-2 text-xl"
                  onClick={() => {
                    setText((current) => `${current}${emoji}`);
                    setShowEmoji(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => loadFile(event.target.files?.[0])}
            />
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(event) => loadFile(event.target.files?.[0])}
            />

            <button
              type="button"
              onClick={() => setShowEmoji((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-soft)]"
            >
              <SmilePlus className="size-4" />
              <span>Emoji</span>
            </button>
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-soft)]"
            >
              <ImagePlus className="size-4" />
              <span>Image</span>
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-soft)]"
            >
              <Paperclip className="size-4" />
              <span>File</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
              canSend
                ? "bg-[var(--accent)] text-slate-950 shadow-[0_18px_36px_rgba(34,211,238,0.24)]"
                : "cursor-not-allowed border border-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            <span>Send</span>
            <SendHorizontal className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
