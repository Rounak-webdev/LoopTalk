import express from "express";
import {
  checkAuth,
  forgotPassword,
  googleAuthConfig,
  googleAuth,
  login,
  logout,
  resetPassword,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/google-config", googleAuthConfig);
router.get("/google", googleAuth);
router.post("/google", googleAuth);
router.get("/logout", logout);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;
