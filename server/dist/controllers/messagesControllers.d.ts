import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(sender: string, receiver: string, content: string): Promise<{
    id: number;
    chatId: number;
    content: string;
    senderId: number;
    receiverId: number;
    sentAt: Date;
    senderUsername: string;
    receiverUsername: string;
} | null>;
export declare function getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messagesControllers.d.ts.map