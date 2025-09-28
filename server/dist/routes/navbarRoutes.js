import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddlewares.js";
import { getUsername } from "../controllers/navbarController.js";
const router = Router();
router.get("/username", verifyToken, getUsername);
export default router;
//# sourceMappingURL=navbarRoutes.js.map