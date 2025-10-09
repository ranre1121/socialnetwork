import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
export declare function addMessage(sender: string, receiver: string, content: string): Promise<{
    id: number;
    content: string;
    senderId: string;
    receiverId: string;
    sentAt: Date;
    chatId: number;
} | null>;
export declare function getMessages(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=messagesControllers.d.ts.map