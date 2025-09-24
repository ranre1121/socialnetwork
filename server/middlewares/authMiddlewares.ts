import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const userToken = authHeader?.split(" ")[1];

  if (!userToken) return res.status(400).json({ msg: "No token provided" });
  try {
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET as string);
    //@ts-ignore
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token is not valid" });
  }
}
