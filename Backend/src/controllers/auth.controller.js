import bcrypt from "bcryptjs";
import { resolve4, resolve6, resolveMx } from "node:dns/promises";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../lib/cloudinary.js";
import { sendPasswordResetEmail } from "../lib/auth-email.js";
import { sendPhoneOtp } from "../lib/auth-sms.js";
import { generateOtp, generateResetToken, hashToken } from "../lib/auth-utils.js";
import { clearAuthCookie, issueAuthSession } from "../lib/token.js";
import User from "../models/user.model.js";
import { serializeUser } from "./user.controller.js";

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const verificationWindowMs = 10 * 60 * 1000;
const resetWindowMs = 60 * 60 * 1000;
const blockedEmailDomains = new Set(
  [
    "example.com",
    "example.org",
    "example.net",
    "test.com",
    "fake.com",
    "invalid.com",
    "mailinator.com",
    "guerrillamail.com",
    "yopmail.com",
    "10minutemail.com",
    "temp-mail.org",
    "tempmail.com",
    ...(process.env.BLOCKED_EMAIL_DOMAINS || "")
      .split(",")
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean),
  ]
);

const authPayload = (user) => ({
  user: serializeUser(user),
});

const createAuthOtpState = (channel) => ({
  authOtp: generateOtp(),
  authOtpExpiresAt: new Date(Date.now() + verificationWindowMs),
  authOtpChannel: channel,
});

const isEmailFormatValid = (email) =>
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(email);

const normalizePhoneNumber = (phoneNumber = "") => {
  const trimmed = String(phoneNumber).trim();
  const normalized = trimmed.replace(/[^\d+]/g, "");
  return normalized.startsWith("+") ? normalized : `+${normalized}`;
};

const isPhoneFormatValid = (phoneNumber) => /^\+[1-9]\d{9,14}$/.test(phoneNumber);

const sendOtpByChannel = async ({ channel, email, phoneNumber, name, otp }) => {
  if (channel === "phone") {
    return sendPhoneOtp({ name, otp, phoneNumber });
  }

  return sendVerificationOtpEmail({ email, name, otp });
};

const hasDeliverableDomain = async (email) => {
  const domain = email.split("@")[1];

  if (!domain || blockedEmailDomains.has(domain)) {
    return false;
  }

  try {
    const mxRecords = await resolveMx(domain);
    if (mxRecords.length > 0) return true;
  } catch {}

  try {
    const aRecords = await resolve4(domain);
    if (aRecords.length > 0) return true;
  } catch {}

  try {
    const aaaaRecords = await resolve6(domain);
    if (aaaaRecords.length > 0) return true;
  } catch {}

  return false;
};

export const signup = async (req, res) => {
  const { fullName, name, email, password } = req.body;

  try {
    if (process.env.DEBUG_AUTH === "true") {
      console.log("BODY:", req.body);
    }

    const displayName = (name || fullName || "").trim();
    if (!displayName || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEmailFormatValid(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const isDeliverableDomain = await hasDeliverableDomain(normalizedEmail);
    if (!isDeliverableDomain) {
      return res.status(400).json({ message: "Please use a real email inbox you can access" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser?.isVerified) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = existingUser
      ? await User.findByIdAndUpdate(
          existingUser._id,
          {
            name: displayName,
            email: normalizedEmail,
            password: hashedPassword,
            googleId: null,
            isVerified: true,
            verificationOtp: null,
            verificationOtpExpiresAt: null,
          },
          { new: true }
        )
      : await User.create({
          name: displayName,
          email: normalizedEmail,
          password: hashedPassword,
          isVerified: true,
        });

    issueAuthSession(res, user);
    return res.status(201).json(authPayload(user));
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (process.env.DEBUG_AUTH === "true") {
      console.log("BODY:", { email });
    }

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEmailFormatValid(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Use Google sign-in for this account" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    issueAuthSession(res, user);

    return res.status(200).json(authPayload(user));
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.verificationOtp !== String(otp).trim() ||
      !user.verificationOtpExpiresAt ||
      user.verificationOtpExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpiresAt = null;
    await user.save();

    issueAuthSession(res, user);

    return res.status(200).json(authPayload(user));
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEmailFormatValid(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "Account not found for this email" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "This email is already verified. Please log in." });
    }

    const verificationState = createVerificationState();
    user.verificationOtp = verificationState.verificationOtp;
    user.verificationOtpExpiresAt = verificationState.verificationOtpExpiresAt;
    await user.save();

    await sendVerificationOtpEmail({
      email: user.email,
      name: user.name,
      otp: user.verificationOtp,
    });

    return res.status(200).json({
      email: user.email,
      message: "A fresh verification code has been sent",
    });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const requestAuthOtp = async (req, res) => {
  const { channel, email, phoneNumber, fullName, name, intent } = req.body;

  try {
    const normalizedIntent = intent === "signup" ? "signup" : "login";
    const displayName = (name || fullName || "").trim();

    if (!["email", "phone"].includes(channel)) {
      return res.status(400).json({ message: "Choose email or phone OTP" });
    }

    let user = null;
    let normalizedEmail = null;
    let normalizedPhoneNumber = null;

    if (channel === "email") {
      normalizedEmail = String(email || "").trim().toLowerCase();

      if (!isEmailFormatValid(normalizedEmail)) {
        return res.status(400).json({ message: "Enter a valid email address" });
      }

      const isDeliverableDomain = await hasDeliverableDomain(normalizedEmail);
      if (!isDeliverableDomain) {
        return res.status(400).json({ message: "Please use a real email inbox you can access" });
      }

      user = await User.findOne({ email: normalizedEmail });
    } else {
      normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

      if (!isPhoneFormatValid(normalizedPhoneNumber)) {
        return res.status(400).json({ message: "Enter a valid phone number with country code" });
      }

      user = await User.findOne({ phoneNumber: normalizedPhoneNumber });
    }

    if (normalizedIntent === "signup") {
      if (!displayName) {
        return res.status(400).json({ message: "Name is required to create your account" });
      }

      if (user?.isVerified && channel === "email") {
        return res.status(400).json({ message: "This email already has an account. Please log in." });
      }

      if (user?.isPhoneVerified && channel === "phone") {
        return res.status(400).json({ message: "This phone number already has an account. Please log in." });
      }

      const authOtpState = createAuthOtpState(channel);
      user = user
        ? await User.findByIdAndUpdate(
            user._id,
            {
              name: displayName || user.name,
              email: normalizedEmail || user.email,
              phoneNumber: normalizedPhoneNumber || user.phoneNumber,
              ...authOtpState,
            },
            { new: true }
          )
        : await User.create({
            name: displayName,
            email: normalizedEmail || `${Date.now()}@pending.looptalk.local`,
            phoneNumber: normalizedPhoneNumber,
            password: null,
            isVerified: channel === "phone" ? false : false,
            isPhoneVerified: false,
            ...authOtpState,
          });
    } else {
      if (!user) {
        return res.status(404).json({ message: `No account found for that ${channel === "phone" ? "phone number" : "email"}` });
      }

      user.authOtp = generateOtp();
      user.authOtpExpiresAt = new Date(Date.now() + verificationWindowMs);
      user.authOtpChannel = channel;
      await user.save();
    }

    await sendOtpByChannel({
      channel,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      otp: user.authOtp,
    });

    return res.status(200).json({
      channel,
      destination: channel === "phone" ? user.phoneNumber : user.email,
      message: `OTP sent to your ${channel}`,
    });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyAuthOtp = async (req, res) => {
  const { channel, email, phoneNumber, otp } = req.body;

  try {
    if (!otp || !channel) {
      return res.status(400).json({ message: "OTP and channel are required" });
    }

    let user = null;

    if (channel === "phone") {
      const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

      if (!isPhoneFormatValid(normalizedPhoneNumber)) {
        return res.status(400).json({ message: "Enter a valid phone number with country code" });
      }

      user = await User.findOne({ phoneNumber: normalizedPhoneNumber });
    } else {
      const normalizedEmail = String(email || "").trim().toLowerCase();

      if (!isEmailFormatValid(normalizedEmail)) {
        return res.status(400).json({ message: "Enter a valid email address" });
      }

      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (
      user.authOtp !== String(otp).trim() ||
      user.authOtpChannel !== channel ||
      !user.authOtpExpiresAt ||
      user.authOtpExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (channel === "phone") {
      user.isPhoneVerified = true;
    } else {
      user.isVerified = true;
    }

    user.authOtp = null;
    user.authOtpExpiresAt = null;
    user.authOtpChannel = null;
    await user.save();

    issueAuthSession(res, user);
    return res.status(200).json(authPayload(user));
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resendAuthOtp = async (req, res) => {
  const { channel, email, phoneNumber } = req.body;

  try {
    if (!channel) {
      return res.status(400).json({ message: "Channel is required" });
    }

    let user = null;

    if (channel === "phone") {
      const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

      if (!isPhoneFormatValid(normalizedPhoneNumber)) {
        return res.status(400).json({ message: "Enter a valid phone number with country code" });
      }

      user = await User.findOne({ phoneNumber: normalizedPhoneNumber });
    } else {
      const normalizedEmail = String(email || "").trim().toLowerCase();

      if (!isEmailFormatValid(normalizedEmail)) {
        return res.status(400).json({ message: "Enter a valid email address" });
      }

      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const authOtpState = createAuthOtpState(channel);
    user.authOtp = authOtpState.authOtp;
    user.authOtpExpiresAt = authOtpState.authOtpExpiresAt;
    user.authOtpChannel = authOtpState.authOtpChannel;
    await user.save();

    await sendOtpByChannel({
      channel,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      otp: user.authOtp,
    });

    return res.status(200).json({
      channel,
      destination: channel === "phone" ? user.phoneNumber : user.email,
      message: "A fresh OTP has been sent",
    });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEmailFormatValid(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const isDeliverableDomain = await hasDeliverableDomain(normalizedEmail);
    if (!isDeliverableDomain) {
      return res.status(400).json({ message: "Please use a real email inbox you can access" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({ message: "If that account exists, a reset link has been sent" });
    }

    const rawToken = generateResetToken();
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpiresAt = new Date(Date.now() + resetWindowMs);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl,
    });

    return res.status(200).json({ message: "Password reset instructions sent" });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({ message: "Google OAuth is not configured" });
    }

    const token = req.body?.token || req.query?.token;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      return res.status(400).json({ message: "Invalid Google account" });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        avatar: payload.picture || "",
        isVerified: true,
      });
    } else {
      user.googleId = payload.sub;
      user.avatar = payload.picture || user.avatar;
      user.isVerified = true;
      await user.save();
    }

    issueAuthSession(res, user);
    return res.status(200).json(authPayload(user));
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Google sign-in failed" });
  }
};

export const googleAuthConfig = (_req, res) => {
  return res.status(200).json({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    enabled: Boolean(process.env.GOOGLE_CLIENT_ID),
  });
};

export const logout = (_req, res) => {
  try {
    clearAuthCookie(res);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, avatar } = req.body;
    const userId = req.user._id;
    const nextAvatar = profilePic || avatar;

    if (!nextAvatar) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(nextAvatar, {
      folder: "looptalk/avatars",
    });
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: uploadResponse.secure_url },
      { new: true }
    ).select("-password");

    return res.status(200).json(authPayload(updatedUser));
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(authPayload(req.user));
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
