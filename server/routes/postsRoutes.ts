import {
  addPost,
  deletePost,
  getFeedPosts,
} from "../controllers/postsControllers.js";
import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

router.post("/create", verifyToken, addPost);
router.get("/feed", verifyToken, getFeedPosts);
router.delete("/delete/:id", verifyToken, deletePost);

export default router;
