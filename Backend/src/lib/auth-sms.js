const smsWebhookUrl = process.env.SMS_WEBHOOK_URL || "";

export const sendPhoneOtp = async ({ name, otp, phoneNumber }) => {
  const text = `Hi ${name || "there"}, your LoopTalk OTP is ${otp}. It expires in 10 minutes.`;

  if (!smsWebhookUrl) {
    console.log(`SMS transport not configured. Intended SMS for ${phoneNumber}: ${text}`);
    return { mocked: true };
  }

  const response = await fetch(smsWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.SMS_WEBHOOK_TOKEN
        ? { Authorization: `Bearer ${process.env.SMS_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      to: phoneNumber,
      message: text,
      otp,
      app: "LoopTalk",
    }),
  });

  if (!response.ok) {
    throw new Error(`SMS delivery failed with status ${response.status}`);
  }

  return response.json().catch(() => ({ delivered: true }));
};
