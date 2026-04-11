import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import {
  FileText,
  ImagePlus,
  Paperclip,
  SendHorizontal,
  SmilePlus,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

const QUICK_EMOJIS = ["😀", "🔥", "🎉", "❤️", "👍", "🚀", "😂", "🙏"];
const MotionDiv = motion.div;
const MotionButton = motion.button;

const formatFileSize = (sizeInBytes = 0) =>
  `${Math.max(sizeInBytes / 1024 / 1024, 0.01).toFixed(2)} MB`;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image preview failed"));
    };

    image.src = objectUrl;
  });

const compressImageFile = async (file) => {
  const image = await loadImage(file);
  const maxDimension = 1440;
  const scale = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
  const width = Math.max(Math.round(image.width * scale), 1);
  const height = Math.max(Math.round(image.height * scale), 1);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported");
  }

  context.drawImage(image, 0, 0, width, height);

  const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
  const estimatedBytes = Math.ceil((compressedDataUrl.length * 3) / 4);

  return {
    dataUrl: compressedDataUrl,
    size: estimatedBytes,
    type: "image/jpeg",
    width,
    height,
  };
};

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const { sendMessage, setDraftMessage } = useChatStore();

  const canSend = useMemo(() => Boolean(text.trim() || imagePreview || fileMeta), [fileMeta, imagePreview, text]);

  const syncDraft = (value) => {
    setText(value);
    startTransition(() => {
      setDraftMessage(value);
    });
  };

  useEffect(() => {
    return () => {
      if (fileMeta?.previewUrl) {
        URL.revokeObjectURL(fileMeta.previewUrl);
      }
    };
  }, [fileMeta]);

  const resetAttachment = () => {
    if (fileMeta?.previewUrl) URL.revokeObjectURL(fileMeta.previewUrl);
    setImagePreview(null);
    setFileMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const readImageFile = async (file) => {
    resetAttachment();
    try {
      const compressedImage = await compressImageFile(file);
      setFileMeta({
        name: file.name,
        size: compressedImage.size,
        sizeLabel: formatFileSize(compressedImage.size),
        type: compressedImage.type,
        width: compressedImage.width,
        height: compressedImage.height,
      });
      toast.success("Image attached");
      setImagePreview(compressedImage.dataUrl);
    } catch (error) {
      console.error("Image compression failed:", error);
      toast.error("Unable to process image");
    }
  };

  const readVideoFile = (file) => {
    resetAttachment();
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileMeta({
        name: file.name,
        size: file.size,
        sizeLabel: formatFileSize(file.size),
        type: file.type,
        dataUrl: reader.result,
        previewUrl: URL.createObjectURL(file),
      });
      toast.success("Video attached");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectedFile = (file) => {
    if (!file) return;

    if (file.type.startsWith("image/")) {
      readImageFile(file);
      return;
    }

    if (file.type.startsWith("video/")) {
      readVideoFile(file);
      return;
    }

    resetAttachment();
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileMeta({
        name: file.name,
        sizeLabel: formatFileSize(file.size),
        size: file.size,
        type: file.type,
        dataUrl: reader.result,
      });
      toast.success("File attached");
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => {
    handleSelectedFile(event.target.files?.[0]);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!canSend) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        file: imagePreview
          ? null
          : fileMeta
            ? {
                name: fileMeta.name,
                size: fileMeta.size,
                sizeLabel: fileMeta.sizeLabel,
                type: fileMeta.type,
                dataUrl: fileMeta.dataUrl,
              }
            : null,
      });

      syncDraft("");
      resetAttachment();
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const isVideoAttachment = Boolean(fileMeta?.type?.startsWith("video/"));

  return (
    <div className="relative z-10 border-t border-[var(--border)] bg-[color:var(--bg-elevated)]/98 px-4 py-3 backdrop-blur-xl sm:px-5">
      <AnimatePresence>
        {(imagePreview || fileMeta) && (
          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mb-3 flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-3"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="size-20 rounded-2xl object-cover"
              />
            ) : isVideoAttachment ? (
              <video
                src={fileMeta.previewUrl}
                className="size-20 rounded-2xl object-cover"
                muted
                playsInline
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-2xl bg-[var(--bg-soft)] text-[var(--accent)]">
                <FileText className="size-6" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[var(--text-strong)]">
                {fileMeta?.name || "Image attachment"}
              </p>
              <p className="text-sm text-[var(--text-soft)]">
                {imagePreview
                  ? `Ready to send as an image preview${fileMeta?.sizeLabel ? ` • ${fileMeta.sizeLabel}` : ""}.`
                  : isVideoAttachment
                    ? `Ready to send as a video clip${fileMeta?.sizeLabel ? ` • ${fileMeta.sizeLabel}` : ""}.`
                    : fileMeta?.type
                      ? `${fileMeta.type}${fileMeta?.sizeLabel ? ` • ${fileMeta.sizeLabel}` : ""}`
                  : fileMeta?.sizeLabel || "File added to the composer."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetAttachment}
              className="rounded-full border border-[var(--border)] p-2 text-[var(--text-soft)] transition hover:border-[var(--danger)]/40 hover:bg-[var(--danger)]/10"
            >
              <X className="size-4" />
            </button>
          </MotionDiv>
        )}
      </AnimatePresence>

      <div
        className={`rounded-[22px] border p-3 transition ${
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent)]/8"
            : "border-[var(--border)] bg-[var(--surface)]"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleSelectedFile(event.dataTransfer.files?.[0]);
        }}
      >
        <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              rows={1}
              value={text}
              onChange={(event) => syncDraft(event.target.value)}
              onFocus={() => setShowEmojiPicker(false)}
              placeholder="Write something thoughtful, quick, or wildly creative..."
              className="min-h-[54px] w-full resize-none rounded-[18px] border border-transparent bg-[var(--bg-soft)] px-4 py-3.5 text-[15px] text-[var(--text-strong)] outline-none placeholder:text-[var(--text-muted)]"
            />

            <AnimatePresence>
              {showEmojiPicker && (
                <MotionDiv
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  className="absolute bottom-[calc(100%+12px)] left-0 rounded-[24px] border border-[var(--border)] bg-[color:var(--bg-elevated)] p-3 shadow-2xl backdrop-blur-xl"
                >
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="rounded-2xl bg-white/6 px-3 py-2 text-xl transition hover:bg-white/12"
                        onClick={() => {
                          syncDraft(`${text}${emoji}`);
                          setShowEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={handleImageChange}
              />
              <input
                type="file"
                accept="video/*"
                className="hidden"
                ref={videoInputRef}
                onChange={handleImageChange}
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,application/*,text/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
                onClick={() => setShowEmojiPicker((value) => !value)}
              >
                <SmilePlus className="size-4" />
                <span>Emoji</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className="size-4" />
                <span>Image</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
                onClick={() => videoInputRef.current?.click()}
              >
                <Video className="size-4" />
                <span>Video</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-4" />
                <span>File</span>
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2 text-xs text-[var(--text-soft)] sm:inline-flex">
                <Sparkles className="size-3.5 text-[var(--accent)]" />
                <span>Drag and drop supported</span>
              </div>
            </div>

            <MotionButton
              whileTap={{ scale: 0.97 }}
              whileHover={canSend ? { scale: 1.02 } : {}}
              type="submit"
              disabled={!canSend}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                canSend
                  ? "bg-[var(--accent)] text-slate-950 shadow-[0_18px_30px_rgba(34,211,238,0.24)]"
                  : "cursor-not-allowed border border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              <span>Send</span>
              <SendHorizontal className="size-4" />
            </MotionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
