import { addPost, getFeedPosts } from "../controllers/postsControllers.js";
import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

router.post("/create", verifyToken, addPost);
router.post("/feed", verifyToken, getFeedPosts);

export default router;
