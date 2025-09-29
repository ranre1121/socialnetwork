import { addPost, getFeedPosts } from "../controllers/postsControllers.js";
import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddlewares.js";
const router = Router();
router.post("/create", verifyToken, addPost);
router.get("/feed", verifyToken, getFeedPosts);
export default router;
//# sourceMappingURL=postsRoutes.js.map