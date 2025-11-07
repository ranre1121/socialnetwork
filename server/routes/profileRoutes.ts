import { Router } from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePic,
} from "../controllers/profileControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

router.get("/:username", verifyToken, getProfile);
router.put("/update", verifyToken, uploadProfilePic, updateProfile);

export default router;
