import type { Request, Response } from "express";
/**
 * Get all conversations (latest message + usernames)
 */
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(sender: string, receiver: string, content: string): Promise<{
    content: string;
    senderId: string;
    receiverId: string;
    sentAt: Date;
    id: number;
    chatId: number;
} | null>;
export declare function getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messagesControllers.d.ts.map