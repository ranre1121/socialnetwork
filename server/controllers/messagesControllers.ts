import type { Request, Response } from "express";

export function getConversations(req: Request, res: Response) {
  try {
    const sender = (req as any).user?.username;
    if (!sender) return res.status(401).json({ message: "Unauthorized" });
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export function getMessages(req: Request, res: Response) {
  try {
    const sender = (req as any).user?.username;
    if (!sender) return res.status(401).json({ message: "Unauthorized" });

    const friendUsername = req.params.username;
    if (!friendUsername)
      return res.status(400).json({ message: "Missing friend username" });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
