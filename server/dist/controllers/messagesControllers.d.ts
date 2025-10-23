import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(sender: string, receiver: string, content: string): Promise<"No user found" | "no chat found" | null | undefined>;
export declare function getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | "no chat found" | undefined>;
//# sourceMappingURL=messagesControllers.d.ts.map