import { Router } from "express";
import { findFriends } from "../controllers/friendsControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

router.post("/find", verifyToken, findFriends);

export default router;
