import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(message: any): Promise<"No user found" | "No chat found" | ({
    receiver: {
        username: string;
    };
    sender: {
        username: string;
    };
} & {
    id: number;
    chatId: number;
    receiverId: number;
    sentAt: Date;
    tempId: string;
    countId: number;
    senderId: number;
    content: string;
}) | null>;
export declare function getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messagesControllers.d.ts.map