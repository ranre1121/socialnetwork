import { Router } from "express";
import { addRequest, findFriends } from "../controllers/friendsControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";
const router = Router();
router.post("/find", verifyToken, findFriends);
router.post("/add", verifyToken, addRequest);
export default router;
//# sourceMappingURL=friendsRoutes.js.map