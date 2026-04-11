export const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatConversationDate = (value) =>
  new Date(value).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const isSameDay = (left, right) =>
  new Date(left).toDateString() === new Date(right).toDateString();

export const isCompactMessageGroup = (current, previous) => {
  if (!previous) return false;

  const sameSender = current.senderId === previous.senderId;
  const withinFiveMinutes =
    Math.abs(new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime()) <
    5 * 60 * 1000;

  return sameSender && isSameDay(current.createdAt, previous.createdAt) && withinFiveMinutes;
};

export const formatCallDuration = (milliseconds = 0) => {
  const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const formatAttachmentSize = (sizeInBytes = 0) =>
  sizeInBytes > 0 ? `${Math.max(sizeInBytes / 1024 / 1024, 0.01).toFixed(2)} MB` : "";
