import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(tempId: string, sender: string, receiver: string, content: string): Promise<{
    id: number;
    receiverId: number;
    tempId: string;
    chatId: number;
    senderId: number;
    content: string;
    sentAt: Date;
} | "No user found" | "no chat found" | null>;
export declare function getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function readMessage(reader: string, messageId: number): Promise<"No user found" | "Message was not found" | {
    id: number;
    readAt: Date;
    userId: number;
    messageId: number;
} | null>;
//# sourceMappingURL=messagesControllers.d.ts.map