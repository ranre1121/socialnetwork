import { Router } from "express";
import {
  addRequest,
  cancelRequest,
  findFriends,
} from "../controllers/friendsControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

router.post("/find", verifyToken, findFriends);
router.post("/add", verifyToken, addRequest);
router.post("/cancel", verifyToken, cancelRequest);

export default router;
