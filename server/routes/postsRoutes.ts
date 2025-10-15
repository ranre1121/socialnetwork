import {
  addComment,
  addPost,
  deletePost,
  getFeedPosts,
  likePost,
} from "../controllers/postsControllers.js";
import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

router.post("/create", verifyToken, addPost);
router.get("/feed", verifyToken, getFeedPosts);
router.delete("/:id", verifyToken, deletePost);
router.post("/like/:id", verifyToken, likePost);
router.post("/comment/:id", verifyToken, addComment);

export default router;
