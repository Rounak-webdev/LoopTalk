import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const extractBearerToken = (header = "") => {
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7);
};

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || extractBearerToken(req.headers.authorization);

    if (process.env.DEBUG_AUTH === "true") {
      console.log("AUTH CHECK:", {
        method: req.method,
        url: req.originalUrl,
        hasCookieToken: Boolean(req.cookies.jwt),
        hasBearerToken: Boolean(extractBearerToken(req.headers.authorization)),
      });
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("ERROR:", error);

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
