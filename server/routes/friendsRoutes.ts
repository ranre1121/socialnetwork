import { Router } from "express";
import {
  addRequest,
  cancelRequest,
  findFriends,
  acceptRequest,
  declineRequest,
  getRequests,
} from "../controllers/friendsControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

// 🔍 Search for users to add
router.post("/find", verifyToken, findFriends);

// ➕ Send a friend request
router.post("/add", verifyToken, addRequest);

// ❌ Cancel a friend request
router.post("/cancel", verifyToken, cancelRequest);

// ✅ Accept a friend request
router.post("/accept", verifyToken, acceptRequest);

// 🚫 Reject a friend request
router.post("/decline", verifyToken, declineRequest);

// 📥 Get all friend requests for the current user
router.post("/requests", verifyToken, getRequests);

export default router;
