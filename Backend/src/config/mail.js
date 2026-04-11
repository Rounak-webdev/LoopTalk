import nodemailer from "nodemailer";

let transporter;

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ html, subject, text, to }) => {
  transporter ??= createTransporter();

  if (!transporter) {
    console.log(`Email transport not configured. Intended email for ${to}: ${subject}`);
    console.log(text || html);
    return { mocked: true };
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `"LoopTalk" <${process.env.EMAIL_USER}>`,
    html,
    subject,
    text,
    to,
  });
};
