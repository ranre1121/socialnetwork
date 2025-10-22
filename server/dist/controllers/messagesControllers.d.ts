import type { Request, Response } from "express";
export declare function getConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addMessage(sender: string, receiver: string, content: string): Promise<null | undefined>;
export declare function getMessages(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=messagesControllers.d.ts.map