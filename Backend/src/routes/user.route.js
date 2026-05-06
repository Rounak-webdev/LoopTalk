import express from "express";
import { getContacts, getCurrentUser, removeFriend } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getContacts);
router.get("/me", protectRoute, getCurrentUser);
router.delete("/:id", protectRoute, removeFriend);

export default router;
