import crypto from "crypto";

export const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

export const generateResetToken = () => crypto.randomBytes(32).toString("hex");

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
