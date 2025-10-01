// routes/messageRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddlewares.js";
import {
  getConversations,
  getMessages,
} from "../controllers/messagesControllers.js";

const router = Router();

router.get("/conversations", verifyToken, getConversations);
router.get("/:username", verifyToken, getMessages);

export default router;
