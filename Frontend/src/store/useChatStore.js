import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;
const WEBRTC_CONFIG = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ],
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let pendingCandidates = [];

const stopTracks = (stream) => {
  stream?.getTracks?.().forEach((track) => track.stop());
};

const createEmptyRemoteStream = () => {
  remoteStream = new MediaStream();
  return remoteStream;
};

const resetPeerResources = () => {
  if (peerConnection) {
    peerConnection.ontrack = null;
    peerConnection.onicecandidate = null;
    peerConnection.onconnectionstatechange = null;
    peerConnection.close();
  }

  stopTracks(localStream);
  stopTracks(remoteStream);

  peerConnection = null;
  localStream = null;
  remoteStream = null;
  pendingCandidates = [];
};

const updateActiveCall = (set, updater) => {
  set((state) => ({
    activeCall: state.activeCall ? updater(state.activeCall) : null,
  }));
};

const ensureMediaStream = async (callType) => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Media devices are not supported in this browser.");
  }

  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: callType === "video",
  });
};

const flushPendingCandidates = async () => {
  if (!peerConnection?.remoteDescription) return;

  const queuedCandidates = [...pendingCandidates];
  pendingCandidates = [];

  await Promise.all(
    queuedCandidates.map((candidate) => peerConnection.addIceCandidate(new RTCIceCandidate(candidate)))
  );
};

const createPeerConnection = (targetUserId, set, get) => {
  const socket = useAuthStore.getState().socket;
  if (!socket) {
    throw new Error("Socket connection is not ready yet.");
  }

  const connection = new RTCPeerConnection(WEBRTC_CONFIG);
  const remoteMediaStream = createEmptyRemoteStream();

  localStream?.getTracks().forEach((track) => {
    connection.addTrack(track, localStream);
  });

  connection.ontrack = (event) => {
    event.streams[0]?.getTracks().forEach((track) => {
      if (!remoteMediaStream.getTracks().some((existingTrack) => existingTrack.id === track.id)) {
        remoteMediaStream.addTrack(track);
      }
    });

    updateActiveCall(set, (activeCall) => ({
      ...activeCall,
      remoteStream: remoteMediaStream,
    }));
  };

  connection.onicecandidate = (event) => {
    if (!event.candidate) return;

    socket.emit("call:ice-candidate", {
      targetUserId,
      candidate: event.candidate.toJSON(),
    });
  };

  connection.onconnectionstatechange = () => {
    const connectionState = connection.connectionState;

    if (connectionState === "connected") {
      updateActiveCall(set, (activeCall) => ({
        ...activeCall,
        status: activeCall.callType === "video" ? "Video call connected" : "Voice call connected",
        startedAt: activeCall.startedAt || Date.now(),
      }));
    }

    if (["failed", "closed", "disconnected"].includes(connectionState)) {
      const activeCall = get().activeCall;
      if (activeCall) {
        get().finishCall("Connection ended", { notifyRemote: false });
      }
    }
  };

  peerConnection = connection;
  return connection;
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  draftMessage: "",
  hasSubscribedToMessages: false,
  hasSubscribedToCalls: false,
  activeCall: null,
  incomingCall: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load contacts right now"));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load messages"));
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) return;

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(getErrorMessage(error, "Message failed to send"));
      throw error;
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || get().hasSubscribedToMessages) return;

    socket.on("message:new", (message) => {
      const { selectedUser, messages } = get();
      if (!selectedUser?._id) return;

      const isForConversation =
        message.senderId === selectedUser._id || message.receiverId === selectedUser._id;

      if (isForConversation) {
        if (messages.some((existingMessage) => existingMessage._id === message._id)) {
          return;
        }
        set({ messages: [...messages, message] });
      }
    });

    socket.on("messages:seen", ({ messageIds, seenAt }) => {
      set({
        messages: get().messages.map((message) =>
          messageIds.includes(message._id) ? { ...message, seenAt } : message
        ),
      });
    });

    set({ hasSubscribedToMessages: true });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("message:new");
    socket.off("messages:seen");
    set({ hasSubscribedToMessages: false });
  },

  subscribeToCalls: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || get().hasSubscribedToCalls) return;

    socket.on("call:incoming", ({ callType, from, offer }) => {
      if (get().activeCall || get().incomingCall) {
        socket.emit("call:reject", {
          targetUserId: from._id,
          reason: "User is busy right now",
        });
        return;
      }

      set({
        incomingCall: {
          callType,
          from,
          offer,
        },
        selectedUser: from,
      });
      toast(callType === "video" ? `Incoming video call from ${from.fullName}` : `Incoming voice call from ${from.fullName}`, {
        icon: callType === "video" ? "🎥" : "📞",
      });
    });

    socket.on("call:accepted", async ({ answer, callType }) => {
      try {
        if (!peerConnection) return;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        await flushPendingCandidates();
        updateActiveCall(set, (activeCall) => ({
          ...activeCall,
          callType,
          status: "Connecting media…",
        }));
      } catch (error) {
        console.error("CALL ACCEPT ERROR:", error);
        get().finishCall("Unable to connect the call", { notifyRemote: false });
      }
    });

    socket.on("call:rejected", ({ reason }) => {
      toast.error(reason || "Call declined");
      get().finishCall(reason || "Call declined", { notifyRemote: false });
    });

    socket.on("call:ice-candidate", async ({ candidate }) => {
      try {
        if (!peerConnection) return;

        if (peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          return;
        }

        pendingCandidates.push(candidate);
      } catch (error) {
        console.error("ICE CANDIDATE ERROR:", error);
      }
    });

    socket.on("call:ended", ({ reason }) => {
      get().finishCall(reason || "Call ended", { notifyRemote: false });
    });

    set({ hasSubscribedToCalls: true });
  },

  unsubscribeFromCalls: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("call:incoming");
    socket.off("call:accepted");
    socket.off("call:rejected");
    socket.off("call:ice-candidate");
    socket.off("call:ended");
    set({ hasSubscribedToCalls: false });
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, messages: [] }),
  setDraftMessage: (draftMessage) => set({ draftMessage }),

  startCall: async (callType) => {
    const { selectedUser, activeCall, incomingCall } = get();
    const socket = useAuthStore.getState().socket;

    if (!selectedUser?._id) {
      toast.error("Select a contact before calling");
      return;
    }

    if (!socket) {
      toast.error("Socket connection is not ready yet");
      return;
    }

    if (activeCall || incomingCall) {
      toast.error("Finish the current call first");
      return;
    }

    try {
      localStream = await ensureMediaStream(callType);
      const connection = createPeerConnection(selectedUser._id, set, get);

      const isMuted = localStream.getAudioTracks().every((track) => !track.enabled);
      const isVideoEnabled = callType === "video" && localStream.getVideoTracks().some((track) => track.enabled);

      set({
        activeCall: {
          callType,
          direction: "outgoing",
          userId: selectedUser._id,
          participant: selectedUser,
          status: callType === "video" ? "Calling with video…" : "Calling with audio…",
          startedAt: null,
          isMuted,
          isVideoEnabled,
          isSpeakerEnabled: true,
          localStream,
          remoteStream: remoteStream || createEmptyRemoteStream(),
        },
      });

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      socket.emit("call:initiate", {
        targetUserId: selectedUser._id,
        callType,
        offer,
      });
    } catch (error) {
      console.error("CALL START ERROR:", error);
      resetPeerResources();
      set({ activeCall: null });
      toast.error(error.message || "Unable to start the call");
    }
  },

  acceptIncomingCall: async () => {
    const { incomingCall } = get();
    const socket = useAuthStore.getState().socket;

    if (!incomingCall || !socket) return;

    try {
      localStream = await ensureMediaStream(incomingCall.callType);
      const connection = createPeerConnection(incomingCall.from._id, set, get);

      set({
        selectedUser: incomingCall.from,
        activeCall: {
          callType: incomingCall.callType,
          direction: "incoming",
          userId: incomingCall.from._id,
          participant: incomingCall.from,
          status: "Connecting media…",
          startedAt: null,
          isMuted: localStream.getAudioTracks().every((track) => !track.enabled),
          isVideoEnabled: incomingCall.callType === "video" && localStream.getVideoTracks().some((track) => track.enabled),
          isSpeakerEnabled: true,
          localStream,
          remoteStream: remoteStream || createEmptyRemoteStream(),
        },
        incomingCall: null,
      });

      await connection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      await flushPendingCandidates();
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      socket.emit("call:accept", {
        targetUserId: incomingCall.from._id,
        answer,
        callType: incomingCall.callType,
      });
    } catch (error) {
      console.error("CALL ACCEPT ERROR:", error);
      resetPeerResources();
      set({ activeCall: null, incomingCall: null });
      toast.error(error.message || "Unable to answer the call");
    }
  },

  rejectIncomingCall: (reason = "Call declined") => {
    const { incomingCall } = get();
    const socket = useAuthStore.getState().socket;

    if (incomingCall && socket) {
      socket.emit("call:reject", {
        targetUserId: incomingCall.from._id,
        reason,
      });
    }

    set({ incomingCall: null });
  },

  finishCall: (reason = "Call ended", options = {}) => {
    const { notifyRemote = true } = options;
    const socket = useAuthStore.getState().socket;
    const activeCall = get().activeCall;

    if (notifyRemote && socket && activeCall?.userId) {
      socket.emit("call:end", {
        targetUserId: activeCall.userId,
        reason,
      });
    }

    resetPeerResources();
    set({ activeCall: null, incomingCall: null });
  },

  toggleMute: () => {
    if (!localStream) return;

    const nextMuted = localStream.getAudioTracks().every((track) => track.enabled);
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    updateActiveCall(set, (activeCall) => ({
      ...activeCall,
      isMuted: nextMuted,
    }));
  },

  toggleSpeaker: () =>
    updateActiveCall(set, (activeCall) => ({
      ...activeCall,
      isSpeakerEnabled: !activeCall.isSpeakerEnabled,
    })),

  toggleVideo: () => {
    if (!localStream) return;

    const videoTracks = localStream.getVideoTracks();
    if (!videoTracks.length) return;

    const nextVideoEnabled = videoTracks.every((track) => !track.enabled);
    videoTracks.forEach((track) => {
      track.enabled = nextVideoEnabled;
    });

    updateActiveCall(set, (activeCall) => ({
      ...activeCall,
      isVideoEnabled: nextVideoEnabled,
    }));
  },
}));
