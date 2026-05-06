import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteConversation, getUsersForSidebar, getMessages ,sendMessage } from "../controllers/message.controller.js";

const router= express.Router();


router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.delete("/:id", protectRoute, deleteConversation);
router.post("/send", protectRoute, sendMessage);
router.post("/send/:id", protectRoute, sendMessage);

export default router;
