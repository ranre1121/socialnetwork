import type { Request, Response } from "express";
/**
 * Get all conversations (latest message + usernames)
 */
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(sender: string, receiver: string, content: string): Promise<{
    id: number;
    sentAt: Date;
    chatId: number;
    content: string;
    senderId: string;
    receiverId: string;
} | null>;
export declare function getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messagesControllers.d.ts.map