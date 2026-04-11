import jwt from "jsonwebtoken";

const sevenDays = 7 * 24 * 60 * 60 * 1000;

export const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const setAuthCookie = (res, token) => {
  res.cookie("jwt", token, {
    maxAge: sevenDays,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const clearAuthCookie = (res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const issueAuthSession = (res, user) => {
  const token = signAccessToken({ userId: user._id.toString(), email: user.email });
  setAuthCookie(res, token);
  return token;
};
