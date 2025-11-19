import { Router } from "express";
import { registerUser, loginUser, welcome, } from "../controllers/authControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";
const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/welcome", verifyToken, welcome);
export default router;
//# sourceMappingURL=authRoutes.js.map