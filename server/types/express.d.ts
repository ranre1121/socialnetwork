import { JwtPayload } from "jsonwebtoken";
import type { User } from "./types";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload & User; // adjust type as needed
  }
}
