import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(sender: string, receiver: string, content: string): Promise<"No user found" | "no chat found" | {
    sender: string;
    receiver: string;
    content: string;
    sentAt: Date;
} | null>;
export declare function getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function readMessage(reader: string, messageId: number): Promise<"No user found" | "no chat found" | {
    id: number;
    participant1Id: number;
    participant2Id: number;
    createdAt: Date;
    lastMessageId: number | null;
} | null>;
//# sourceMappingURL=messagesControllers.d.ts.map