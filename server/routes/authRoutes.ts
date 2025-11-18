import { Router } from "express";
import {
  registerUser,
  loginUser,
  verify,
} from "../controllers/authControllers.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify", verify);

export default router;
