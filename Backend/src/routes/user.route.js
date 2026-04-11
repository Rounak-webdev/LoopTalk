import express from "express";
import { getContacts, getCurrentUser } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getContacts);
router.get("/me", protectRoute, getCurrentUser);

export default router;
