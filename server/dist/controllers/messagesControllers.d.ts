import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(sender: string, receiver: string, content: string): Promise<{
    id: number;
    sentAt: Date;
    chatId: number;
    senderId: number;
    receiverId: number;
    content: string;
} | null>;
export declare function getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messagesControllers.d.ts.map