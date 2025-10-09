import "express";
import type { JwtPayload } from "jsonwebtoken";

declare module "express" {
  export interface Request {
    user?: {
      username?: string;
    };
  }
}
