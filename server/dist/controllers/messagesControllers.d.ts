import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(message: any): Promise<"No user found" | "No chat found" | ({
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
//# sourceMappingURL=messagesControllers.d.ts.map