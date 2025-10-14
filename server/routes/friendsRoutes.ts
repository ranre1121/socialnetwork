import { Router } from "express";
import {
  addRequest,
  cancelRequest,
  findFriends,
  acceptRequest,
  declineRequest,
  getRequests,
  listFriends,
  deleteFriend,
} from "../controllers/friendsControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

router.get("/find", verifyToken, findFriends);

router.post("/add", verifyToken, addRequest);

router.post("/cancel", verifyToken, cancelRequest);

router.post("/accept", verifyToken, acceptRequest);

router.post("/decline", verifyToken, declineRequest);

router.get("/requests", verifyToken, getRequests);

router.get("/list/:username", verifyToken, listFriends);

router.post("/delete", verifyToken, deleteFriend);

export default router;
