import { Router } from "express";
import { registerUser } from "../controllers/authControllers.js";
const router = Router();
router.post("/register", registerUser);
export default router;
//# sourceMappingURL=authRoutes.js.map