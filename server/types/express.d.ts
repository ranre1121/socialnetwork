import type { User } from "./types"; // adjust import path

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
