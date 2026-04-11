import { Server } from "socket.io";
import { isAllowedOrigin } from "./origins.js";
import { verifyAccessToken } from "../lib/token.js";
import User from "../models/user.model.js";

let ioInstance;
const onlineUsers = new Map();

const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const [key, ...rest] = part.split("=");
      accumulator[key] = decodeURIComponent(rest.join("="));
      return accumulator;
    }, {});

const emitOnlineUsers = () => {
  if (!ioInstance) return;
  ioInstance.emit("users:online", Array.from(onlineUsers.keys()));
};

const attachUserSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId) || new Set();
  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
};

const detachUserSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;

  sockets.delete(socketId);
  if (!sockets.size) {
    onlineUsers.delete(userId);
    return;
  }

  onlineUsers.set(userId, sockets);
};

const relayCallEvent = (targetUserId, event, payload) => {
  emitToUser(String(targetUserId), event, payload);
};

export const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;

  const sockets = onlineUsers.get(String(userId));
  if (!sockets?.size) return;

  for (const socketId of sockets) {
    ioInstance.to(socketId).emit(event, payload);
  }
};

export const initializeSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    },
  });

  ioInstance.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = socket.handshake.auth?.token || cookies.jwt;

      if (process.env.DEBUG_SOCKET === "true") {
        console.log("SOCKET AUTH:", {
          origin: socket.handshake.headers.origin || "unknown",
          hasCookieToken: Boolean(cookies.jwt),
          hasAuthToken: Boolean(socket.handshake.auth?.token),
        });
      }

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("Unauthorized"));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = String(socket.user._id);
    attachUserSocket(userId, socket.id);
    emitOnlineUsers();

    socket.on("messages:seen", ({ conversationId, messageIds, receiverId }) => {
      emitToUser(String(receiverId), "messages:seen", {
        conversationId,
        messageIds,
        seenAt: new Date().toISOString(),
      });
    });

    socket.on("call:initiate", ({ targetUserId, callType, offer }) => {
      if (!targetUserId || !offer) return;

      relayCallEvent(targetUserId, "call:incoming", {
        callType,
        offer,
        from: {
          _id: socket.user._id,
          fullName: socket.user.fullName || socket.user.name,
          profilePic: socket.user.profilePic || socket.user.avatar,
          email: socket.user.email,
        },
      });
    });

    socket.on("call:accept", ({ targetUserId, answer, callType }) => {
      if (!targetUserId || !answer) return;

      relayCallEvent(targetUserId, "call:accepted", {
        answer,
        callType,
        fromUserId: userId,
      });
    });

    socket.on("call:reject", ({ targetUserId, reason }) => {
      if (!targetUserId) return;

      relayCallEvent(targetUserId, "call:rejected", {
        reason: reason || "Call declined",
        fromUserId: userId,
      });
    });

    socket.on("call:ice-candidate", ({ targetUserId, candidate }) => {
      if (!targetUserId || !candidate) return;

      relayCallEvent(targetUserId, "call:ice-candidate", {
        candidate,
        fromUserId: userId,
      });
    });

    socket.on("call:end", ({ targetUserId, reason }) => {
      if (!targetUserId) return;

      relayCallEvent(targetUserId, "call:ended", {
        reason: reason || "Call ended",
        fromUserId: userId,
      });
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(userId, { lastSeenAt: new Date() }).catch(() => undefined);
      detachUserSocket(userId, socket.id);
      emitOnlineUsers();
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io has not been initialized");
  }

  return ioInstance;
};

export const getOnlineUserIds = () => Array.from(onlineUsers.keys());
