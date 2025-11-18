import { Router } from "express";
import {
  registerUser,
  loginUser,
  userContext,
} from "../controllers/authControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verifyToken, userContext);

export default router;
