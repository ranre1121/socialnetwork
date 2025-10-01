export type Message = {
    id: number;
    sender: string;
    receiver: string;
    content: string;
    createdAt: string;
};
export declare function loadMessages(): Message[];
export declare function saveMessages(messages: Message[]): void;
export declare function addMessage(sender: string, receiver: string, content: string): Message;
export declare function getChat(sender: string, receiver: string): Message[];
//# sourceMappingURL=messagesUtils.d.ts.map