import { sendEmail } from "../config/mail.js";

export const sendVerificationOtpEmail = async ({ email, name, otp }) => {
  const subject = "Verify your LoopTalk account";
  const text = `Hi ${name}, your LoopTalk verification code is ${otp}. It expires in 10 minutes.`;

  await sendEmail({
    to: email,
    subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Verify your LoopTalk account</h2>
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:8px;margin:24px 0">${otp}</div>
      <p>This code expires in 10 minutes.</p>
    </div>`,
  });
};

export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const subject = "Reset your LoopTalk password";
  const text = `Hi ${name}, reset your LoopTalk password here: ${resetUrl}`;

  await sendEmail({
    to: email,
    subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Reset your LoopTalk password</h2>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
    </div>`,
  });
};
