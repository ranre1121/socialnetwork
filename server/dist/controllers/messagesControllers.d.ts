import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(message: any): Promise<"No user found" | "no chat found" | ({
    sender: {
        username: string;
    };
    receiver: {
        username: string;
    };
} & {
    id: number;
    tempId: string;
    chatId: number;
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: Date;
}) | null>;
export declare function getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function readMessage(reader: string, messageId: number): Promise<"No user found" | "Message was not found" | {
    id: number;
    readAt: Date;
    userId: number;
    messageId: number;
} | null>;
//# sourceMappingURL=messagesControllers.d.ts.map