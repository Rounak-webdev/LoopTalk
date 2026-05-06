import { create } from "zustand";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios.js";
import { SOCKET_URL } from "../lib/runtime.js";
import toast from "react-hot-toast";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.userMessage || fallback;
const pendingEmailKey = "looptalk-pending-email";
const pendingOtpSessionKey = "looptalk-pending-otp-session";
const readPendingOtpSession = () => {
  try {
    return JSON.parse(localStorage.getItem(pendingOtpSessionKey) || "null");
  } catch {
    return null;
  }
};

let socketInstance = null;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  pendingVerificationEmail: localStorage.getItem(pendingEmailKey) || "",
  pendingOtpSession: readPendingOtpSession(),
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isVerifyingOtp: false,
  isResendingOtp: false,
  isRequestingAuthOtp: false,
  isSendingResetEmail: false,
  isResettingPassword: false,
  isGoogleAuthLoading: false,
  isAuthWorking: false,
  onlineUsers: [],
  socket: null,

  setPendingVerificationEmail: (email) => {
    localStorage.setItem(pendingEmailKey, email);
    set({ pendingVerificationEmail: email });
  },

  setPendingOtpSession: (session) => {
    if (session) {
      localStorage.setItem(pendingOtpSessionKey, JSON.stringify(session));
    } else {
      localStorage.removeItem(pendingOtpSessionKey);
    }

    set({ pendingOtpSession: session });
  },

  connectSocket: () => {
    if (socketInstance?.connected) return;

    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("users:online", (users) => {
      set({ onlineUsers: users });
    });

    socketInstance.on("connect", () => {
      console.log("SOCKET CONNECTED:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      set({ onlineUsers: [] });
    });

    socketInstance.on("connect_error", (error) => {
      console.error("SOCKET ERROR:", error.message);
    });

    set({ socket: socketInstance });
  },

  disconnectSocket: () => {
    if (!socketInstance) return;
    socketInstance.disconnect();
    socketInstance = null;
    set({ socket: null, onlineUsers: [] });
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/user/me");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.user });
      get().setPendingVerificationEmail("");
      get().setPendingOtpSession(null);
      get().connectSocket();
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create account"));
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      get().setPendingVerificationEmail("");
      get().setPendingOtpSession(null);
      get().connectSocket();
      toast.success("Logged in successfully");
      return { success: true };
    } catch (error) {
      toast.error(getErrorMessage(error, "Login failed"));
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  verifyOtp: async (otp) => {
    const email = get().pendingVerificationEmail;

    if (!email) {
      toast.error("No pending verification email found");
      return false;
    }

    set({ isVerifyingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      set({ authUser: res.data.user });
      get().setPendingVerificationEmail("");
      get().connectSocket();
      toast.success("Email verified successfully");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Verification failed"));
      return false;
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  requestAuthOtp: async (payload) => {
    set({ isRequestingAuthOtp: true });
    try {
      const res = await axiosInstance.post("/auth/request-auth-otp", payload);
      get().setPendingOtpSession({
        channel: res.data.channel,
        destination: res.data.destination,
        email: payload.email || "",
        phoneNumber: payload.phoneNumber || "",
        intent: payload.intent || "login",
        fullName: payload.fullName || "",
      });
      toast.success(res.data.message || "OTP sent successfully");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send OTP"));
      return false;
    } finally {
      set({ isRequestingAuthOtp: false });
    }
  },

  verifyAuthOtp: async (otp) => {
    const pendingOtpSession = get().pendingOtpSession;

    if (!pendingOtpSession) {
      toast.error("No OTP session is waiting to be verified");
      return false;
    }

    set({ isVerifyingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/verify-auth-otp", {
        channel: pendingOtpSession.channel,
        email: pendingOtpSession.email,
        phoneNumber: pendingOtpSession.phoneNumber,
        otp,
      });
      set({ authUser: res.data.user });
      get().setPendingOtpSession(null);
      get().setPendingVerificationEmail("");
      get().connectSocket();
      toast.success("OTP verified successfully");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "OTP verification failed"));
      return false;
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  resendOtp: async () => {
    const email = get().pendingVerificationEmail;

    if (!email) {
      toast.error("No pending verification email found");
      return false;
    }

    set({ isResendingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/resend-otp", { email });
      get().setPendingVerificationEmail(res.data.email || email);
      toast.success(res.data.message || "A new OTP has been sent");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to resend OTP"));
      return false;
    } finally {
      set({ isResendingOtp: false });
    }
  },

  resendAuthOtp: async () => {
    const pendingOtpSession = get().pendingOtpSession;

    if (!pendingOtpSession) {
      toast.error("No OTP session found");
      return false;
    }

    set({ isResendingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/resend-auth-otp", {
        channel: pendingOtpSession.channel,
        email: pendingOtpSession.email,
        phoneNumber: pendingOtpSession.phoneNumber,
      });
      get().setPendingOtpSession({
        ...pendingOtpSession,
        destination: res.data.destination || pendingOtpSession.destination,
      });
      toast.success(res.data.message || "A fresh OTP has been sent");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to resend OTP"));
      return false;
    } finally {
      set({ isResendingOtp: false });
    }
  },

  googleAuth: async (token) => {
    set({ isGoogleAuthLoading: true });
    try {
      const res = await axiosInstance.post("/auth/google", { token });
      set({ authUser: res.data.user });
      get().setPendingVerificationEmail("");
      get().connectSocket();
      toast.success("Signed in with Google");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Google sign-in failed"));
      return false;
    } finally {
      set({ isGoogleAuthLoading: false });
    }
  },

  forgotPassword: async (email) => {
    if (!email) {
      toast.error("Enter your email address");
      return false;
    }

    set({ isSendingResetEmail: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Reset email sent");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send reset email"));
      return false;
    } finally {
      set({ isSendingResetEmail: false });
    }
  },

  resetPassword: async (token, password) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post("/auth/reset-password", { token, password });
      toast.success(res.data.message || "Password updated");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reset password"));
      return false;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.get("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
      get().setPendingVerificationEmail("");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Logout failed"));
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Profile update failed"));
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
